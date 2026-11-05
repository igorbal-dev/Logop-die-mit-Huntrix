# Speech Academy — картинки учительниц

Здесь перечислены все картинки, которые использует код. Лишних нет. Пока картинки нет, игра рисует заглушку: цветную фигуру с номером учительницы, а позы рта и языка нарисованы схематично. Занятие работает и с заглушками.

**С чего начать:** для каждой учительницы сначала нарисуй `…_face_neutral.png` — от неё зависят все остальные картинки лица (см. «Как рисовать в ChatGPT»). Потом остальные **обязательные** (раздел 1). Раздел 2 можно делать позже.

Всего обязательных: Учительница 1 — 15, Учительница 2 — 10, Учительница 3 — 14.

---

## Как рисовать в ChatGPT

1. В каждый запрос прикладывай **картинку-образец своей героини** (лист с внешностью). Внешность в промпт не пишется: она берётся только из образца.
2. Для всех картинок **лица** (`_face_…`) прикладывай вторым файлом **её же `_face_neutral.png`**. В промптах лица есть фраза про «second attached image» — так голова на всех кадрах будет одного размера и на одном месте, и рот при разговоре не будет «прыгать».
3. Формат: PNG с прозрачным фоном. Если ChatGPT нарисовал серо-белую «шахматку» вместо прозрачности, напиши ему: *«The background must be truly transparent, not a checkerboard pattern.»* Ровный одноцветный фон я тоже уберу сам при загрузке, но прозрачный надёжнее.
4. Три вида кадрирования:
   - **лицо крупно** — 1024×1024, голова и верх плеч;
   - **по пояс** — 1024×1536 (вертикально), видны руки;
   - **в полный рост** — 1024×1536, от головы до ног (только танец).

---

## 1. Обязательные для первого занятия

### Учительница 1 — гимнастика для рта и дыхание (папка `assets/teachers/teacher1/`)

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher1_face_neutral.png | спокойное лицо, лёгкая улыбка, рот закрыт | всегда, когда она молчит; рот «закрыт» при разговоре; зеркало — исходная поза | 1024×1024, лицо крупно | да |
| teacher1_face_talk_half.png | рот полуоткрыт, как в середине слова | при разговоре (меняется с закрытым и открытым под звук голоса) | 1024×1024, лицо крупно | да |
| teacher1_face_talk_open.png | рот открыт, как на громком «а» | при разговоре | 1024×1024, лицо крупно | да |
| teacher1_face_smell.png | глаза закрыты, вдыхает носом, будто нюхает цветок, рот закрыт | дыхание: «сначала вдохни носом» | 1024×1024, лицо крупно | да |
| teacher1_face_blow.png | дует: губы трубочкой с маленьким отверстием, щёки чуть надуты | дыхание: одуванчик, свечки, кораблик; зеркало «подуть» | 1024×1024, лицо крупно | да |
| teacher1_face_smile.png | очень широкая улыбка с сомкнутыми зубами («лягушка») | зеркало: Frosch | 1024×1024, лицо крупно | да |
| teacher1_face_kiss.png | губы сильно вытянуты вперёд трубочкой («поцелуй», «хоботок») | зеркало: Kussmund / Rüssel | 1024×1024, лицо крупно | да |
| teacher1_face_open_wide.png | рот открыт максимально широко, как зевающий лев | зеркало: Löwe | 1024×1024, лицо крупно | да |
| teacher1_face_cheeks.png | обе щеки сильно надуты, губы сомкнуты («хомяк») | зеркало: Hamster | 1024×1024, лицо крупно | да |
| teacher1_body_hello.png | машет одной рукой, улыбается | стартовый экран; начало её блока; ритуал | 1024×1536, по пояс | да |
| teacher1_body_explain.png | объясняет: ладонь открыта, жест «смотри» | инструкции к дыханию и зеркалу | 1024×1536, по пояс | да |
| teacher1_body_praise.png | радуется, большой палец вверх | похвала | 1024×1536, по пояс | да |
| teacher1_body_support.png | тёплая улыбка, рука на сердце, ободряет | поддержка после неудачи | 1024×1536, по пояс | да |
| teacher1_body_dance.png | танцует: руки вверх, весёлая K-pop поза | танцпауза | 1024×1536, полный рост | да |
| teacher1_body_bye.png | машет обеими руками на прощание | конец блока; конец занятия | 1024×1536, по пояс | да |

### Учительница 2 — слушаем звуки (папка `assets/teachers/teacher2/`)

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher2_face_neutral.png | спокойное лицо, лёгкая улыбка, рот закрыт | когда молчит; рот «закрыт» при разговоре | 1024×1024, лицо крупно | да |
| teacher2_face_talk_half.png | рот полуоткрыт | при разговоре | 1024×1024, лицо крупно | да |
| teacher2_face_talk_open.png | рот открыт | при разговоре | 1024×1024, лицо крупно | да |
| teacher2_body_hello.png | машет одной рукой, улыбается | стартовый экран; начало её блока; ритуал | 1024×1536, по пояс | да |
| teacher2_body_listen.png | приложила ладонь к уху, внимательно слушает | пока звучит звук-загадка и пока ждёт ответа | 1024×1536, по пояс | да |
| teacher2_body_point.png | показывает рукой в сторону (вправо от зрителя) | «нажми на картинку», показывает на варианты | 1024×1536, по пояс | да |
| teacher2_body_praise.png | радуется, большой палец вверх | похвала | 1024×1536, по пояс | да |
| teacher2_body_support.png | тёплая улыбка, рука на сердце | «послушай ещё раз», поддержка | 1024×1536, по пояс | да |
| teacher2_body_dance.png | танцует, весёлая K-pop поза | танцпауза | 1024×1536, полный рост | да |
| teacher2_body_bye.png | машет обеими руками | конец блока; конец занятия | 1024×1536, по пояс | да |

### Учительница 3 — говорим и игра (папка `assets/teachers/teacher3/`)

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher3_face_neutral.png | спокойное лицо, лёгкая улыбка, рот закрыт | когда молчит; рот «закрыт» при разговоре; звук «м» | 1024×1024, лицо крупно | да |
| teacher3_face_talk_half.png | рот полуоткрыт | при разговоре | 1024×1024, лицо крупно | да |
| teacher3_face_talk_open.png | рот широко открыт, как на «А» | при разговоре; образец звука «А» | 1024×1024, лицо крупно | да |
| teacher3_face_talk_o.png | рот круглый, как на «О» | образец «О», слова с «о» (Oma, Ball…) | 1024×1024, лицо крупно | да |
| teacher3_face_talk_i.png | губы растянуты в улыбку, зубы почти сомкнуты, как на «И» | образец «И» | 1024×1024, лицо крупно | да |
| teacher3_face_talk_u.png | губы вытянуты вперёд маленьким кружком, как на «У» | образец «У», «Muh», «Puppe» | 1024×1024, лицо крупно | да |
| teacher3_body_hello.png | машет одной рукой, улыбается | стартовый экран; ритуал начала; начало её блока | 1024×1536, по пояс | да |
| teacher3_body_explain.png | объясняет, ладонь открыта | инструкции; называет картинку | 1024×1536, по пояс | да |
| teacher3_body_listen.png | ладонь у уха, слушает | пока Эмили повторяет слово | 1024×1536, по пояс | да |
| teacher3_body_point.png | показывает рукой в сторону (вправо от зрителя) | показывает на картинку слова, на сундучок в игре, на яйцо | 1024×1536, по пояс | да |
| teacher3_body_praise.png | радуется, большой палец вверх | похвала; итог занятия | 1024×1536, по пояс | да |
| teacher3_body_support.png | тёплая улыбка, рука на сердце | поддержка | 1024×1536, по пояс | да |
| teacher3_body_dance.png | танцует, весёлая K-pop поза | танцпауза | 1024×1536, полный рост | да |
| teacher3_body_bye.png | машет обеими руками | конец занятия | 1024×1536, по пояс | да |

---

## 2. Можно сделать позже

### Учительница 1 (занятия 2–4: упражнения с языком и губами)

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher1_face_tongue_out.png | язык высунут прямо вперёд и вниз | зеркало: Zunge raus | 1024×1024, лицо крупно | да |
| teacher1_face_tongue_up.png | рот открыт, кончик языка тянется вверх к носу | зеркало: Zunge zur Nase | 1024×1024, лицо крупно | да |
| teacher1_face_tongue_down.png | рот открыт, кончик языка тянется вниз к подбородку | зеркало: Zunge zum Kinn | 1024×1024, лицо крупно | да |
| teacher1_face_tongue_left.png | рот приоткрыт, язык в левом уголке рта (слева для зрителя) | зеркало: часики (Uhr); Marmelade | 1024×1024, лицо крупно | да |
| teacher1_face_tongue_right.png | язык в правом уголке рта (справа для зрителя) | зеркало: часики; Marmelade | 1024×1024, лицо крупно | да |
| teacher1_face_lick.png | кончик языка облизывает верхнюю губу посередине | зеркало: Marmelade (чередуется: влево → вверх → вправо) | 1024×1024, лицо крупно | да |
| teacher1_face_click.png | рот открыт, кончик языка прижат к нёбу за верхними зубами | зеркало: Pferdchen (чередуется с talk_open + звук цоканья) | 1024×1024, лицо крупно | да |
| teacher1_face_pfannkuchen.png | рот открыт, широкий плоский язык спокойно лежит на нижней губе («блинчик») | зеркало: Pfannkuchen (по желанию; без неё — tongue_out + схема) | 1024×1024, лицо крупно | да |
| teacher1_face_nadel.png | узкий острый язык вытянут вперёд («иголочка») | зеркало: Nadel (по желанию) | 1024×1024, лицо крупно | да |
| teacher1_face_tasse.png | широкий язык высунут, боковые края и кончик подняты («чашечка») | зеркало: Tasse (по желанию) | 1024×1024, лицо крупно | да |
| teacher1_face_berg.png | рот открыт, кончик языка за нижними зубами, спинка языка выгнута вверх («горка») | зеркало: Berg (по желанию) | 1024×1024, лицо крупно | да |
| teacher1_face_pilz.png | рот широко открыт, язык целиком присосан к нёбу, видна натянутая уздечка («грибок») | зеркало: Pilz (по желанию) | 1024×1024, лицо крупно | да |
| teacher1_face_tongue_mid.png | узкий язык прямо вперёд посередине (средний кадр часиков) | зеркало: Uhr | 1024×1024, лицо крупно | да |
| teacher1_face_lick_left.png | широкий язык на верхней губе слева (для зрителя) | зеркало: Marmelade, кадр 1 | 1024×1024, лицо крупно | да |
| teacher1_face_lick_right.png | широкий язык на верхней губе справа (для зрителя) | зеркало: Marmelade, кадр 3 | 1024×1024, лицо крупно | да |
| teacher1_body_point.png | показывает рукой в сторону (вправо от зрителя) | показывает на свечки, кораблик | 1024×1536, по пояс | да |
| teacher1_body_listen.png | ладонь у уха | ждёт, когда Эмили подует или поцокает | 1024×1536, по пояс | да |
| teacher1_body_dance2.png | второй кадр танца: другая поза, руки в стороны | танцпауза (кадры чередуются) | 1024×1536, полный рост | да |

### Учительница 2

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher2_body_clap.png | хлопает в ладоши | «Klatsch!» — хлопни, когда услышишь звук; прохлопать слоги | 1024×1536, по пояс | да |
| teacher2_body_think.png | думает: палец у подбородка, взгляд вверх | «одинаковые или разные?» — пока Эмили выбирает | 1024×1536, по пояс | да |
| teacher2_body_explain.png | объясняет, ладонь открыта | объяснение новых игр (с занятия 2) | 1024×1536, по пояс | да |
| teacher2_body_dance2.png | второй кадр танца | танцпауза | 1024×1536, полный рост | да |

### Учительница 3 (картинки звуков — когда программа дойдёт до этого звука)

| Файл | Что на картинке | Где в игре | Размер, кадр | Прозр. фон |
| --- | --- | --- | --- | --- |
| teacher3_face_snd_sch.png | звук «Ш»: губы вытянуты вперёд «рупором», зубы почти сомкнуты и видны | образец звука Sch | 1024×1024, лицо крупно | да |
| teacher3_face_snd_s.png | звук «С»: губы в улыбке, зубы сомкнуты, кончик языка за нижними зубами | образец звука S и Z | 1024×1024, лицо крупно | да |
| teacher3_face_snd_f.png | звук «Ф»: верхние зубы касаются нижней губы | образец звука F/W | 1024×1024, лицо крупно | да |
| teacher3_face_snd_l.png | звук «Л»: рот приоткрыт, кончик языка поднят к верхним зубам, хорошо виден | образец звука L | 1024×1024, лицо крупно | да |
| teacher3_face_snd_k.png | звук «К»: рот приоткрыт, кончик языка опущен за нижние зубы, спинка языка поднята | образец звуков K/G | 1024×1024, лицо крупно | да |
| teacher3_body_think.png | думает: палец у подбородка | игра: «что же в сундучке?» | 1024×1536, по пояс | да |
| teacher3_body_dance2.png | второй кадр танца | танцпауза | 1024×1536, полный рост | да |

---

## 3. Промпты для ChatGPT

Промпты одинаковые для всех трёх учительниц: меняются только приложенный образец и имя файла, под которым ты сохраняешь картинку. Над каждым блоком написано, для каких файлов он подходит.

### 3.1. Лицо — обязательные

**`teacher1_face_neutral.png`, `teacher2_face_neutral.png`, `teacher3_face_neutral.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Calm, friendly face with a gentle closed-mouth smile, eyes open, looking straight at the viewer. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward, the head fills about 75% of the image height. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_talk_half.png`, `teacher2_face_talk_half.png`, `teacher3_face_talk_half.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Talking: the mouth is half open, as in the middle of speaking a word, friendly expression, looking straight at the viewer. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up); only the mouth changes. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_talk_open.png`, `teacher2_face_talk_open.png`, `teacher3_face_talk_open.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Talking: the mouth is open wide as when saying a clear "ah" sound, friendly cheerful expression, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see the mouth shape. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up); only the mouth changes. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_talk_o.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Saying the vowel "O": lips form a clear round open circle, friendly expression, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up); only the mouth changes. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_talk_i.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Saying the vowel "EE" (German "I"): lips stretched wide in a smile, teeth almost closed and visible, friendly expression, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up); only the mouth changes. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_talk_u.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Saying the vowel "OO" (German "U"): lips pushed forward into a small round opening, friendly expression, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up); only the mouth changes. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_smell.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Breathing in slowly through the nose as if smelling a lovely flower: eyes gently closed, mouth closed, nose slightly raised, calm happy expression. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos, no flower in the image.
```

**`teacher1_face_blow.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Blowing air out gently: lips rounded and pushed forward with a small opening in the middle, cheeks slightly puffed, eyes open and looking at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos, no air lines or effects.
```

**`teacher1_face_smile.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. A very wide "frog smile": lips stretched as wide as possible, teeth closed together and clearly visible, eyes happy, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_kiss.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Lips pushed far forward into a long rounded tube, like a playful "elephant trunk" mouth exercise, eyes open and cheerful, looking straight at the viewer. Draw the lips large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos, no hearts.
```

**`teacher1_face_open_wide.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth opened as wide as possible, like a big yawning lion, tongue lying flat at the bottom of the mouth, eyes open and playful, looking straight at the viewer. Draw the mouth large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_cheeks.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Both cheeks puffed up very big with air like a hamster, lips pressed closed, eyes wide and playful, looking straight at the viewer. Make the puffed cheeks large and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

### 3.2. Тело — обязательные

**`teacher1_body_hello.png`, `teacher2_body_hello.png`, `teacher3_body_hello.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Waving hello with one raised hand, big friendly smile, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_explain.png`, `teacher3_body_explain.png`** (позже — `teacher2_body_explain.png`)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Explaining something kindly: one hand raised with an open palm in a "look, like this" gesture, mouth slightly open as if speaking, warm expression, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher2_body_listen.png`, `teacher3_body_listen.png`** (позже — `teacher1_body_listen.png`)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Listening carefully: one hand cupped behind the ear, head slightly tilted, curious attentive smile, mouth closed, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher2_body_point.png`, `teacher3_body_point.png`** (позже — `teacher1_body_point.png`)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pointing with one arm stretched out to the right side of the image (viewer's right), looking at the viewer with an inviting smile, as if saying "look over there". Framing: waist-up, the character slightly left of center, the pointing hand fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_praise.png`, `teacher2_body_praise.png`, `teacher3_body_praise.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Very happy and proud: big smile, one hand giving a thumbs up, the other hand in a small cheering fist, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_support.png`, `teacher2_body_support.png`, `teacher3_body_support.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Warm and encouraging: gentle kind smile, one hand on her heart, the other hand open towards the viewer, as if saying "it's okay, let's try again". Not sad. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_dance.png`, `teacher2_body_dance.png`, `teacher3_body_dance.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Dancing joyfully in an energetic K-pop dance pose: both arms up, one knee bent, big happy smile, looking at the viewer. Child-friendly, playful. Framing: full body from head to feet, centered, the whole figure inside the image with a small margin. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_bye.png`, `teacher2_body_bye.png`, `teacher3_body_bye.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Saying goodbye: waving with both hands raised, warm happy smile, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

### 3.3. Позже — Учительница 1, язык

**`teacher1_face_tongue_out.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise: tongue sticking straight out and slightly down, pink and clearly visible, eyes open and playful, looking at the viewer. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_up.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise: mouth open, the tip of the tongue stretching upward towards the nose, over the upper lip, eyes looking up playfully. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_down.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise: mouth open, the tongue stretching downward towards the chin, over the lower lip, eyes looking down playfully. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_left.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "clock": mouth slightly open, the tip of the tongue pointing out to the left corner of the mouth (on the viewer's left side of the image), eyes glancing the same way. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_right.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "clock": mouth slightly open, the tip of the tongue pointing out to the right corner of the mouth (on the viewer's right side of the image), eyes glancing the same way. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_lick.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "jam on the lips": the tip of the tongue licking the middle of the upper lip, mouth slightly open, happy "yummy" eyes. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Funny, friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_click.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "little horse" (tongue clicking): mouth open, the tip of the tongue pressed up against the roof of the mouth just behind the upper front teeth, the underside of the tongue clearly visible, playful eyes. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_pfannkuchen.png`** (по желанию)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "pancake": mouth open, the wide, flat, relaxed tongue lying calmly on the lower lip, its edges touching the corners of the mouth. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_nadel.png`** (по желанию)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "needle": the tongue stuck far out, made narrow, thin and pointed like a needle, mouth slightly open. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tasse.png`** (по желанию)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "little cup": the wide tongue stuck out with its side edges and tip curled upwards, forming a small cup shape, mouth open. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_berg.png`** (по желанию)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "hill": mouth open, the tip of the tongue resting behind the lower front teeth, the middle of the tongue arched upwards like a hill. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_pilz.png`** (по желанию)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "mushroom": mouth opened wide, the whole tongue sucked flat against the roof of the mouth, the thin band under the tongue visible and stretched like a mushroom stem. Draw the mouth and tongue large, simple and very clear, so a 5-year-old child can see exactly what to copy. Friendly, child-appropriate expression like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

### 3.3а. Rumi — кадры анимации языка (часики и варенье), 5.11

Это кадры одной анимации: часики — `tongue_left → tongue_mid → tongue_right → tongue_mid`, варенье — `lick_left → lick → lick_right → lick`, кадры сменяются плавно каждые 0,7 с. Поэтому голова на всех кадрах должна стоять **точно так же**, как на `face_neutral` (прикладывать вторым файлом). «Лево/право» — как видит зритель (Эмили повторяет как в зеркале). Пока новых нет — подставляются старые, а точное движение показывает анимированная схема в углу зеркала.

**`teacher1_face_tongue_left.png`** — ЗАМЕНИТЬ (сейчас язык спрятан во рту)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "clock" frame 1: mouth slightly open in a smile, a narrow pointed tongue stuck out and pushed hard into the LEFT corner of the mouth (on the left side of the picture, as the viewer sees it), the tip of the tongue touching the corner of the lips. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_mid.png`** — НОВАЯ
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "clock" frame 2: mouth slightly open in a smile, a narrow pointed tongue stuck straight out in the middle, pointing forward and slightly down, tip in the center. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_tongue_right.png`** — ЗАМЕНИТЬ
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "clock" frame 3: mouth slightly open in a smile, a narrow pointed tongue stuck out and pushed hard into the RIGHT corner of the mouth (on the right side of the picture, as the viewer sees it), the tip of the tongue touching the corner of the lips. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_lick_left.png`** — НОВАЯ
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "yummy jam" frame 1: mouth open, the WIDE flat tongue lifted and lying on the upper lip, covering the LEFT part of the upper lip (left side of the picture, as the viewer sees it), happy "yummy" eyes. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_lick.png`** — ЗАМЕНИТЬ (сейчас язык чуть виден)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "yummy jam" frame 2: mouth open, the WIDE flat tongue lifted and lying on the upper lip, covering the MIDDLE of the upper lip, tongue tip curled slightly up toward the nose, happy "yummy" eyes. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_face_lick_right.png`** — НОВАЯ
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Mouth exercise "yummy jam" frame 3: mouth open, the WIDE flat tongue lifted and lying on the upper lip, covering the RIGHT part of the upper lip (right side of the picture, as the viewer sees it), happy "yummy" eyes. The tongue must be clearly OUTSIDE the mouth and big enough that a 5-year-old child can see exactly where it is. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up) — this picture is one frame of an animation, so nothing except the mouth and tongue may move. Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

### 3.4. Позже — тело

**`teacher2_body_clap.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Clapping her hands together in front of her chest, cheerful smile, looking at the viewer. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher2_body_think.png`, `teacher3_body_think.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Thinking playfully: index finger on her chin, eyes looking up, small curious smile, mouth closed. Framing: waist-up, centered, facing the viewer, both hands fully inside the image. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher1_body_dance2.png`, `teacher2_body_dance2.png`, `teacher3_body_dance2.png`** (приложи вторым файлом её `_body_dance.png`)
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Second frame of the same dance as in the second attached image: a different energetic K-pop dance pose, arms stretched out to the sides, hips turned, big happy smile, looking at the viewer. Same size and position of the figure as in the second attached image. Child-friendly, playful. Framing: full body from head to feet, centered, the whole figure inside the image with a small margin. Portrait image, 1024x1536 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

### 3.5. Позже — Учительница 3, картинки звуков

**`teacher3_face_snd_sch.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pronouncing the German sound "SCH" (like "sh"): lips pushed forward and rounded like a small trumpet, upper and lower teeth almost touching and visible inside the lips, friendly eyes looking at the viewer. Draw the mouth large, simple and very clear, like a speech therapy picture card, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_snd_s.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pronouncing the sound "S" (snake hiss): lips spread in a smile, upper and lower teeth closed together and clearly visible, the tongue hidden behind the teeth, friendly eyes looking at the viewer. Draw the mouth large, simple and very clear, like a speech therapy picture card, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_snd_f.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pronouncing the sound "F": the upper front teeth gently resting on the lower lip, clearly visible, friendly eyes looking at the viewer. Draw the mouth large, simple and very clear, like a speech therapy picture card, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_snd_l.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pronouncing the sound "L": mouth open, the tip of the tongue raised and touching the back of the upper front teeth, the tongue clearly visible, friendly eyes looking at the viewer. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

**`teacher3_face_snd_k.png`**
```
Same character as in the attached reference image, exact same style, face, hair and outfit. Pronouncing the sound "K": mouth open, the tip of the tongue resting down behind the lower front teeth and the back of the tongue raised high, clearly visible, friendly eyes looking at the viewer. Draw the mouth and tongue large, simple and very clear, like a speech therapy picture card, so a 5-year-old child can see exactly what to copy. Keep exactly the same head size, position and angle as in the second attached image (the neutral face close-up). Framing: close-up of the face, head and top of the shoulders, face centered and facing forward. Square image, 1024x1024 pixels. Transparent background (real PNG transparency, no checkerboard pattern, no background color). No text, no letters, no logos.
```

---

## 4. Куда класть картинки и как проверить

**Папки и имена**
- `assets/teachers/teacher1/` — картинки Учительницы 1, `assets/teachers/teacher2/` — Учительницы 2, `assets/teachers/teacher3/` — Учительницы 3.
- Имя файла — точно как в таблицах: маленькие буквы, подчёркивания, `.png` (подойдут и `.webp`, `.jpg`, но у `.jpg` не бывает прозрачного фона).
- Номер учительницы в имени и в папке совпадают. Если перепутать (`teacher2_…` в папке `teacher1`), картинка не подхватится — на экране проверки будет видно.

**Как загрузить** (зависит от ответа на вопрос 1 в плане)
- Вариант А (свой сайт): на github.com открой репозиторий → папку `assets/teachers/teacher1` → «Add file» → «Upload files» → перетащи картинки → «Commit changes». Через 1–2 минуты они на сайте.
- Вариант Б: пришли картинки мне в чат, я положу их и опубликую.

**Как проверить, что подключились**
- Родительский раздел (шестерёнка) → «Картинки учительниц»: для каждого имени файла видно — ✅ картинка подхватилась (и её миниатюра) или ⬜ пока заглушка. Там же кнопка «проверить рот»: учительница «говорит» тестовую фразу, видно, не прыгает ли лицо между кадрами.
- Телефон может показывать старую версию из памяти — тогда обнови страницу (потянуть вниз) или закрой и открой заново.

**Выравнивание делаю я.** При загрузке код сам обрезает пустые края, центрирует фигуру и приводит все кадры одной учительницы к одному размеру. Ровный одноцветный фон убирается автоматически. Если какой-то кадр всё равно заметно сдвинут, скажи мне — поправлю в одном файле настроек, перерисовывать не придётся.

**Имена учительниц** меняются в одном месте — файл `config/teachers.json` (имя, голос, цвет заглушки). Код при этом не трогается. Имена в озвучке пока не звучат; когда дашь имена, я добавлю три реплики «Ich bin …».
