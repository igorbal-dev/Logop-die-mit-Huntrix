#!/usr/bin/env python3
"""Реплики -> список для Chatterbox.  python3 tools/voice_queue.py
   Берёт content/*/lines.json, пишет tools/chatterbox/probes.json (только ключи, у которых ещё нет assets/snd/<ключ>.mp3).
   Голос: t1/t2/t3 (немецкий), t1_ru/t2_ru/t3_ru (русский) — образцы в tools/chatterbox/voices/.
   Потом commit + push ветки claude/voice -> GitHub Actions сам озвучит (workflow voice.yml) -> tools/voice_import.py."""
import json, glob, os
probes = []
for f in sorted(glob.glob('content/*/lines.json')):
    for k, v in json.load(open(f, encoding='utf-8'))['lines'].items():
        if os.path.exists(f'assets/snd/{k}.mp3'): continue
        voice = f"t{v['t']}" + ('_ru' if v['lang'] == 'ru' else '')
        probes.append({'id': k, 'model': 'mtl', 'lang': v['lang'], 'presets': ['A'], 'voice': voice, 'text': v['text']})
cfg = {'_comment': 'Создаётся tools/voice_queue.py из content/*/lines.json. Руками не править.',
       'presets': {'A': {'exaggeration': 0.6, 'cfg_weight': 0.5, 'temperature': 0.8}}, 'probes': probes}
json.dump(cfg, open('tools/chatterbox/probes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(probes), 'реплик в очереди')
