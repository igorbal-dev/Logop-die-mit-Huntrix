/* ПРОГРАММА ПО ЗВУКАМ (план, раздел 5). Родитель отмечает трудные звуки — уроки строятся под них.
   Этапы звука: слушаем → отдельно → слоги → в начале слова → в середине/конце → во фразе.
   Переход на следующий этап: на двух уроках этого звука подряд ≥ 80 % «получилось» (✓) из ≥ 4 отметок родителя
   (этап «слушаем» — ≥ 80 % верных ответов нажатием, отмечать не нужно). Урок без отметок цепочку не рвёт —
   отметить можно и потом, послушав записи в родительском разделе. Логопедия:
   - звук в словах не требуем, пока он не получается отдельно и в слогах (иначе закрепляется неправильный);
   - перед звуком — гимнастика именно для него (комплекс mirror), и объяснение, как его сделать (по-немецки и по-русски);
   - смычные K/G, T/D и L тренируются сразу в слогах (этап «отдельно» пропускается); у Ch (ich) нет слов «в начале». */
(function(){
  const STAGES = ['hoeren', 'allein', 'silben', 'anfang', 'ende', 'satz'];
  const STAGE_RU = {hoeren: 'слушаем', allein: 'звук отдельно', silben: 'в слогах', anfang: 'в начале слова', ende: 'в середине и конце слова', satz: 'во фразе'};
  /* sym — картинка-символ звука (для «слышишь звук?»); face — картинка рта Zoey для звука (если есть);
     iso — образец звука отдельно; syl/syl2 — слоги прямые/обратные; start/end — слова; phr — фразы [ключ, текст, картинка];
     mirror — гимнастика под звук; pairs — пары слов для «покажи» (Kopf/Topf); tip — совет родителю */
  const S = SA.SOUNDS = {
    sch: {name: 'Sch', ru: 'Ш', sym: 'zug', face: 'snd_sch', iso: 't3_schsch', syl: 't3_r_sch', syl2: 't3_rr_sch',
      start: ['schaf', 'schiff', 'schuh', 'schwein', 'schere'], end: ['fisch', 'tisch', 'tasche', 'flasche'],
      phr: [['t3_p_sch1', 'Das Schaf ist weiß.', 'schaf'], ['t3_p_sch2', 'Der Fisch schwimmt.', 'fisch'], ['t3_p_sch3', 'Ich habe einen Schuh.', 'schuh'], ['t3_p_sch4', 'Die Tasche ist rot.', 'tasche']],
      mirror: ['kuss', 'tasse', 'marmelade', 'pilz', 'maler'], extra: ['pferd'], pairs: [['fisch', 'tisch'], ['tasche', 'tasse']],
      tip: 'Губы вперёд рупором, язык «чашечкой» наверху, дуть тёплым воздухом. Частая замена — «с» или «т» (Tuh вместо Schuh). Не просить «скажи правильно», а показать губами и «поиграть в паровоз».'},
    s: {name: 'S', ru: 'С / З', sym: 'schlange', face: 'snd_s', iso: 't3_sss', syl: 't3_r_s', syl2: 't3_rr_s',
      start: ['sonne', 'socke', 'saft', 'seife'], end: ['tasse', 'maus', 'nase', 'haus', 'eis', 'bus'],
      phr: [['t3_p_s1', 'Die Sonne scheint.', 'sonne'], ['t3_p_s2', 'Die Maus ist klein.', 'maus'], ['t3_p_s3', 'Ich esse ein Eis.', 'eis'], ['t3_p_s4', 'Der Bus fährt.', 'bus']],
      mirror: ['zaun', 'pfannkuchen', 'berg', 'zaehne'], breath: ['fussball'], pairs: [['tasse', 'tasche']],
      tip: 'Улыбка, зубки сомкнуты, кончик языка за нижними зубами, холодный ветерок посередине языка. Если язык высовывается между зубами (шепелявость) — больше «заборчика» и «горки», дома в зеркале.'},
    z: {name: 'Z', ru: 'Ц', sym: 'zahn', iso: 't3_laut_z', syl: 't3_r_z', syl2: 't3_rr_z',
      start: ['zug', 'zahn', 'zebra', 'zitrone', 'zelt'], end: ['katze', 'pilz', 'herz', 'pizza'],
      phr: [['t3_p_z1', 'Der Zug ist lang.', 'zug'], ['t3_p_z2', 'Die Katze schläft.', 'katze'], ['t3_p_z3', 'Das Zebra hat Streifen.', 'zebra'], ['t3_p_z4', 'Ich mag Pizza.', 'pizza']],
      mirror: ['zaun', 'berg', 'zaehne', 'pfannkuchen'],
      tip: 'Z — это быстро «т» и «с» вместе (тс). Сначала должен получаться S. Частая замена — просто «с» или «т».'},
    kg: {name: 'K / G', ru: 'К / Г', sym: 'specht', face: 'snd_k', iso: null, syl: 't3_r_ka', syl3: 't3_r_ga', syl2: 't3_rr_k',
      start: ['kuh', 'katze', 'keks', 'kopf', 'gabel', 'gurke', 'gans'], end: ['rakete', 'socke', 'schnecke', 'vogel'],
      phr: [['t3_p_kg1', 'Die Kuh macht muh.', 'kuh'], ['t3_p_kg2', 'Ich esse einen Keks.', 'keks'], ['t3_p_kg3', 'Die Gans ist groß.', 'gans'], ['t3_p_kg4', 'Die Rakete fliegt.', 'rakete']],
      mirror: ['berg', 'kinn', 'loewe', 'zaun'], pairs: [['kopf', 'topf'], ['kanne', 'tanne']],
      tip: 'Кончик языка остаётся внизу за зубами, звук «из горла». Частая замена — T/D (Tuh вместо Kuh). Помогает придержать кончик языка чистой ложечкой и сказать «ка» — получится K.'},
    l: {name: 'L', ru: 'Л', sym: 'lampe', face: 'snd_l', iso: null, syl: 't3_r_la', syl2: 't3_rr_l',
      start: ['loeffel', 'lampe', 'loewe', 'licht'], end: ['ball', 'nudel', 'gabel', 'teller', 'esel', 'wolke'],
      phr: [['t3_p_l1', 'Der Löwe ist stark.', 'loewe'], ['t3_p_l2', 'Die Lampe ist hell.', 'lampe'], ['t3_p_l3', 'Ich spiele Ball.', 'ball'], ['t3_p_l4', 'Der Teller ist leer.', 'teller']],
      mirror: ['nadel', 'schaukel', 'zaehne', 'maler'], extra: ['pferd'],
      tip: 'Кончик языка поднят за верхние зубы и держится там. Немецкий L мягче русского «л». Частые замены — «й» или «в» (Jöwe, Wöwe).'},
    r: {name: 'R', ru: 'Р', sym: 'rakete', iso: 't3_laut_r', syl: 't3_r_r', syl2: 't3_rr_r',
      start: ['rakete', 'rad', 'rose', 'ring'], end: ['birne', 'moehre', 'zebra'],
      phr: [['t3_p_r1', 'Die Rose ist rot.', 'rose'], ['t3_p_r2', 'Das Rad dreht sich.', 'rad'], ['t3_p_r3', 'Die Rakete fliegt.', 'rakete'], ['t3_p_r4', 'Die Möhre ist lecker.', 'moehre']],
      mirror: ['pilz', 'maler', 'schaukel', 'loewe'], extra: ['pferd'],
      tip: 'Немецкий R — «полоскание горла» сзади (как в Berlin). Русский раскатистый «р» в немецком тоже понятен. До 5–6 лет R часто ещё не готов — не торопиться, сначала Sch, S, K, L.'},
    ch: {name: 'Ch', ru: 'Ch (ich)', sym: 'katze', iso: 't3_laut_ch', syl: 't3_r_ch', syl2: null, noStart: true,
      start: [], end: ['milch', 'licht', 'broetchen', 'pfirsich'],
      phr: [['t3_p_ch1', 'Ich trinke Milch.', 'milch'], ['t3_p_ch2', 'Das Licht ist an.', 'licht'], ['t3_p_ch3', 'Ich esse ein Brötchen.', 'broetchen']],
      mirror: ['zaun', 'berg', 'pfannkuchen'],
      tip: 'Ch в «ich» — как шипение кошки, язык горкой, улыбка. Частые замены — «ш» (isch) или «к» (ick). Начинать с «ich» — это слово Эмили говорит каждый день.'},
    fw: {name: 'F / W', ru: 'Ф / В', sym: 'flamme', face: 'snd_f', iso: 't3_laut_f', syl: 't3_r_f', syl2: 't3_rr_f',
      start: ['fisch', 'frosch', 'fuss', 'wolke', 'wal', 'wurm'], end: ['schaf', 'loeffel', 'apfel', 'seife', 'loewe'],
      phr: [['t3_p_fw1', 'Der Fisch schwimmt.', 'fisch'], ['t3_p_fw2', 'Die Wolke ist weiß.', 'wolke'], ['t3_p_fw3', 'Ich esse einen Apfel.', 'apfel'], ['t3_p_fw4', 'Der Frosch springt.', 'frosch']],
      mirror: ['zaun', 'kuss', 'wechsel', 'hamster'],
      tip: 'Верхние зубы слегка касаются нижней губы и дуем. Частая замена — P/B (Pisch вместо Fisch). Хорошо помогает «задуть свечку» звуком ффф.'},
    td: {name: 'T / D', ru: 'Т / Д', sym: 'trommel', iso: null, syl: 't3_r_ta', syl3: 't3_r_da', syl2: 't3_rr_t',
      start: ['tisch', 'teddy', 'tomate', 'tasse', 'dose', 'dach'], end: ['auto', 'nudel', 'rakete', 'hut', 'brot'],
      phr: [['t3_p_td1', 'Der Teddy ist weich.', 'teddy'], ['t3_p_td2', 'Das Auto ist schnell.', 'auto'], ['t3_p_td3', 'Ich esse Brot.', 'brot'], ['t3_p_td4', 'Die Tomate ist rot.', 'tomate']],
      mirror: ['nadel', 'schaukel', 'zaehne', 'pfannkuchen'], pairs: [['topf', 'kopf'], ['tanne', 'kanne']],
      tip: 'Кончик языка стучит за верхними зубами. Частая замена — K/G (Kasse вместо Tasse) или наоборот.'}
  };
  /* этапы конкретного звука (лишние пропускаются) */
  for (const [k, v] of Object.entries(S)){
    v.code = k;
    v.stages = STAGES.filter(st => !(st === 'allein' && !v.iso) && !(st === 'anfang' && v.noStart));
  }
  SA.STAGES = STAGES; SA.STAGE_RU = STAGE_RU;
  /* у новых слов — какой рот показывает Zoey (для картинки рта при образце) */
  Object.assign(SA.X.WVIS, {schuh: 'talk_u', schwein: 'talk_open', schere: 'talk_open', flasche: 'talk_open', sonne: 'talk_o', socke: 'talk_o', saft: 'talk_open', seife: 'talk_open', haus: 'talk_open',
    eis: 'talk_open', bus: 'talk_u', zahn: 'talk_open', zebra: 'talk_half', zitrone: 'talk_i', zelt: 'talk_half', pilz: 'talk_i', herz: 'talk_half', pizza: 'talk_i', gans: 'talk_open',
    schnecke: 'talk_half', vogel: 'talk_o', loewe: 'talk_half', licht: 'talk_i', teller: 'talk_half', esel: 'talk_half', wolke: 'talk_o', rad: 'talk_open', rose: 'talk_o', ring: 'talk_i',
    birne: 'talk_i', moehre: 'talk_half', milch: 'talk_i', broetchen: 'talk_half', pfirsich: 'talk_i', fuss: 'talk_u', wal: 'talk_open', wurm: 'talk_u', apfel: 'talk_open', dose: 'talk_o',
    dach: 'talk_open', hut: 'talk_u', brot: 'talk_o', schaf: 'talk_open', schiff: 'talk_i', frosch: 'talk_o', fisch: 'talk_i', tisch: 'talk_i', hund: 'talk_u'});
})();
