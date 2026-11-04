/* Задания. У каждого: цель, инструкция (немецкий → другой немецкий → русский), показ учительницей, до 3 попыток,
   критерий завершения, вариант «проще» и «сложнее» (o.level: -1 / 0 / 1). Ничего не «неправильно»: после 3 попыток —
   похвала за старание и дальше. Каждое задание пишется в прогресс (SA.P.item), отметки родителя — кнопки ✓ / ~. */
(function(){
  const A = SA.A, T = SA.T, M = SA.M, P = SA.P;
  const say = (k, o) => A.say(k, o), sleep = SA.sleep;
  const board = () => { const b = SA.$('#board'); b.innerHTML = ''; return b; };
  const praise = n => A.sayOne({1: ['t1_lob1', 't1_lob2', 't1_lob3', 't1_lob4', 't1_lob5', 't1_lob6'], 2: ['t2_lob1', 't2_lob2', 't2_lob3', 't2_lob4', 't2_lob5', 't2_lob6'],
    3: ['t3_lob1', 't3_lob2', 't3_lob3', 't3_lob4', 't3_lob5', 't3_lob6', 't3_lob7', 't3_lob8']}[n]);
  const support = n => A.sayOne({1: ['t1_mut1', 't1_mut2', 't1_mut3', 't1_mut4'], 2: ['t2_mut1', 't2_mut2', 't2_mut3', 't2_mut4'], 3: ['t3_mut1', 't3_mut2', 't3_mut3', 't3_mut4', 't3_mut5']}[n]);
  const X = SA.X = {praise, support};
  const left = () => SA.timeLeft ? SA.timeLeft() : 999;
  /* большая карточка по центру доски */
  X.bigCard = (b, html) => { const w = SA.el('div', 'full center'), c = SA.el('div', 'card big pop', html); c.style.cssText = 'width:min(56%,80vh);max-width:none'; w.appendChild(c); b.appendChild(w); return c; };

  /* ---------- кнопки родителя ✓ / ~ ---------- */
  let markRec = null, onParentOk = null;
  const pm = () => SA.$('#pmarks');
  X.marks = (rec, okCb) => {
    markRec = rec; onParentOk = okCb || null;
    pm().hidden = !rec; pm().querySelectorAll('button').forEach(b => b.classList.toggle('sel', !!rec && rec.mark === b.dataset.m));
  };
  document.addEventListener('DOMContentLoaded', () => {
    pm().querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); if (!markRec) return;
      P.mark(markRec, b.dataset.m); pm().querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
      if (b.dataset.m === 'ok' && onParentOk) onParentOk();
    }));
  });

  /* ---------- ожидание нажатия с лестницей подсказок ---------- */
  /* cards — элементы; prompts — [немецкий, немецкий-2, русский]; replay() — повторить звук-загадку перед подсказкой */
  async function waitTap(cards, prompts, replay, right){
    for (let round = 0; round < 3; round++){
      if (round > 0){ cards.forEach(c => c.classList.add('glow')); if (replay) await replay(); await say(prompts[round]); setTimeout(() => cards.forEach(c => c.classList.remove('glow')), 1500); }
      else if (prompts[0]) await say(prompts[0]);
      const tap = SA.tapOne(cards).then(i => ({i}));
      const auto = SA.AUTO ? sleep(600).then(() => ({i: right ?? 0})) : null;
      const r = await SA.guard(Promise.race([tap, sleep(8000).then(() => null), ...(auto ? [auto] : [])]));
      if (r) return r.i;
    }
    return -1;
  }

  /* ---------- ритуал начала: всегда одинаково ---------- */
  X.ritual = async () => {
    const b = board();
    const row = SA.el('div', 'cards');
    const c1 = SA.el('div', 'card'), c2 = SA.el('div', 'card');
    for (const [c, n] of [[c1, 1], [c2, 2]]){ c.style.cssText = 'background:transparent;box-shadow:none;width:42%;max-width:42%;aspect-ratio:2/3;padding:0'; c.innerHTML = `<img class="pic" style="object-fit:contain" src="${T.src(n, 'body_hello')}" alt="">`; row.appendChild(c); }
    b.appendChild(row);
    T.body(3, 'hello');
    await say('t3_ritual_hallo');
    c1.classList.add('pop'); await say(A.has('t1_ich_bin') ? 't1_ich_bin' : 't1_hallo_kurz');   /* с именем — «Hallo, ich bin Rumi!» */
    c2.classList.add('pop'); await say('t2_hallo_kurz');
    await say('t3_hallo_kurz');
    T.body(3, 'listen');
    let heard = false;
    for (const k of ['t3_ritual_ruf', 't3_ritual_ruf2', 't3_ru_ritual']){
      await say(k);
      const r = await M.listen({words: 1, noVoiceMs: 6000});
      if (r.ok){ heard = true; break; }
      if (r.nomic) break;
    }
    T.body(3, 'praise'); if (heard) SA.starEl(b);
    await say('t3_ritual_ok');
    P.item({block: 'ritual', id: 'hallo', kind: 'speak', result: heard ? 'heard' : (M.ok ? 'none' : 'nomic')});
  };

  /* ---------- дыхание (Учительница 1) ---------- */
  X.breathHello = async () => { T.body(1, 'hello'); await say('t1_hallo'); };
  /* Pusteblume: цель — длинный плавный выдох ртом. Пушинки улетают, пока Эмили дует. Проще: пушинка за 80 мс; сложнее: за 200 мс (нужен долгий выдох) */
  X.dandelion = async (o = {}) => {
    const n = 14, per = o.level > 0 ? 200 : o.level < 0 ? 80 : 130;
    const b = board(), w = SA.el('div', 'full center'); w.innerHTML = SA.dandelionSVG(n); b.appendChild(w);
    const seeds = [...w.querySelectorAll('.seed')]; let gone = 0;
    const fly = () => { const s = seeds[gone++]; if (!s) return; const a = Math.random()*60 - 30;
      s.animate([{transform: 'none', opacity: 1}, {transform: `translate(${120 + Math.random()*160}px,${-80 - Math.random()*140}px) rotate(${a}deg)`, opacity: 0}], {duration: 1800, easing: 'ease-out', fill: 'forwards'}); };
    T.body(1, 'explain'); await say('t1_puste_intro');
    /* показ: вдох носом — выдох */
    T.face(1, 'smell'); await say('t1_riechen'); await sleep(500);
    T.face(1, 'blow'); A.sfx.whoosh(); fly(); await sleep(250); fly(); await sleep(700);
    T.face(1); await say('t1_puste');
    let attempts = 0, quietFrom = 0;
    const prompts = ['t1_puste2', 't1_ru_puste'];
    for (let round = 0; round < 3 && gone < n; round++){
      attempts++;
      let acc = 0;
      T.face(1, 'blow');
      const st = await M.blow({ms: 6500, onTick(a){ if (a){ acc += 30; quietFrom = 0; if (acc >= per){ acc = 0; fly(); } } else if (!quietFrom) quietFrom = SA.now(); },
        until: s => gone >= n || (s.any && quietFrom && SA.now() - quietFrom > 1800)});
      T.face(1);
      if (gone >= n) break;
      if (!st.any){ if (round < 2){ await say(prompts[round]); } continue; }
      if (round < 2) await say('t1_puste_mehr');
    }
    const done = gone >= n;
    if (!done) while (gone < n){ fly(); await sleep(60); }            /* все пушинки улетают в любом случае */
    T.body(1, done ? 'praise' : 'support'); SA.starEl(b);
    await (done ? praise(1) : support(1));
    P.item({block: 'breath', id: 'pusteblume', kind: 'blow', result: done ? 'done' : 'tried', attempts, level: o.level || 0});
  };
  /* Kerzen: цель — короткие сильные выдохи. Каждое «пф» гасит свечку. Проще: 3 свечки; сложнее: 5 */
  X.candles = async (o = {}) => {
    const n = o.level > 0 ? 5 : 3;
    const b = board(), w = SA.el('div', 'full center'); w.innerHTML = SA.cakeSVG(n); b.appendChild(w);
    const fl = [...w.querySelectorAll('.flame')]; let out = 0;
    const blowOut = () => { const f = fl[out++]; if (!f) return; A.sfx.puff(); f.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'scale(.3) translateY(-20px)'}], {duration: 350, fill: 'forwards'}); };
    fl.forEach(f => f.animate([{transform: 'scaleY(1)'}, {transform: 'scaleY(1.15)'}], {duration: 300, iterations: Infinity, direction: 'alternate'}));
    T.body(1, 'explain'); await say('t1_kerzen_intro');
    T.face(1, 'blow'); A.sfx.puff(); await sleep(600); T.face(1);
    let attempts = 0, seen = 0;
    const prompts = ['t1_kerzen2', 't1_ru_kerzen'];
    for (let round = 0; round < 3 && out < n; round++){
      attempts++;
      const st = await M.blow({ms: 7000, onTick(a, l, s){ while (s.puffs > seen && out < n){ seen++; blowOut(); } }, until: () => out >= n});
      if (out >= n) break;
      if (round < 2) await say(st.any ? 't1_kerzen2' : prompts[round]);
    }
    const done = out >= n;
    while (out < n){ blowOut(); await sleep(200); }
    T.body(1, done ? 'praise' : 'support'); SA.starEl(b);
    await (done ? praise(1) : support(1));
    P.item({block: 'breath', id: 'kerzen', kind: 'blow', result: done ? 'done' : 'tried', attempts, level: o.level || 0});
  };

  /* ---------- зеркало (Учительница 1, камера) ---------- */
  const EX = {
    frosch: {pose: 'smile', say: ['t1_frosch', 't1_frosch2', 't1_ru_frosch'], cam: true},
    kuss: {pose: 'kiss', say: ['t1_kuss', 't1_kuss2', 't1_ru_kuss'], cam: true},
    loewe: {pose: 'open_wide', say: ['t1_loewe', 't1_loewe2', 't1_ru_loewe'], cam: true},
    hamster: {pose: 'cheeks', say: ['t1_hamster', 't1_hamster2', 't1_ru_hamster'], cam: true}
  };
  let mirrorEl = null;
  X.mirrorStart = async () => {
    const b = board(); mirrorEl = SA.el('div', 'mirror'); b.appendChild(mirrorEl);
    T.face(1);
    const cam = SA.AUTO ? false : await SA.C.start(mirrorEl);
    if (!cam){ const nc = SA.el('div', 'nocam', SA.pic('kind')); mirrorEl.appendChild(nc); }
    await say('t1_spiegel_intro');
    if (!cam) await say('t1_ohne_kamera');
    P.item({block: 'mirror', id: 'kamera', kind: 'info', result: cam ? (SA.C.ready ? 'camera' : 'camera-noface') : 'nocamera'});
  };
  X.mirrorStop = async () => { SA.C.stop(); await say('t1_ende'); };
  /* одно упражнение: показ → «теперь ты» → держать. Камера засчитывает позу (держит ~1 с), иначе — старалась 4 с (таймер),
     или родитель ✓. Повторов: проще 1, обычно 2, сложнее 3 (и держать дольше) */
  X.exercise = async (id, o = {}) => {
    const e = EX[id], reps = o.level > 0 ? 3 : o.level < 0 ? 1 : 2, holdMs = o.level > 0 ? 1600 : 900;
    T.face(1); await say(e.say[0]);
    T.face(1, e.pose); await sleep(1600);
    const rec = P.item({block: 'mirror', id, kind: 'pose', result: null, reps: []});
    let parentOk = false; X.marks(rec, () => { parentOk = true; });
    for (let r = 0; r < reps; r++){
      if (r > 0){ T.face(1); await say('t1_nochmal'); T.face(1, e.pose); }
      const tm = SA.el('div', 'timer', '<i></i><i></i><i></i><i></i>'); mirrorEl.appendChild(tm);
      const dots = [...tm.children];
      const t0 = SA.now(); let caughtFor = 0, last = SA.now(), how = null, prompt = 1;
      const camOk = SA.C.ready && SA.C.face;
      while (!how){
        await sleep(60);
        const now = SA.now(), dt = now - last; last = now;
        if (parentOk){ how = 'parent'; break; }
        if (SA.AUTO && now - t0 > 800){ how = 'timer'; break; }
        if (SA.C.sees(e.pose)){ caughtFor += dt; mirrorEl.classList.add('caught'); } else { caughtFor = Math.max(0, caughtFor - dt*0.5); mirrorEl.classList.remove('caught'); }
        const f = camOk ? caughtFor/holdMs : (now - t0)/4000;
        dots.forEach((d, i) => d.classList.toggle('on', f > i/4));
        if (camOk && caughtFor >= holdMs){ how = 'camera'; break; }
        if (!camOk && now - t0 > 4000){ how = 'timer'; break; }
        /* камера видит лицо, но позы нет: подсказки, потом засчитываем старание */
        if (camOk && now - t0 > 4500*prompt){
          if (prompt <= 2){ T.face(1); await say(e.say[prompt]); T.face(1, e.pose); last = SA.now(); prompt++; }
          else { how = 'timer'; break; }
        }
      }
      tm.remove(); mirrorEl.classList.remove('caught');
      rec.reps.push(how); P._flush();
      if (how === 'camera' || how === 'parent') SA.starEl(mirrorEl); else A.sfx.soft();
    }
    X.marks(null);
    rec.result = rec.reps.includes('camera') ? 'camera' : rec.reps.includes('parent') ? 'parent' : 'timer'; P._flush();
    T.face(1); await praise(1);
  };

  /* ---------- танцпауза (все три) ---------- */
  X.dance = async (n, sec = 20) => {
    const b = board(), row = SA.el('div', 'cards');
    const others = [1, 2, 3].filter(k => k !== n);
    for (const k of others){ const c = SA.el('div', 'card'); c.style.cssText = 'background:transparent;box-shadow:none;max-width:40%;aspect-ratio:2/3'; c.innerHTML = `<img class="pic" style="object-fit:contain" src="${T.src(k, 'body_dance')}" alt="">`; c.classList.add('wobble'); row.appendChild(c); }
    b.appendChild(row);
    T.body(n, 'hello'); await say(n === 1 ? 't1_tanz' : 't3_tanz');
    T.dance(n, true);
    const mus = A.music(sec);
    const has2 = k => !!T.img[`${k}_body_dance2`];
    const t0 = SA.now(); let f = 0;
    try {
      while (SA.now() - t0 < sec*1000/SA.SPEED){
        await sleep(500); f++;
        const imgs = row.querySelectorAll('img');
        others.forEach((k, i) => { if (has2(k)) imgs[i].src = T.src(k, f % 2 ? 'body_dance2' : 'body_dance'); });
        if (has2(n)) SA.$('#tview img').src = T.src(n, f % 2 ? 'body_dance2' : 'body_dance');
      }
    } finally { mus.stop(); T.dance(n, false); }
    T.body(n, 'praise'); await say(n === 1 ? 't1_tanz_ende' : 't3_tanz_ende');
    P.item({block: 'dance', id: 'tanz' + n, kind: 'dance', result: 'done'});
  };

  /* ---------- слушаем (Учительница 2): ответ нажатием — тут правильность честно видна ---------- */
  const ANIMALS = {kuh: 't2_muh', katze: 't2_miau', hund: 't2_wau', schaf: 't2_maeh', frosch: 't2_quak'};
  X.listenHello = async () => { T.body(2, 'hello'); await say('t2_hallo'); };
  /* знакомство: учительница называет каждое животное (незнание слова — не ошибка, поэтому сначала учим) */
  X.animalsIntro = async () => {
    const b = board();
    for (const a of Object.keys(ANIMALS)){
      b.innerHTML = ''; const c = X.bigCard(b, SA.pic(a));
      T.body(2, 'point'); await say('t2_' + a);
    }
  };
  /* Wer macht das? — цель: слуховое внимание, «найди картинку по звуку». Проще: 2 картинки; сложнее: 4 */
  X.whoRound = async (o = {}) => {
    const k = o.level > 0 ? 4 : o.level < 0 ? 2 : 3;
    const set = SA.shuffle(Object.keys(ANIMALS)).slice(0, k), target = SA.pick(set);
    const b = board(), row = SA.el('div', 'cards'); b.appendChild(row);
    const cards = set.map(a => { const c = SA.el('div', 'card pop', SA.pic(a)); row.appendChild(c); return c; });
    T.body(2, 'listen'); await sleep(400); await say(ANIMALS[target]);
    T.body(2, 'point');
    let attempts = 0, firstOk = null;
    while (attempts < 3){
      attempts++;
      const i = await waitTap(cards, attempts === 1 ? ['t2_wer', 't2_wer2', 't2_ru_wer'] : [null, 't2_wer2', 't2_ru_wer'], () => say(ANIMALS[target]), set.indexOf(target));
      if (i < 0) break;
      if (set[i] === target){ if (firstOk === null) firstOk = attempts === 1; cards[i].classList.add('ok'); A.sfx.ding(); T.body(2, 'praise'); SA.starEl(b); await praise(2); break; }
      firstOk = false; cards[i].classList.add('no'); A.sfx.soft(); setTimeout(() => cards[i].classList.remove('no'), 500);
      T.body(2, 'support'); await say('t2_nochmal'); T.body(2, 'listen'); await say(ANIMALS[target]); T.body(2, 'point');
    }
    if (firstOk === null){ cards[set.indexOf(target)].classList.add('glow'); T.body(2, 'support'); await support(2); }
    P.item({block: 'listen', id: 'wer:' + target, kind: 'tap', result: firstOk ? 'ok' : firstOk === false ? 'retry' : 'none', attempts, level: o.level || 0});
  };
  /* Gleich oder anders? — цель: различение. Сначала звуки животных (потом в занятиях 2+ — слоги) */
  X.sameIntro = async () => {
    const b = board(), row = SA.el('div', 'cards'); b.appendChild(row);
    const g = SA.el('div', 'card pop', SA.pic('gleich')), a = SA.el('div', 'card pop', SA.pic('anders')); row.append(g, a);
    T.body(2, 'point'); await say('t2_gleich_intro');
    g.classList.add('glow'); await say('t2_gleich_zeig'); g.classList.remove('glow');
    a.classList.add('glow'); await say('t2_anders_zeig'); a.classList.remove('glow');
  };
  X.sameRound = async (same) => {
    const keys = Object.values(ANIMALS), s1 = SA.pick(keys), s2 = same ? s1 : SA.pick(keys.filter(k => k !== s1));
    const b = board();
    const bub = SA.el('div', 'dots', '<i></i><i></i>'); bub.style.top = '8%'; bub.querySelectorAll('i').forEach(i => { i.style.width = i.style.height = '28px'; }); b.appendChild(bub);
    const row = SA.el('div', 'cards'); row.style.top = '22%'; b.appendChild(row);
    const g = SA.el('div', 'card', SA.pic('gleich')), a = SA.el('div', 'card', SA.pic('anders')); row.append(g, a);
    const pair = async () => { const d = bub.children; d[0].classList.add('on'); await say(s1); await sleep(350); d[1].classList.add('on'); await say(s2); await sleep(200); d[0].classList.remove('on'); d[1].classList.remove('on'); };
    T.body(2, 'listen'); await pair(); T.body(2, 'point');
    const right = same ? 0 : 1, cards = [g, a];
    let attempts = 0, firstOk = null;
    while (attempts < 3){
      attempts++;
      const i = await waitTap(cards, attempts === 1 ? ['t2_gleich2', 't2_gleich2', 't2_ru_gleich'] : [null, 't2_gleich2', 't2_ru_gleich'], pair, right);
      if (i < 0) break;
      if (i === right){ if (firstOk === null) firstOk = attempts === 1; cards[i].classList.add('ok'); A.sfx.ding(); T.body(2, 'praise'); SA.starEl(b); await praise(2); break; }
      firstOk = false; cards[i].classList.add('no'); A.sfx.soft(); setTimeout(() => cards[i].classList.remove('no'), 500);
      T.body(2, 'support'); await say('t2_nochmal'); T.body(2, 'listen'); await pair(); T.body(2, 'point');
    }
    if (firstOk === null){ cards[right].classList.add('glow'); T.body(2, 'support'); await support(2); }
    P.item({block: 'listen', id: 'gleich:' + (same ? 'gleich' : 'anders'), kind: 'tap', result: firstOk ? 'ok' : firstOk === false ? 'retry' : 'none', attempts});
  };
  X.listenBye = async () => { T.body(2, 'praise'); await say('t2_ende'); };

  /* ---------- говорим (Учительница 3): микрофон = попытка; правильность отмечает родитель ✓ / ~ ---------- */
  /* «послушай себя»: образец учительницы, потом запись Эмили */
  const ear = () => SA.$('#ear');
  let earPair = null;
  async function playPair(){
    if (!earPair) return;
    const {model, vis, url} = earPair;
    T.face(3); await say(model, {vis});
    await sleep(250);
    await SA.guard(new Promise(res => { const au = new Audio(url); au.onended = res; au.onerror = res; au.play().catch(res); setTimeout(res, 8000); }));
  }
  document.addEventListener('DOMContentLoaded', () => ear().addEventListener('pointerdown', e => { e.preventDefault(); ear().hidden = true; playPair().catch(() => {}).finally(() => { if (earPair) ear().hidden = false; }); }));
  X.earOff = () => { earPair = null; ear().hidden = true; };

  /* одна попытка-повтор: образец → «теперь ты» → микрофон; молчит: «скажи со мной» + образец, потом русская подсказка + образец */
  async function repeatItem({id, model, vis, words = 1, prompts = ['t3_jetzt_du', 't3_jetzt_du2', 't3_ru_jetzt_du'], block = 'speak', showPic, hear}){
    X.earOff();
    const rec = P.item({block, id, kind: 'speak', result: null, attempts: 0, mark: null});
    X.marks(rec);
    let ok = false, url = null;
    for (let a = 0; a < 3 && !ok; a++){
      rec.attempts = a + 1;
      T.face(3); await say(model, {vis});
      await say(prompts[a]);
      T.body(3, 'listen');
      const r = await M.listen({words, record: true});
      T.face(3);
      if (r.ok){ ok = true; url = r.url; }
      else if (r.nomic){ ok = true; rec.result = 'nomic'; }
    }
    rec.result = rec.result || (ok ? 'heard' : 'none'); P._flush();
    if (ok){ if (showPic) SA.starEl(showPic); T.body(3, 'praise'); await praise(3); }
    else { T.body(3, 'support'); await say('t3_spaeter'); }
    if (url){ earPair = {model, vis, url}; ear().hidden = false;
      if (hear){ T.face(3); await say('t3_hoer_dich'); ear().hidden = true; await playPair(); ear().hidden = false; } }
    return {ok, rec};
  }
  X.repeatItem = repeatItem;

  X.speakIntro = async () => { T.face(3); await say('t3_sprechen_intro'); };
  const VOW = {a: 'talk_open', o: 'talk_o', i: 'talk_i', u: 'talk_u'};
  /* гласные: цель — чёткие позы рта (видно на картинке рта учительницы). Образец, потом короткий образец */
  X.vowel = async (v) => {
    const b = board(), c = X.bigCard(b, `<img class="pic" style="object-fit:contain" src="${T.src(3, 'face_' + VOW[v])}" alt="">`);
    T.face(3); await say('t3_' + v, {vis: VOW[v]});
    await repeatItem({id: 'vokal:' + v, model: `t3_${v}_kurz`, vis: VOW[v], showPic: b});
  };
  /* звукоподражания: доступны и без знания немецкого */
  const TIERE = {muh: ['kuh', 'talk_u'], maeh: ['schaf', 'talk_open'], wau: ['hund', 'talk_o'], miau: ['katze', 'talk_i']};
  X.tiereIntro = async () => { T.face(3); await say('t3_tiere_intro'); };
  X.tier = async (k, hear) => {
    const [pic, vis] = TIERE[k];
    const b = board(), c = X.bigCard(b, SA.pic(pic));
    await repeatItem({id: 'tier:' + k, model: 't3_' + k, vis, showPic: b, hear});
  };
  /* слова: сначала учительница называет картинку («Das ist ein Ball» — учим слово), потом образец и повтор */
  X.WORDS = ['auto', 'ei', 'ball', 'baum', 'oma', 'puppe'];
  const WVIS = {auto: 'talk_open', ei: 'talk_open', ball: 'talk_open', baum: 'talk_open', oma: 'talk_o', puppe: 'talk_u'};
  X.wordsIntro = async () => { T.face(3); await say('t3_woerter_intro'); };
  X.word = async (w, hear) => {
    const b = board(), c = X.bigCard(b, SA.pic(w));
    T.body(3, 'point'); await say('t3_s_' + w);
    await repeatItem({id: 'wort:' + w, model: 't3_w_' + w, vis: WVIS[w], showPic: b, hear});
  };

  /* ---------- игра «Zauberkiste» (Учительница 3): те же слова, каждое сказанное слово выпрыгивает на полку ---------- */
  X.game = async (words) => {
    X.earOff();
    const b = board();
    const box = SA.el('div', ''); box.style.cssText = 'position:absolute;left:30%;width:40%;top:22%;aspect-ratio:1'; box.innerHTML = SA.pic('kiste', false); b.appendChild(box);
    const peek = SA.el('div', ''); peek.style.cssText = 'position:absolute;left:38%;width:24%;top:14%;aspect-ratio:1;opacity:0;transition:transform .4s,opacity .3s'; b.appendChild(peek);
    const shelf = SA.el('div', 'shelf'); b.appendChild(shelf);
    T.body(3, 'explain'); await say('t3_spiel_intro');
    let first = true;
    for (const w of words){
      if (left() < 8 && !first) break;
      box.innerHTML = SA.pic('kiste', false); box.classList.add('wobble');
      peek.innerHTML = SA.pic(w); peek.style.opacity = '1'; peek.style.transform = 'translateY(30%) scale(.8)';
      await sleep(500); box.classList.remove('wobble');
      T.body(3, 'point'); if (first) await say('t3_spiel_sag');
      const r = await repeatItem({id: 'spiel:' + w, model: 't3_w_' + w, vis: WVIS[w], block: 'game', prompts: ['t3_spiel_sag2', 't3_jetzt_du2', 't3_ru_spiel']});
      /* слово выпрыгивает в любом случае: игра не наказывает */
      box.innerHTML = SA.pic('kiste', true); A.sfx.pop();
      peek.style.transform = 'translateY(-40%) scale(1.1)'; await sleep(450);
      const s = SA.el('div', 'pop', SA.pic(w)); shelf.appendChild(s); peek.style.opacity = '0';
      first = false; void r;
    }
    X.earOff(); X.marks(null);
    T.body(3, 'praise'); A.sfx.fanfare(); await say('t3_spiel_ende');
  };

  /* ---------- итог: похвала, яйцо, прощание всех ---------- */
  X.finale = async (res, early) => {
    X.earOff(); X.marks(null);
    const b = board();
    const st = SA.P.settings(), img = st.rewardImg;
    const eggBox = SA.el('div', ''); eggBox.style.cssText = 'position:absolute;left:50%;top:50%;width:min(46%,60vh);aspect-ratio:200/200;transform:translate(-50%,-50%)'; b.appendChild(eggBox);
    const before = Math.max(0, (res.filled - (res.egg ? 1 : 0)))/res.target;
    eggBox.innerHTML = SA.eggSVG(Math.min(1, before), res.target, img);
    T.body(3, 'praise');
    await say(early ? 't3_frueh_ende' : 't3_ende');
    if (res.egg){
      const to = Math.min(1, res.filled/res.target), t0 = SA.now();
      A.sfx.sparkle();
      while (SA.now() - t0 < 1400){ const k = (SA.now() - t0)/1400; eggBox.innerHTML = SA.eggSVG(before + (to - before)*k, res.target, img); await new Promise(r => requestAnimationFrame(r)); }
      eggBox.innerHTML = SA.eggSVG(to, res.target, img);
      T.body(3, 'point');
      if (res.full){ A.sfx.fanfare(); eggBox.classList.add('wobble'); SA.starEl(b); await say('t3_ei_voll'); SA.P.emptyEgg(); }
      else if (res.target - res.filled === 1) await say('t3_ei_bald');
      else await say('t3_ei');
    }
    if (!early){
      for (const n of [1, 2, 3]){ T.body(n, 'bye'); await say(`t${n}_tschuess`); }
    }
    await sleep(800);
  };
})();
