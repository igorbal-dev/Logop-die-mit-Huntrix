#!/usr/bin/env python3
"""Озвучка реплик Speech Academy + автоматическая проверка.

   python3 tools/tts.py                 озвучить реплики, у которых ещё нет assets/snd/<ключ>.mp3
   python3 tools/tts.py --all           переозвучить всё
   python3 tools/tts.py --keys a,b      переозвучить эти ключи
   python3 tools/tts.py --check         только проверить готовые записи (ничего не генерировать)

Голоса — config/voices.json (нейронные голоса Microsoft через edge-tts). Каждая запись:
  1) генерируется, обрезается тишина по краям, громкость выравнивается (24 кГц моно mp3);
  2) проверяется распознаванием речи (Whisper large-v3-turbo): текст записи сравнивается с оригиналом;
     не совпало — до 2 новых попыток с другим темпом, берётся лучшая;
  3) оценивается «чистота звука» (DNSMOS) — низкая оценка = артефакты.
Итог — tools/voice_report.json и docs/voice-check.md (что послушать человеку). Распознавание не гарантирует,
что голос звучит естественно, поэтому сомнительные реплики помечаются для прослушивания (родительский раздел → Озвучка).

Нужно: pip install edge-tts faster-whisper speechmos onnxruntime jiwer numpy (см. tools/requirements-voice.txt).
В облачной сессии Claude: прокси — SSL_CERT_FILE=/root/.ccr/ca-bundle.crt (скрипт сам подхватывает)."""
import argparse, asyncio, glob, json, os, re, ssl, subprocess, sys, tempfile, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CA = '/root/.ccr/ca-bundle.crt'
AF = ('silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.04,areverse,'
      'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.10,areverse,loudnorm=I=-16:TP=-1.5:LRA=11')


def load_lines():
    L = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', '*', 'lines.json'))):
        L.update(json.load(open(f, encoding='utf-8'))['lines'])
    return L


def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = re.sub(r'\[[^\]]*\]', '', s)
    s = re.sub(r'[^\w]', '', s)                       # без пробелов, дефисов, знаков: «Sprech-Akademie» = «Sprechakademie»
    s = re.sub(r'([aeiouäöüаеиоуыэюя])h', r'\1', s)    # «Mah» = «Ma»
    s = re.sub(r'(.)\1+', r'\1', s)                    # «Aaa» = «A», «Mmm» = «M»
    return s.replace('ß', 'ss')


def cer(a, b):
    import jiwer
    a, b = norm(a), norm(b)
    if not a: return 0.0
    if not b: return 1.0
    return jiwer.cer(a, b)


def ffmpeg_clean(src, dst):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', AF, '-ar', '24000', '-ac', '1', '-b:a', '48k', dst], check=True)


def lufs(f):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', out)
    return float(m[-1]) if m else None


def level_fix(f, target=-16.0):
    """loudnorm на коротких записях промахивается на 3–6 дБ — меряем и подтягиваем (с ограничителем пиков)"""
    i = lufs(f)
    if i is None or i < -60 or abs(i - target) <= 1.5: return
    tmp = f + '.tmp.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', f'volume={target - i:.1f}dB,alimiter=limit=0.89', '-ar', '24000', '-ac', '1', '-b:a', '48k', tmp], check=True)
    os.replace(tmp, f)


def pcm16k(f):
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


class Checker:
    def __init__(self):
        from faster_whisper import WhisperModel
        self.m = WhisperModel(os.environ.get('WHISPER', 'large-v3-turbo'), device='cpu', compute_type='int8')
        try:
            from speechmos import dnsmos
            self.mos = dnsmos
        except Exception:
            self.mos = None

    def __call__(self, f, text, lang):
        import numpy as np
        y = pcm16k(f)
        if len(y) < 1600: return {'hyp': '', 'cer': 1.0, 'mos': 0, 'dur': 0}
        short = len(norm(text)) <= 6
        # короткое слово/слог: подсказываем распознавателю ожидаемый текст (иначе «Ma» он слышит как что угодно)
        segs, _ = self.m.transcribe(y.astype(np.float32), language=lang, beam_size=5, vad_filter=False,
                                    initial_prompt=text if short else None, condition_on_previous_text=False)
        hyp = ' '.join(s.text for s in segs).strip()
        mos = round(float(self.mos.run(y, sr=16000)['ovrl_mos']), 2) if self.mos else None
        return {'hyp': hyp, 'cer': round(cer(text, hyp), 2), 'mos': mos, 'dur': round(len(y)/16000, 2)}


def ok(line, r):
    n = len(norm(line['text']))
    lim = 0.34 if n <= 4 else 0.25 if n <= 10 else 0.15
    return r['cer'] <= lim


async def synth(text, voice, rate, pitch, out):
    import edge_tts
    import edge_tts.communicate as C
    if os.path.exists(CA): C._SSL_CTX = ssl.create_default_context(cafile=CA)
    px = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    last = None
    for a in range(8):
        try:
            await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, proxy=px).save(out)
            if os.path.getsize(out) > 1500: return
        except Exception as e:
            last = e
        await asyncio.sleep(2 + 2*a)
    raise RuntimeError(f'нет звука: {text} ({last})')


async def splice(text, voice, rate, pitch, out):
    """фраза со вставкой звука: «Hörst du diesen Laut? {sch} Dann tipp…» — куски текста говорит голос, между ними —
    сам звук из tools/fx.py (короткий, 0,8 с; {zug} — ритм паровоза), паузы по 0,15 с"""
    import fx, numpy as np
    parts, tmp = [], tempfile.mkdtemp()
    for j, chunk in enumerate(re.split(r'(\{\w+\})', text)):
        m = re.fullmatch(r'\{(\w+)\}', chunk)
        if m:
            f = os.path.join(tmp, f'{j}.mp3'); fx.write(await fx.sound(m.group(1), synth, voice, dur=0.8), f, m.group(1)); parts.append(fx.wav_of(f))
        else:
            chunk = chunk.strip(' ,;')
            if not re.search(r'\w', chunk): continue
            r, c = os.path.join(tmp, f'{j}r.mp3'), os.path.join(tmp, f'{j}.mp3')
            await synth(chunk, voice, rate, pitch, r); ffmpeg_clean(r, c); parts.append(fx.wav_of(c))
        parts.append(np.zeros(int(0.15*fx.SR)))
    w = os.path.join(tmp, 'all.wav'); fx._wav(np.concatenate(parts[:-1]), w)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-b:a', '64k', out], check=True)


def bump(rate, d):
    v = int(re.match(r'([+-]?\d+)', rate).group(1)) + d
    return f'{v:+d}%'


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--all', action='store_true'); ap.add_argument('--keys', default='')
    ap.add_argument('--check', action='store_true'); ap.add_argument('--nocheck', action='store_true')
    a = ap.parse_args()
    if os.path.exists(CA): os.environ.setdefault('SSL_CERT_FILE', CA); os.environ.setdefault('REQUESTS_CA_BUNDLE', CA)
    V = json.load(open(os.path.join(ROOT, 'config', 'voices.json'), encoding='utf-8'))['teachers']
    L = load_lines()
    rep_path = os.path.join(ROOT, 'tools', 'voice_report.json')
    rep = json.load(open(rep_path, encoding='utf-8')) if os.path.exists(rep_path) else {}
    rep = {k: v for k, v in rep.items() if k in L}
    keys = [k for k in a.keys.split(',') if k] or list(L)
    snd = lambda k: os.path.join(ROOT, 'assets', 'snd', f'{k}.mp3')
    if a.all: todo = [k for k in keys if rep.get(k, {}).get('eng') != 'edge1']     # --all продолжает с места остановки
    elif a.keys or a.check: todo = keys
    else: todo = [k for k in keys if not os.path.exists(snd(k))]
    chk = None if a.nocheck else Checker()
    os.makedirs(os.path.join(ROOT, 'assets', 'snd'), exist_ok=True)
    tmp = tempfile.mkdtemp()
    for i, k in enumerate(todo):
        line = L[k]; v = V[str(line['t'])][line['lang']]
        text = line.get('say', line['text'])           # say — как произносить (например «Sohi» для Zoey), text — что должно прозвучать
        if line.get('synth'):
            # «ссс» / «шшш» / «хь» / «ффф» / паровоз: синтезатор речи читает их по буквам, поэтому звук вырезается
            # из настоящего голоса учительницы (tools/fx.py) и растягивается; громкость — как у речи
            import fx
            fx.write(await fx.sound(line['synth'], synth, v['voice']), snd(k), line['synth'])
            rep[k] = {'text': line['text'], 'hyp': '(звук)', 'cer': 0.0, 'mos': None, 'eng': 'fx'}
            print(f'[{i + 1}/{len(todo)}] {k}: звук «{line["synth"]}» из голоса', flush=True)
            continue
        if a.check:
            if os.path.exists(snd(k)) and chk: rep[k] = dict(chk(snd(k), line.get('expect', line['text']), line['lang']), text=line['text'], tries=rep.get(k, {}).get('tries', 1))
            continue
        best = None
        try:
          # варианты: темп ± и альтернативные написания (alts) — берём тот, что распознаётся правильно
          r0 = v.get('rate', '+0%')
          variants = [(text, r0), (text, bump(r0, -10)), (text, bump(r0, +6))] + [(alt, r0) for alt in line.get('alts', [])] + [(alt, bump(r0, -10)) for alt in line.get('alts', [])]
          for t, (text, rate) in enumerate(variants):
              raw, out = os.path.join(tmp, f'{k}_{t}_raw.mp3'), os.path.join(tmp, f'{k}_{t}.mp3')
              try: await (splice if '{' in text else synth)(text, v['voice'], rate, v.get('pitch', '+0Hz'), raw); used = v['voice']
              except RuntimeError:
                  # голос не отвечает (бывает у Svetlana) — запасной голос
                  fb = 'de-DE-SeraphinaMultilingualNeural' if line['lang'] == 'ru' else v['voice']   # по-русски Seraphina говорит чисто
                  await synth(text, fb, rate, '+0Hz', raw); used = fb
              ffmpeg_clean(raw, out)
              r = chk(out, line.get('expect', line['text']), line['lang']) if chk else {'cer': 0, 'hyp': '', 'mos': None}
              r.update(text=line['text'], file=out, tries=t + 1, eng='edge1', voice=used)
              if best is None or r['cer'] < best['cer'] or (r['cer'] == best['cer'] and (r['mos'] or 0) > (best['mos'] or 0)):
                  best = r
              if not chk or ok(line, r): break
        except RuntimeError as e:
            print(f'[{i + 1}/{len(todo)}] {k}: ОШИБКА {e}', flush=True)
            if best is None: continue
        os.replace(best.pop('file'), snd(k))
        level_fix(snd(k))
        rep[k] = best
        if i % 10 == 9: json.dump(rep, open(rep_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
        flag = '' if ok(line, best) else '  ⚠ послушать'
        print(f'[{i + 1}/{len(todo)}] {k}: «{line["text"]}» -> «{best["hyp"]}» cer {best["cer"]} mos {best["mos"]}{flag}', flush=True)
    json.dump(rep, open(rep_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    # что послушать человеку
    bad = [(k, r) for k, r in rep.items() if not L[k].get('synth') and not ok(L[k], r)]
    low = [(k, r) for k, r in rep.items() if (r.get('mos') or 5) < 2.6 and ok(L[k], r)]
    md = ['# Проверка озвучки', '', 'Создаётся `tools/tts.py`. Распознавание речи сравнивает запись с текстом; DNSMOS — оценка чистоты звука (1–5).',
          'Распознавание не гарантирует естественность — сомнительное надо послушать (родительский раздел → Озвучка).', '',
          f'Всего реплик: {len(rep)}. Не совпало с текстом: {len(bad)}. Низкая чистота звука: {len(low)}.', '']
    if bad: md += ['## Не совпало с текстом — послушать', '', '| Ключ | Текст | Распознано |', '| --- | --- | --- |'] + [f'| {k} | {r["text"]} | {r["hyp"]} |' for k, r in sorted(bad)] + ['']
    if low: md += ['## Низкая чистота звука — послушать', '', '| Ключ | Текст | DNSMOS |', '| --- | --- | --- |'] + [f'| {k} | {r["text"]} | {r["mos"]} |' for k, r in sorted(low)] + ['']
    open(os.path.join(ROOT, 'docs', 'voice-check.md'), 'w', encoding='utf-8').write('\n'.join(md))
    print(f'готово: {len(todo)} записей, не совпало {len(bad)}, низкая чистота {len(low)}')

if __name__ == '__main__':
    asyncio.run(main())
