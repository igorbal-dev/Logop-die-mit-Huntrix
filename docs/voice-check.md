# Проверка озвучки

Создаётся `tools/tts.py`. Распознавание речи сравнивает запись с текстом; DNSMOS — оценка чистоты звука (1–5).
Распознавание не гарантирует естественность — сомнительное надо послушать (родительский раздел → Озвучка).

Всего реплик: 713. Не совпало с текстом: 5. Низкая чистота звука: 35.

## Не совпало с текстом — послушать

| Ключ | Текст | Распознано |
| --- | --- | --- |
| t2_s_si | Sie! | Z |
| t3_g_zug_ende | Tschu-tschu! Der Zug fährt los! | Chuchu.  Der Zug fährt los. |
| t3_jetzt_du | Jetzt du! | Jedz du. |
| t3_r_s | Sa, so, su, si. | Za, so, so, sie. |
| t3_specht | Der Specht klopft: Kah, kah, kah! | Der Specht klopft, K, K, K. |

## Низкая чистота звука — послушать

| Ключ | Текст | DNSMOS |
| --- | --- | --- |
| t1_nochmal | Und noch einmal! | 2.51 |
| t1_ru_schlange | Посвисти, как змейка: ссс! | 2.3 |
| t2_hoer2_ch | Ist da ein Chhh drin? | 2.16 |
| t2_hoer2_fw | Ist da ein Fff oder Wah drin? | 2.29 |
| t2_hoer2_s | Ist da ein Sss drin? | 2.1 |
| t2_klatsch_sch | Wenn du Schhh hörst, klatsch auf die Hand! | 2.51 |
| t2_maeh | Mäh! | 2.58 |
| t2_r_la | Lah, lah, lah. | 2.55 |
| t2_s_mi | Mie! | 2.32 |
| t2_s_scho | Schoh! | 2.49 |
| t2_s_schu | Schuh! | 2.49 |
| t2_w_bus | Bus! | 2.53 |
| t2_w_frosch | Frosch! | 2.31 |
| t2_w_fuss | Fuß! | 2.54 |
| t2_w_kuchen | Kuchen! | 2.52 |
| t2_w_licht | Licht! | 2.46 |
| t2_w_ring | Ring! | 2.31 |
| t2_w_schiff | Schiff! | 2.59 |
| t2_w_schuh | Schuh! | 2.49 |
| t2_w_zug | Zug! | 2.52 |
| t3_r_ch | Ich, ich, mich, dich. | 2.39 |
| t3_rr_s | Ass, oss, uss, iss. | 2.58 |
| t3_rr_sch | Asch, osch, usch, isch. | 2.32 |
| t3_u_kurz | Uuh! | 2.44 |
| t3_w_frosch | Frosch! | 2.48 |
| t3_w_kuchen | Kuchen! | 2.56 |
| t3_w_kuh | Kuh! | 2.38 |
| t3_w_licht | Licht! | 2.23 |
| t3_w_milch | Milch! | 2.59 |
| t3_w_nudel | Nudel! | 2.59 |
| t3_w_ring | Ring! | 2.38 |
| t3_w_schiff | Schiff! | 2.35 |
| t3_w_schuh | Schuh! | 2.43 |
| t3_w_tuer | Tür! | 2.38 |
| t3_w_zebra | Zebra! | 2.39 |
