#!/usr/bin/env python3
"""Записи Chatterbox (ветка claude/voice, папка samples/chatterbox/) -> assets/snd/<ключ>.mp3
   python3 tools/voice_import.py <папка с wav> [--force]
   Обрезка тишины по краям, громкость выровнена, 24 кГц моно mp3 48 кбит/с. Слишком длинная запись («бормотание» после
   короткой фразы) обрезается по длине текста с затуханием. Уже имеющиеся файлы не трогает (--force — заменить)."""
import sys, os, re, glob, json, subprocess
TEXT = {}
for f in glob.glob('content/*/lines.json'):
    TEXT.update({k: v['text'] for k, v in json.load(open(f, encoding='utf-8'))['lines'].items()})
def max_len(t): return 0.9 + 0.11*len(re.sub(r'[^\w]', '', t))*1.5
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout or 0)
af = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,'
      'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,loudnorm=I=-16:TP=-1.5:LRA=11')
os.makedirs('assets/snd', exist_ok=True)
n = 0
for w in sorted(glob.glob(os.path.join(sys.argv[1], '*.wav'))):
    key = os.path.basename(w).split('__')[0]
    dst = f'assets/snd/{key}.mp3'
    if key not in TEXT or (os.path.exists(dst) and '--force' not in sys.argv): continue
    f = af
    d, m = dur(w), max_len(TEXT[key])
    if d > m:
        f = f'atrim=0:{m:.2f},afade=t=out:st={max(0, m - 0.25):.2f}:d=0.25,' + f; print('обрезано', key, round(d, 1), '->', round(m, 1))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', f, '-ar', '24000', '-ac', '1', '-b:a', '48k', dst], check=True)
    n += 1
print(n, 'записей добавлено')
