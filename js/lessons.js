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
  /* rounds — сколько раз максимум пройти список (раньше станция крутила одно и то же до 3 минут — скучно) */
  /* сколько кругов: 10–15 мин урока — 2–3, 30 мин — 4; короткий список (1–2 задания) — не больше 2, чтобы не надоело */
  async function fill(E, share, fns, {min = fns.length, again = true, cap = 2, rounds} = {}){
    rounds = rounds ?? (fns.length <= 2 ? 2 : SA.clamp(Math.round(E.sec*5/60/7) + 1, 2, 4));
    /* быстрый режим проверки: каждое задание один раз, без повторов (из длинного списка — равномерно cap штук) */
    if (SA.quick()){
      const n = Math.min(fns.length, cap);
      for (let i = 0; i < n; i++) await fns[n > 1 ? Math.round(i*(fns.length - 1)/(n - 1)) : 0]({level: E.level});      /* первое и последнее, равномерно */
      return;
    }
    const t0 = SA.now(), used = () => (SA.now() - t0)/1000*SA.SPEED;
    let i = 0, seq = fns;
    while (i < min || (again && i < fns.length*rounds && used() < share && E.left() > 15)){
      if (i && i % fns.length === 0 && fns.length > 2){ const lastFn = seq[fns.length - 1]; do seq = SA.shuffle(fns); while (seq[0] === lastFn); }      /* новый круг — другой порядок, без того же задания два раза подряд */
      await seq[i % fns.length]({level: E.level + (i >= fns.length ? 1 : 0)}); i++; if (!again && i >= fns.length) break; }
  }
  const pairs = list => list.map(([a, b]) => () => X.sameRound('t2_s_' + a, 't2_s_' + b, 'silben'));
  const animalPairs = () => { const v = Object.values(X.ANIMALS); return [0, 1, 2, 3, 4, 5].map(k => () => { const a = SA.pick(v), b = k % 2 ? a : SA.pick(v.filter(x => x !== a)); return X.sameRound(a, b, 'tiere'); }); };

  /* ---------- шаблоны упражнений ---------- */
  /* breath — имена дыхательных игр (X.BREATH) или функции; на втором круге игры другие (X.pickBreath) */
  /* extra — игры языком на «сыром» микрофоне (лошадка-щелчки), идут сразу после дыхания */
  const warmup = (breath, mirror, extra = []) => async E => {
    T.body(1, 'hello'); if (X.once('hallo1') && E.first) await say('t1_hallo'); else await A.sayOne(['t1_los', 't1_los2', 't1_los3']);
    const names = breath.filter(b => typeof b === 'string');
    const fns = names.length === breath.length ? X.pickBreath(names, E.level).map(k => o => X.BREATH[k](o)) : breath;
    try { await fill(E, E.sec*(extra.length ? 0.3 : 0.4), fns); for (const f of extra) await f({level: E.level}); } finally { if (!fns.length) SA.C.stop(); }
    await SA.M.breathClose();                 /* дальше снова обычный микрофон */
    await X.mirrorStart();
    try { await fill(E, E.sec*0.6 - 10, X.pickMirror(mirror, E.level).map(id => o => X.exercise(id, o)), {cap: 99}); }
    finally { X.mirrorStop(); }
    T.body(1, 'bye'); await say('t1_ende');
  };
  const listen = parts => async E => {
    T.body(2, 'hello'); if (E.first && X.once('hallo2')) await say('t2_hallo'); else await A.sayOne(['t2_los', 't2_los2', 't2_los3']);
    for (let i = 0; i < parts.length; i++){
      const [pre, fns] = parts[i];
      if (pre) await pre();
      await fill(E, (E.left() - 10)/(parts.length - i), fns, {min: Math.min(2, fns.length), cap: 1, rounds: fns.length === 1 ? 6 : undefined});
    }
    await X.listenBye();
  };
  const sounds = fns => async E => {
    T.face(3); if (X.once('hallo3') && E.first) await say('t3_sprechen_intro'); else await A.sayOne(['t3_los', 't3_los2', 't3_los3']);
    await fill(E, E.sec - 12, fns);
  };
  /* слова урока. На первом круге — список урока; на следующих — другие слова на те же звуки из запаса (pool).
     Набор зависит только от круга, поэтому «слова» и «игра» одного урока берут одни и те же слова. */
  const seeded = (a, seed) => { a = a.slice(); let x = seed*9301 + 49297; for (let i = a.length - 1; i > 0; i--){ x = (x*9301 + 49297) % 233280; const j = Math.floor(x/233280*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const set = (base, pool) => () => { const c = P.prog().cycle; if (!c || !pool) return base; return seeded([...new Set([...base, ...pool])], c*7 + base.length).slice(0, base.length); };
  const words = (list, intro) => async E => {
    T.face(3);
    if (intro){ X.once('woerter'); await say(intro); } else await A.sayOne(['t3_los', 't3_los2', 't3_los3']);      /* одно вступление, не три */
    const ws = typeof list === 'function' ? list() : list;
    await fill(E, E.sec - 12, ws.map((w, i) => () => X.word(w, SA.quick() ? i === 0 : i === 2)));
  };
  /* две разные игры (js/games.js); вторая — если осталось время. На втором круге — случайные (X.pickGames) */
  const game = (kinds, list) => async E => {
    const ws = typeof list === 'function' ? list() : list, ks = X.pickGames(kinds, E.level);
    if (SA.quick()){ for (const k of ks) await X.game(k, SA.shuffle(ws).slice(0, 2)); return; }
    await X.game(ks[0], SA.shuffle(ws));
    if (E.left() > 70) await X.game(ks[1], SA.shuffle(ws));
  };
  /* слова, которые родитель отметил «пока трудно» (или давно не повторяли) — для урока-повторения */
  function hardWords(){
    const d = P.load(), cnt = {};
    for (const s of d.sessions) for (const it of s.items) if (it.mark === 'hard' && /^(wort|spiel):/.test(it.id)) { const w = it.id.split(':')[1]; cnt[w] = (cnt[w] || 0) + 1; }
    const hard = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 6);
    const pool = ['ball', 'mama', 'nase', 'kuh', 'auto', 'teddy', 'maus', 'keks', 'lampe', 'puppe'];
    return [...hard, ...SA.shuffle(pool.filter(w => !hard.includes(w)))].slice(0, 6);
  }

  /* слова уроков: [первый круг, запас на те же звуки для следующих кругов] */
  const W1 = set(['auto', 'ei', 'ball', 'baum', 'oma', 'puppe'], ['mama', 'papa', 'maus', 'kuh', 'mond', 'banane']);
  const W2 = set(['mama', 'papa', 'maus', 'mond', 'banane', 'ball'], ['baum', 'puppe', 'oma', 'tomate']);
  const W3 = set(['tuer', 'teddy', 'nase', 'nudel', 'loeffel', 'lampe'], ['tasse', 'tanne', 'topf', 'tasche', 'tomate', 'tisch']);
  const W4 = set(['kuh', 'katze', 'keks', 'kuchen', 'gabel', 'gurke'], ['kopf', 'kanne']);

  SA.LESSONS = [
    {n: 1, name: 'Гласные и голоса животных', ex: [
      {id: 'warmup', t: 1, icon: 'pusteblume', name: 'Одуванчик, шарик, рот и язык', run: warmup(['pusteblume', 'ballon'], ['frosch', 'kuss', 'loewe', 'zaun', 'pfannkuchen', 'uhr'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'Кто так говорит? Одинаковые или разные?', run: listen([[X.animalsIntro, [o => X.whoRound(o)]], [null, animalPairs()]])},
      {id: 'sounds', t: 3, icon: 'mund', name: 'Гласные А-О-И-У, Muh, Mäh', run: sounds([() => X.vowel('a'), () => X.vowel('o'), () => X.vowel('i'), () => X.vowel('u'),
        () => X.tier('muh'), () => X.tier('maeh', true), () => X.tier('wau'), () => X.tier('miau')])},
      {id: 'words', t: 3, icon: 'ball', name: 'Слова: Auto, Ei, Ball…', run: words(W1)},
      {id: 'game', t: 3, icon: 'kiste', name: 'Сундучок и шарики', run: game(['kiste', 'ballons'], W1)}]},
    {n: 2, name: 'Губы: M, B, P', ex: [
      {id: 'warmup', t: 1, icon: 'flamme', name: 'Свечки, дудочка, улыбка ↔ трубочка', run: warmup(['kerzen', 'floete'], ['wechsel', 'kuss', 'hamster', 'pusten', 'pfannkuchen'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'Хлопни на «М», одинаковые слоги', run: listen([[null, [() => X.klatsch('m', SA.shuffle(['ma', 'sa', 'mo', 'ta', 'mu', 'ka', 'mi', 'la', 'ma']).map(s => 't2_s_' + s))]],
        [null, pairs([['ma', 'ma'], ['ma', 'pa'], ['pa', 'pa'], ['ba', 'pa'], ['ma', 'na'], ['ba', 'ba']])]])},
      {id: 'sounds', t: 3, icon: 'baer', name: 'Ммм, ma-mo-mu, ba-bo-bu, pa-po-pu', run: sounds([() => X.syll('t3_mmm', {pic: 'baer', intro: 't3_mmm_intro'}),
        () => X.syll('t3_r_ma', {face: 'talk_open', intro: 't3_silben_intro', hear: true}), () => X.syll('t3_r_ba', {face: 'talk_open'}), () => X.syll('t3_r_pa', {face: 'talk_open'})])},
      {id: 'words', t: 3, icon: 'banane', name: 'Mama, Papa, Maus, Mond…', run: words(W2)},
      {id: 'game', t: 3, icon: 'rakete', name: 'Ракета и паровозик', run: game(['rakete', 'zug'], W2)}]},
    {n: 3, name: 'Кончик языка: T, D, N, L', ex: [
      {id: 'warmup', t: 1, icon: 'schiff', name: 'Кораблики, лошадка, гимнастика языка', run: warmup(['rennen', 'windrad'], ['pfannkuchen', 'nadel', 'schaukel', 'zaehne', 'maler', 'uhr'], [o => X.pferd(o)])},
      {id: 'listen', t: 2, icon: 'trommel', name: 'Прохлопать слоги, одинаковые слоги', run: listen([[null, [['banane', 3], ['auto', 2], ['ball', 1], ['teddy', 2], ['lampe', 2], ['nudel', 2]].map(([w, n]) => () => X.trommel(w, n))],
        [null, pairs([['ta', 'ta'], ['ta', 'ka'], ['da', 'ga'], ['na', 'na'], ['la', 'na'], ['da', 'da']])]])},
      {id: 'sounds', t: 3, icon: 'trommel', name: 'ta-ta-ta, na-na, la-la, da-do-du', run: sounds([() => X.syll('t3_r_ta', {pic: 'trommel', intro: 't3_trommel_sil'}),
        () => X.syll('t3_r_na', {face: 'talk_open', hear: true}), () => X.syll('t3_r_la', {face: 'talk_open'}), () => X.syll('t3_r_da', {face: 'talk_o'})])},
      {id: 'words', t: 3, icon: 'teddy', name: 'Tür, Teddy, Nase, Nudel…', run: words(W3)},
      {id: 'game', t: 3, icon: 'keks', name: 'Покорми зверька и башня', run: game(['fuettern', 'turm'], W3)}]},
    {n: 4, name: 'Задний язык: K, G', ex: [
      {id: 'warmup', t: 1, icon: 'tasse', name: 'Суп, пузыри, язык горкой', run: warmup(['suppe', 'blasen'], ['zaun', 'berg', 'kinn', 'loewe', 'schaukel'])},
      {id: 'listen', t: 2, icon: 'ohr', name: 'ka–ta, Kopf или Topf?', run: listen([[null, pairs([['ka', 'ta'], ['ga', 'da'], ['ka', 'ka'], ['ta', 'ta'], ['ga', 'ga'], ['ka', 'ga']])],
        [null, [() => X.zeig(['kopf', 'topf']), () => X.zeig(['kanne', 'tanne'])]]])},
      {id: 'sounds', t: 3, icon: 'specht', name: 'Дятел: ka-ko-ku, ga-go-gu', run: sounds([() => X.syll('t3_r_ka', {pic: 'specht', intro: 't3_specht'}), () => X.syll('t3_r_ga', {face: 'talk_open', hear: true}),
        () => X.syll('t3_rr_k', {pic: 'specht'}), () => X.syll('t3_r_kg', {face: 'talk_open'})])},
      {id: 'words', t: 3, icon: 'kuchen', name: 'Kuh, Katze, Keks, Kuchen…', run: words(W4)},
      {id: 'game', t: 3, icon: 'fisch', name: 'Рыбалка и сад', run: game(['angeln', 'blumen'], W4)}]},
    {n: 5, name: 'Шипящие на слух: S и Sch', ex: [
      {id: 'warmup', t: 1, icon: 'schlange', name: 'Змея, поезд, футбол языком, лошадка', run: warmup([() => X.hiss('schlange'), () => X.hiss('zug'), o => X.football(o)], ['zaun', 'berg', 'tasse', 'marmelade', 'pilz'], [o => X.pferd(o)])},
      {id: 'listen', t: 2, icon: 'zug', name: 'Змея или поезд? Хлопни на «Ш»', run: listen([[null, [() => X.schlangeZug()]],
        [null, [() => X.klatsch('sch', SA.shuffle(['scha', 'sa', 'schu', 'su', 'ma', 'scho', 'so', 'scha']).map(s => 't2_s_' + s))]],
        [null, [() => X.zeig(['tasche', 'tasse']), () => X.zeig(['fisch', 'tisch'])]]])},
      {id: 'sounds', t: 3, icon: 'schlange', name: 'ссс и шшш с картинкой рта', run: sounds([() => X.syll('t3_sss', {face: 'snd_s', intro: 't3_zisch_intro'}), () => X.syll('t3_schsch', {face: 'snd_sch', hear: true}),
        () => X.syll('t3_r_s', {face: 'snd_s'}), () => X.syll('t3_r_sch', {face: 'snd_sch'})])},
      {id: 'words', t: 3, icon: 'tasse', name: 'Повторяем трудные слова', run: words(hardWords, 't3_wiederholen')},
      {id: 'game', t: 3, icon: 'kiste', name: 'Дорожка к кладу и картинка-загадка', run: game(['weg', 'puzzle'], hardWords)}]}
  ];

  /* ========== УРОК ПОД ТРУДНЫЙ ЗВУК (js/sounds.js) ==========
     1 гимнастика именно для этого звука → 2 «слышишь звук?» (+ пары Kopf/Topf) → 3 звук отдельно / слоги → танец → 4 слова или фразы этапа → 5 игра с теми же словами.
     Пока звук не получается отдельно и в слогах, слова — БЕЗ этого звука (словарь), чтобы не закреплять неправильный звук. */
  const HAS = {sch: w => /sch/.test(w), s: w => /s|ß|z/.test(w.replace(/sch/g, '')), z: w => /z/.test(w), kg: w => /k|g/.test(w.replace(/ng/g, '')), l: w => /l/.test(w),
    r: w => /r/.test(w), ch: w => /ch/.test(w.replace(/sch/g, '')), fw: w => /f|w|v/.test(w), td: w => /t|d|z/.test(w)};
  SA.soundHas = (code, w) => HAS[code](w);
  const ALLW = () => Object.keys(A.LINES).filter(k => k.startsWith('t3_w_')).map(k => k.slice(5)).filter(w => SA.hasPic(w) && A.LINES['t3_s_' + w]).sort();
  const LOS3 = ['t3_los', 't3_los2', 't3_los3'];
  SA.soundLesson = code => {
    const S = SA.SOUNDS[code], st = P.sndStage(code), si = SA.STAGES.indexOf(st), tag = {snd: code, stage: st};
    const lid = () => P.prog().k || 0;
    const others = () => seeded(ALLW().filter(w => !HAS[code](w)), lid() + 3);
    const face = () => S.face && T.img['3_face_' + S.face] ? S.face : null;
    /* слова станций 4 и 5 (одни и те же в одном уроке) */
    const wordList = () => st === 'anfang' ? seeded(S.start, lid()).slice(0, 6) : st === 'ende' ? seeded(S.end, lid()).slice(0, 6)
      : st === 'satz' ? seeded([...S.start, ...S.end], lid()).slice(0, 6) : others().slice(0, 6);
    const counted = st === 'anfang' || st === 'ende';
    const breathFns = () => [...X.pickBreath(['pusteblume', 'kerzen'], 1), ...(S.breath || [])].map(k => o => X.BREATH[k](o));
    const extra = (S.extra || []).map(k => o => X[k](o));
    /* слушаем: слова с этим звуком и без, вперемешку */
    const tgt = st === 'ende' || st === 'satz' || !S.start.length ? [...S.end, ...S.start] : S.start;
    const hoerFns = () => { const yes = seeded(tgt, lid() + 1).slice(0, 4), no = others().slice(0, 3);
      return seeded([...yes.map(w => [w, true]), ...no.map(w => [w, false])], lid() + 2).map(([w, h]) => () => X.hoer(code, w, h, tag)); };
    /* станция 3: звук отдельно / слоги; объяснение «как сделать звук» — один раз, по-немецки, а русская подсказка — если не выходит */
    const iso = (t) => () => X.syll(S.iso, {face: face(), pic: S.sym, tag: t, prompts: ['t3_jetzt_du', 't3_jetzt_du2', 't3_ru_laut_' + code]});
    const syl = (key, t) => () => X.syll(key, {face: face(), pic: S.sym, tag: t, prompts: ['t3_jetzt_du', 't3_jetzt_du2', 't3_ru_laut_' + code]});
    const sylls = t => [S.syl, S.syl3, S.syl2].filter(Boolean).map(k => syl(k, t));
    const soundFns = () => st === 'hoeren' ? (S.iso ? [iso(null), syl(S.syl, null)] : [syl(S.syl, null)])
      : st === 'allein' ? [iso(tag), iso(tag), iso(tag)] : st === 'silben' ? sylls(tag) : [...(S.iso ? [iso(null)] : []), ...sylls(null)];
    const phrase = ([key, , pic]) => async () => { const b = X.board(); X.bigCard(b, SA.pic(pic)); if (X.once('satz')){ T.face(3); await say('t3_satz_intro'); }
      await X.repeatItem({id: 'satz:' + key, model: key, vis: 'talk_open', words: 4, showPic: b, tag}); };
    const name = `Звук ${S.name} — ${SA.STAGE_RU[st]}`;
    return {n: 'snd', code, name, ex: [
      {id: 'warmup', t: 1, icon: 'pusteblume', name: `Гимнастика для ${S.name}`, run: E => warmup(breathFns(), S.mirror, extra)(E)},
      {id: 'listen', t: 2, icon: 'ohr', name: `Слышишь ${S.name}?`, run: E => listen([[null, hoerFns()], ...(S.pairs ? [[null, S.pairs.map(p => () => X.zeig(p))]] : [])])(E)},
      {id: 'sounds', t: 3, icon: S.sym, name: st === 'allein' || st === 'hoeren' ? `${S.name} отдельно` : `Слоги с ${S.name}`, run: async E => {
        T.face(3); await A.sayOne(LOS3);
        if (X.once('laut_intro_' + code)){ const b = X.board(); if (face()) X.bigCard(b, `<img class="pic" style="object-fit:contain" src="${T.src(3, 'face_' + face())}" alt="">`); else X.bigCard(b, SA.pic(S.sym)); T.face(3); await say('t3_laut_intro_' + code); }
        await fill(E, E.sec - 12, soundFns(), {rounds: st === 'allein' ? 1 : undefined});
      }},
      {id: 'words', t: 3, icon: st === 'satz' ? 'mund' : 'ball', name: st === 'satz' ? `Фразы с ${S.name}` : counted ? `Слова с ${S.name} (${SA.STAGE_RU[st]})` : 'Слова (новые немецкие)', run: async E => {
        if (st === 'satz'){ T.face(3); await A.sayOne(LOS3); await fill(E, E.sec - 12, seeded(S.phr, lid()).map(phrase)); return; }
        T.face(3); await A.sayOne(LOS3);
        const ws = wordList();
        await fill(E, E.sec - 12, ws.map((w, i) => () => X.word(w, SA.quick() ? i === 0 : i === 2, counted ? tag : null)));
      }},
      {id: 'game', t: 3, icon: 'kiste', name: 'Игра с этими словами', run: async E => {
        const ws = wordList(), ks = X.pickGames(['kiste', 'zug'], 1), t = counted ? tag : null;
        if (SA.quick()){ await X.game(ks[0], SA.shuffle(ws).slice(0, 2), t); return; }
        await X.game(ks[0], SA.shuffle(ws), t);
        if (E.left() > 70) await X.game(ks[1], SA.shuffle(ws), t);
      }}]};
  };
  /* какой урок сейчас: под звук (если родитель отметил звуки) или общий из уроков 1–5 */
  SA.curLesson = (pr = P.prog()) => pr.kind === 'sound' && SA.SOUNDS[pr.snd] ? SA.soundLesson(pr.snd) : SA.LESSONS[(pr.lesson - 1) % SA.LESSONS.length];
})();
