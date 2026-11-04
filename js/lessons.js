/* Программа: уроки по 5 упражнений (~3 мин каждое при 15 мин на урок). Порядок внутри урока — методический и всегда один:
   1 разминка (дыхание + рот, Rumi) → 2 слушаем (Mira) → 3 звуки и слоги (Zoey) → [танец] → 4 слова (Zoey) → 5 игра с теми же словами (Zoey).
   Сначала слышим и различаем, потом произносим звук, потом слог, потом слово, потом слово в игре.
   Уроки 1–5 — вводный курс по группам звуков (план, раздел 6): 1 гласные и звукоподражания, 2 губы M/B/P,
   3 кончик языка T/D/N/L, 4 задний язык K/G, 5 шипящие S/Sch на слух. После урока 5 круг повторяется «сложнее». */
(function(){
  const X = SA.X, T = SA.T, A = SA.A, P = SA.P;
  const say = k => A.say(k);
  const spent = E => E.sec - E.left();
  /* сделать каждое задание хотя бы раз, потом повторять (сложнее), пока есть время доли */
  async function fill(E, share, fns, {min = fns.length, again = true} = {}){
    const t0 = SA.now(), used = () => (SA.now() - t0)/1000*SA.SPEED;
    let i = 0;
    while (i < min || (again && used() < share && E.left() > 15)){ await fns[i % fns.length]({level: E.level + (i >= fns.length ? 1 : 0)}); i++; if (!again && i >= fns.length) break; }
  }
  const pairs = list => list.map(([a, b]) => () => X.sameRound('t2_s_' + a, 't2_s_' + b, 'silben'));
  const animalPairs = () => { const v = Object.values(X.ANIMALS); return [0, 1, 2, 3, 4, 5].map(k => () => { const a = SA.pick(v), b = k % 2 ? a : SA.pick(v.filter(x => x !== a)); return X.sameRound(a, b, 'tiere'); }); };

  /* ---------- шаблоны упражнений ---------- */
  /* breath — имена дыхательных игр (X.BREATH) или функции; на втором круге игры другие (X.pickBreath) */
  const warmup = (breath, mirror) => async E => {
    T.body(1, 'hello'); await say(X.once('hallo1') && E.first ? 't1_hallo' : 't1_los');
    const names = breath.filter(b => typeof b === 'string');
    const fns = names.length === breath.length ? X.pickBreath(names, E.level).map(k => o => X.BREATH[k](o)) : breath;
    try { await fill(E, E.sec*0.45, fns); } finally { if (!fns.length) SA.C.stop(); }
    await SA.M.breathClose();                 /* дальше снова обычный микрофон */
    await X.mirrorStart();
    try { await fill(E, E.sec*0.55 - 10, mirror.map(id => o => X.exercise(id, o))); }
    finally { X.mirrorStop(); }
    T.body(1, 'bye'); await say('t1_ende');
  };
  const listen = parts => async E => {
    T.body(2, 'hello'); await say(E.first && X.once('hallo2') ? 't2_hallo' : 't2_los');
    for (let i = 0; i < parts.length; i++){
      const [pre, fns] = parts[i];
      if (pre) await pre();
      await fill(E, (E.left() - 10)/(parts.length - i), fns, {min: Math.min(2, fns.length)});
    }
    await X.listenBye();
  };
  const sounds = fns => async E => {
    T.face(3); await say(X.once('hallo3') && E.first ? 't3_sprechen_intro' : 't3_los');
    await fill(E, E.sec - 12, fns);
  };
  const words = list => async E => {
    T.face(3); await say('t3_los');
    const ws = typeof list === 'function' ? list() : list;
    await fill(E, E.sec - 12, ws.map((w, i) => () => X.word(w, i === 2)));
  };
  const game = (kind, list) => async E => {
    const ws = typeof list === 'function' ? list() : list;
    await X.game(kind, SA.shuffle(ws));
    if (E.left() > 70) await X.game(kind, SA.shuffle(ws));
  };
  /* слова, которые родитель отметил «пока трудно» (или давно не повторяли) — для урока-повторения */
  function hardWords(){
    const d = P.load(), cnt = {};
    for (const s of d.sessions) for (const it of s.items) if (it.mark === 'hard' && /^(wort|spiel):/.test(it.id)) { const w = it.id.split(':')[1]; cnt[w] = (cnt[w] || 0) + 1; }
    const hard = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 6);
    const pool = ['ball', 'mama', 'nase', 'kuh', 'auto', 'teddy', 'maus', 'keks', 'lampe', 'puppe'];
    return [...hard, ...SA.shuffle(pool.filter(w => !hard.includes(w)))].slice(0, 6);
  }

  SA.LESSONS = [
    {n: 1, name: 'Гласные и голоса животных', ex: [
      {id: 'warmup', t: 1, icon: 'pusteblume', name: 'Одуванчик, шарик, рот', run: warmup(['pusteblume', 'ballon'], ['frosch', 'kuss', 'loewe', 'hamster'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'Кто так говорит? Одинаковые или разные?', run: listen([[X.animalsIntro, [o => X.whoRound(o)]], [null, animalPairs()]])},
      {id: 'sounds', t: 3, icon: 'mund', name: 'Гласные А-О-И-У, Muh, Mäh', run: sounds([() => X.vowel('a'), () => X.vowel('o'), () => X.vowel('i'), () => X.vowel('u'),
        () => X.tier('muh'), () => X.tier('maeh', true), () => X.tier('wau'), () => X.tier('miau')])},
      {id: 'words', t: 3, icon: 'ball', name: 'Слова: Auto, Ei, Ball…', run: words(['auto', 'ei', 'ball', 'baum', 'oma', 'puppe'])},
      {id: 'game', t: 3, icon: 'kiste', name: 'Волшебный сундучок', run: game('kiste', ['auto', 'ei', 'ball', 'baum', 'oma', 'puppe'])}]},
    {n: 2, name: 'Губы: M, B, P', ex: [
      {id: 'warmup', t: 1, icon: 'flamme', name: 'Свечки, дудочка, улыбка ↔ трубочка', run: warmup(['kerzen', 'floete'], ['wechsel', 'pusten', 'kuss'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'Хлопни на «М», одинаковые слоги', run: listen([[null, [() => X.klatsch('m', SA.shuffle(['ma', 'sa', 'mo', 'ta', 'mu', 'ka', 'mi', 'la', 'ma']).map(s => 't2_s_' + s))]],
        [null, pairs([['ma', 'ma'], ['ma', 'pa'], ['pa', 'pa'], ['ba', 'pa'], ['ma', 'na'], ['ba', 'ba']])]])},
      {id: 'sounds', t: 3, icon: 'baer', name: 'Ммм, ma-mo-mu, ba-bo-bu, pa-po-pu', run: sounds([() => X.syll('t3_mmm', {pic: 'baer', intro: 't3_mmm_intro'}),
        () => X.syll('t3_r_ma', {face: 'talk_open', intro: 't3_silben_intro', hear: true}), () => X.syll('t3_r_ba', {face: 'talk_open'}), () => X.syll('t3_r_pa', {face: 'talk_open'})])},
      {id: 'words', t: 3, icon: 'banane', name: 'Mama, Papa, Maus, Mond…', run: words(['mama', 'papa', 'maus', 'mond', 'banane', 'ball'])},
      {id: 'game', t: 3, icon: 'rakete', name: 'Ракета', run: game('rakete', ['mama', 'papa', 'maus', 'mond', 'banane', 'ball'])}]},
    {n: 3, name: 'Кончик языка: T, D, N, L', ex: [
      {id: 'warmup', t: 1, icon: 'schiff', name: 'Гонка корабликов, вертушка, язык', run: warmup(['rennen', 'windrad'], ['zunge_raus', 'nase', 'uhr', 'marmelade'])},
      {id: 'listen', t: 2, icon: 'trommel', name: 'Прохлопать слоги, одинаковые слоги', run: listen([[null, [['banane', 3], ['auto', 2], ['ball', 1], ['teddy', 2], ['lampe', 2], ['nudel', 2]].map(([w, n]) => () => X.trommel(w, n))],
        [null, pairs([['ta', 'ta'], ['ta', 'ka'], ['da', 'ga'], ['na', 'na'], ['la', 'na'], ['da', 'da']])]])},
      {id: 'sounds', t: 3, icon: 'trommel', name: 'ta-ta-ta, na-na, la-la, da-do-du', run: sounds([() => X.syll('t3_r_ta', {pic: 'trommel', intro: 't3_trommel_sil'}),
        () => X.syll('t3_r_na', {face: 'talk_open', hear: true}), () => X.syll('t3_r_la', {face: 'talk_open'}), () => X.syll('t3_r_da', {face: 'talk_o'})])},
      {id: 'words', t: 3, icon: 'teddy', name: 'Tür, Teddy, Nase, Nudel…', run: words(['tuer', 'teddy', 'nase', 'nudel', 'loeffel', 'lampe'])},
      {id: 'game', t: 3, icon: 'keks', name: 'Покорми зверька', run: game('fuettern', ['tuer', 'teddy', 'nase', 'nudel', 'loeffel', 'lampe'])}]},
    {n: 4, name: 'Задний язык: K, G', ex: [
      {id: 'warmup', t: 1, icon: 'tasse', name: 'Горячий суп, мыльные пузыри, язык вниз', run: warmup(['suppe', 'blasen'], ['loewe', 'kinn', 'hamster'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'ka–ta, Kopf или Topf?', run: listen([[null, pairs([['ka', 'ta'], ['ga', 'da'], ['ka', 'ka'], ['ta', 'ta'], ['ga', 'ga'], ['ka', 'ga']])],
        [null, [() => X.zeig(['kopf', 'topf']), () => X.zeig(['kanne', 'tanne'])]]])},
      {id: 'sounds', t: 3, icon: 'specht', name: 'Дятел: ka-ko-ku, ga-go-gu', run: sounds([() => X.syll('t3_r_ka', {pic: 'specht', intro: 't3_specht'}), () => X.syll('t3_r_ga', {face: 'talk_open', hear: true})])},
      {id: 'words', t: 3, icon: 'kuchen', name: 'Kuh, Katze, Keks, Kuchen…', run: words(['kuh', 'katze', 'keks', 'kuchen', 'gabel', 'gurke'])},
      {id: 'game', t: 3, icon: 'kiste', name: 'Волшебный сундучок', run: game('kiste', ['kuh', 'katze', 'keks', 'kuchen', 'gabel', 'gurke'])}]},
    {n: 5, name: 'Шипящие на слух: S и Sch', ex: [
      {id: 'warmup', t: 1, icon: 'schlange', name: 'Змея ссс, поезд шшш, листики', run: warmup([() => X.hiss('schlange'), () => X.hiss('zug'), () => X.leaves()], ['frosch', 'kuss'])},
      {id: 'listen', t: 2, icon: 'zug', name: 'Змея или поезд? Хлопни на «Ш»', run: listen([[null, [() => X.schlangeZug()]],
        [null, [() => X.klatsch('sch', SA.shuffle(['scha', 'sa', 'schu', 'su', 'ma', 'scho', 'so', 'scha']).map(s => 't2_s_' + s))]],
        [null, [() => X.zeig(['tasche', 'tasse']), () => X.zeig(['fisch', 'tisch'])]]])},
      {id: 'sounds', t: 3, icon: 'schlange', name: 'ссс и шшш с картинкой рта', run: sounds([() => X.syll('t3_sss', {face: 'snd_s', intro: 't3_zisch_intro'}), () => X.syll('t3_schsch', {face: 'snd_sch', hear: true})])},
      {id: 'words', t: 3, icon: 'tasse', name: 'Повторяем трудные слова', run: async E => { T.face(3); await say('t3_wiederholen'); await words(hardWords)(E); }},
      {id: 'game', t: 3, icon: 'rakete', name: 'Ракета', run: game('rakete', hardWords)}]}
  ];
})();
