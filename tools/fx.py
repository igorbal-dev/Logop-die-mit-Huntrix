"""Звуки-шипения из настоящего голоса (вместо искусственного шума, с 11.11).
Синтезатор речи не умеет сказать отдельно «ссс» / «шшш» (читает буквы). Поэтому берём слово, где звук стоит в конце
(Eis → с, Tisch → ш, ich → хь, auf → ф; в слове не должно быть другого шипящего), вырезаем из него сам звук и растягиваем: кусочки по 50 мс
накладываются друг на друга со сглаживанием (шум «склеивается» без швов). Громкость — как у речи (−16 LUFS).
Используется tools/tts.py: поле «synth» в реплике (s, sch, ch, f, zug — ритм паровоза «ш-ш-ш-ш») и вставки {s} {sch} {ch} {f}
внутри фразы («Hörst du diesen Laut: {sch}?»)."""
import asyncio, os, subprocess, tempfile
import numpy as np

SR = 24000
SRC = {'s': ['Eis.', 'Haus.', 'Bus.'], 'sch': ['Tisch.', 'Busch.', 'rasch.'], 'ch': ['ich.', 'mich.', 'dich.'], 'f': ['auf.', 'Hof.', 'Huf.']}
_cache = {}


def _pcm(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def _fric(x):
    """самый длинный отрезок шума в конце слова: много переходов через ноль и достаточно громко"""
    n = int(0.01*SR); fr = len(x)//n
    rms = np.array([np.sqrt(np.mean(x[i*n:(i + 1)*n]**2)) + 1e-9 for i in range(fr)])
    zc = np.array([np.mean(np.abs(np.diff(np.sign(x[i*n:(i + 1)*n]))) > 0) for i in range(fr)])
    db = 20*np.log10(rms); on = (zc > 0.14) & (db > db.max() - 32)
    best, cur, st = (0, 0), 0, 0
    for i, v in enumerate(on):
        if v:
            if cur == 0: st = i
            cur += 1
            if cur > best[1] - best[0]: best = (st, i + 1)
        else: cur = 0
    a, b = best; a, b = a + 2, b - 2                     # без краёв (переход от гласной, затухание)
    return x[a*n:b*n] if b - a >= 6 else None


def _stretch(seg, dur, seed=1):
    """растянуть шум до dur секунд: случайные кусочки по 50 мс, перекрытие 50 %, окно Ханна (сумма окон = 1)"""
    rng = np.random.default_rng(seed)
    g = int(0.05*SR); h = g//2; w = np.hanning(g)
    out = np.zeros(int(dur*SR) + g)
    for pos in range(0, len(out) - g, h):
        s = rng.integers(0, max(1, len(seg) - g))
        out[pos:pos + g] += seg[s:s + g]*w if len(seg) >= g else np.pad(seg, (0, g - len(seg)))*w
    return out[:int(dur*SR)]


async def _source(kind, synth, voice):
    key = (kind, voice)
    if key in _cache: return _cache[key]
    best = None
    with tempfile.TemporaryDirectory() as t:
        for i, word in enumerate(SRC[kind]):
            f = os.path.join(t, f'{i}.mp3')
            await synth(word, voice, '-20%', '+0Hz', f)
            seg = _fric(_pcm(f))
            if seg is not None and (best is None or len(seg) > len(best)): best = seg
    if best is None: raise RuntimeError(f'не нашёл звук {kind} в словах {SRC[kind]}')
    _cache[key] = best
    return best


def _env(x, att=0.08, rel=0.2):
    n = len(x); e = np.ones(n); a = int(att*SR); r = int(rel*SR)
    e[:a] = np.linspace(0, 1, a)**1.5; e[n - r:] = np.linspace(1, 0, r)**1.5
    return x*e


async def sound(kind, synth, voice, dur=1.4):
    """kind: s / sch / ch / f — ровный звук; zug — паровоз «ш-ш-ш-ш» (ритм, ускоряется); short_* — короткий (для вставки во фразу)"""
    if kind == 'z':                                     # «тс»: короткий щелчок кончиком языка + короткое «с»
        seg = await _source('s', synth, voice)
        rng = np.random.default_rng(3); burst = rng.standard_normal(int(0.012*SR))*np.linspace(1, 0, int(0.012*SR))*0.6
        x = np.concatenate([burst, _env(_stretch(seg, min(dur, 0.22)), 0.01, 0.08)])
    elif kind == 'zug':
        seg = await _source('sch', synth, voice); parts = []
        for i, (on, off) in enumerate([(0.22, 0.16), (0.2, 0.14), (0.18, 0.12), (0.16, 0.1), (0.15, 0.09), (0.15, 0.0)]):
            parts.append(_env(_stretch(seg, on, i), 0.025, 0.07)); parts.append(np.zeros(int(off*SR)))
        x = np.concatenate(parts)
    else:
        seg = await _source(kind, synth, voice)
        x = _env(_stretch(seg, dur))
    return x/(np.abs(x).max() + 1e-9)*0.8


# тембр под динамик телефона: «с» — опустить самый верх (телефон его почти не играет), поднять 6–7 кГц;
# «ш» — темнее и круглее (губы рупором), «хь» — светлее «ш», без низа; «ф» — мягкий широкий шум, чуть тише
EQ = {'s': 'highshelf=f=10000:g=-6,equalizer=f=6500:t=q:w=1.2:g=6', 'z': 'highshelf=f=10000:g=-6,equalizer=f=6500:t=q:w=1.2:g=6',
      'sch': 'equalizer=f=2800:t=q:w=1:g=7,highshelf=f=7000:g=-8', 'zug': 'equalizer=f=2800:t=q:w=1:g=7,highshelf=f=7000:g=-8',
      'ch': 'highpass=f=3400,equalizer=f=5500:t=q:w=1:g=5,highshelf=f=9500:g=-6', 'f': 'highshelf=f=10000:g=-4'}
LUFS = {'f': -17}


def write(x, out, kind=None, lufs=None):
    lufs = lufs or LUFS.get(kind, -16)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t: pass
    _wav(x, t.name)
    af = (EQ[kind] + ',' if kind in EQ else '') + f'loudnorm=I={lufs}:TP=-1.5'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', t.name, '-af', af, '-ar', str(SR), '-ac', '1', '-b:a', '48k', out], check=True)
    os.unlink(t.name)


def _wav(x, f):
    import wave
    y = (np.clip(x, -1, 1)*32767).astype('<i2')
    with wave.open(f, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())


def wav_of(f):
    return _pcm(f)


if __name__ == '__main__':
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    from tts import synth
    async def m():
        for k in ['s', 'sch', 'ch', 'f', 'zug', 'z']:
            x = await sound(k, synth, 'de-DE-KatjaNeural'); write(x, f'/tmp/fx_{k}.mp3', k); x = wav_of(f'/tmp/fx_{k}.mp3')
            X = np.abs(np.fft.rfft(x))**2; fr = np.fft.rfftfreq(len(x), 1/SR)
            print(k, 'сек', round(len(x)/SR, 2), 'центр Гц', int((X*fr).sum()/X.sum()))
    asyncio.run(m())
