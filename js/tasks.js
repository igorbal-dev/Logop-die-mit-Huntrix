/* Кирпичики заданий. Правила темпа (после отзыва 5.11):
   - объяснение звучит ОДИН раз за упражнение (X.once); дальше — только сама загадка/образец;
   - ответить можно сразу, даже пока учительница говорит: нажатие обрывает реплику (A.cut);
   - подсказки (немецкий → другой немецкий → русский) — только если ребёнок ничего не делает 7 с;
   - кнопка «?» рядом с учительницей повторяет объяснение;
   - похвала короткая и не каждый раз голосом (иногда только звёздочка и звук).
   Логопедия та же: до 3 попыток, никаких «неправильно», правильность речи отмечает родитель ✓ / ~. */
(function(){
  const A = SA.A, T = SA.T, M = SA.M, P = SA.P;
  const say = (k, o) => A.say(k, o), sleep = SA.sleep;
  const X = SA.X = {};
  const board = X.board = () => { const b = SA.$('#board'); b.innerHTML = ''; return b; };
  const has = k => !!A.LINES[k];
  const PRAISE = {1: ['t1_lob1', 't1_lob2', 't1_lob3', 't1_lob4', 't1_lob5', 't1_lob6', 't1_lob7', 't1_lob8'], 2: ['t2_lob1', 't2_lob2', 't2_lob3', 't2_lob4', 't2_lob5', 't2_lob6', 't2_lob7', 't2_lob8'],
    3: ['t3_lob1', 't3_lob2', 't3_lob3', 't3_lob4', 't3_lob5', 't3_lob6', 't3_lob7', 't3_lob8', 't3_lob9', 't3_lob10']};
  const SUPPORT = {1: ['t1_mut1', 't1_mut2', 't1_mut3', 't1_mut4'], 2: ['t2_mut1', 't2_mut2', 't2_mut3', 't2_mut4'], 3: ['t3_mut1', 't3_mut2', 't3_mut3', 't3_mut4', 't3_mut5']};
  const POSES = ['praise', 'hello', 'bye'];
  let praiseN = 0;
  /* похвала: звёздочка всегда, голосом — через раз (чтобы не надоедало), поза — разная */
  X.praise = async (n, host, force) => {
    if (host) SA.starEl(host);
    T.body(n, SA.pick(POSES.filter(p => p !== 'bye' || n === 3)));
    if (force || (praiseN++ % 2 === 0)) await A.sayOne(PRAISE[n].filter(has)); else await sleep(450);
  };
  X.support = async n => { T.body(n, 'support'); await A.sayOne(SUPPORT[n].filter(has)); };
  const left = () => SA.E ? SA.E.left() : 999;
  X.left = left;
  /* объяснение — один раз за упражнение */
  X.once = key => { const E = SA.E; if (!E) return true; if (E.told.has(key)) return false; E.told.add(key); return true; };
  /* кнопка «?»: повторить объяснение текущего задания */
  let helpKeys = null, helpN = 0;
  X.help = (n, keys) => { helpN = n; helpKeys = keys && keys.length ? keys : null; SA.$('#help').hidden = !helpKeys; };
  document.addEventListener('DOMContentLoaded', () => SA.$('#help').addEventListener('pointerdown', async e => {
    e.preventDefault(); if (!helpKeys) return; A.cut(); A.sfx.pop();
    for (const k of helpKeys) await A.say(k, {always: true});
  }));
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

  /* ---------- нажатие: слушаем пальцы СРАЗУ, реплика обрывается нажатием ---------- */
  /* prompts: [первое объяснение или null, немецкая подсказка, русская подсказка]; cue() — загадка (звук) */
  X.waitTap = async (cards, {prompts = [], cue, right, waitMs = 7000} = {}) => {
    let tapped = -1, done = false;
    const tap = SA.tapOne(cards).then(i => { tapped = i; done = true; A.cut(); return i; });
    if (SA.AUTO) sleep(500).then(() => { if (!done){ done = true; tapped = right ?? 0; A.cut(); } }).catch(() => {});
    const until = async ms => { const t0 = SA.now(); while (!done && SA.now() - t0 < ms) await sleep(60); };
    if (cue) await cue();
    if (!done && prompts[0]) await say(prompts[0]);
    await until(waitMs);
    for (const k of [prompts[1], prompts[2]]){
      if (done || !k) continue;
      cards.forEach(c => c.classList.add('glow'));
      if (cue) await cue();
      if (!done) await say(k);
      cards.forEach(c => c.classList.remove('glow'));
      await until(waitMs);
    }
    if (!done){ cards.forEach(c => c.classList.remove('glow')); return -1; }
    return tapped;
  };

  /* ---------- ритуал начала урока (коротко, всегда одинаково) ---------- */
  X.ritual = async () => {
    const b = board(), row = SA.el('div', 'cards');
    const cs = [1, 2].map(n => { const c = SA.el('div', 'card'); c.style.cssText = 'background:transparent;box-shadow:none;width:42%;max-width:42%;aspect-ratio:2/3;padding:0'; c.innerHTML = `<img class="pic" style="object-fit:contain" src="${T.src(n, 'body_hello')}" alt="">`; row.appendChild(c); return c; });
    b.appendChild(row);
    T.body(3, 'hello');
    await say('t3_ritual_hallo');
    cs[0].classList.add('pop'); await say(A.has('t1_ich_bin') ? 't1_ich_bin' : 't1_hallo_kurz');
    cs[1].classList.add('pop'); await say(A.has('t2_ich_bin') ? 't2_ich_bin' : 't2_hallo_kurz');
    await say(A.has('t3_ich_bin') ? 't3_ich_bin' : 't3_hallo_kurz');
    T.body(3, 'listen');
    let heard = false;
    for (const k of ['t3_ritual_ruf', 't3_ritual_ruf2', 't3_ru_ritual']){
      await say(k);
      const r = await M.listen({words: 1, noVoiceMs: 6000});
      if (r.ok){ heard = true; break; }
      if (r.nomic) break;
    }
    if (heard) SA.starEl(b);
    T.body(3, 'praise'); await say('t3_ritual_ok');
    P.item({block: 'ritual', id: 'hallo', kind: 'speak', result: heard ? 'heard' : (M.ok ? 'none' : 'nomic')});
  };

  /* ========== ДЫХАНИЕ (Rumi) — микрофон ловит именно выдох (js/breath.js) ========== */
  /* общий цикл: до 3 попыток; молчит — подсказки; говорит вместо выдоха — «Psst, nur pusten!» (один раз) */
  async function breathLoop({prompts, done, onAir, onPuff, ms = 6000, block = 'breath', id}){
    let attempts = 0, saidPsst = false, seenPuffs = 0;
    for (let a = 0; a < 3 && !done(); a++){
      attempts++;
      T.face(1, 'blow');
      const st = await M.blow({ms, onTick(air, s){ if (air) onAir && onAir(); while (s.puffs > seenPuffs){ seenPuffs++; onPuff && onPuff(); } }, until: () => done()});
      T.face(1);
      if (done()) break;
      if (!st.any && st.voiceMs > 700 && !saidPsst){ saidPsst = true; await say('t1_nur_pusten'); continue; }
      if (!st.any){ if (prompts[a + 1]) await say(prompts[a + 1]); else if (a === 1) await say('t1_naeher'); }
    }
    const ok = done();
    P.item({block, id, kind: 'blow', result: ok ? 'done' : 'tried', attempts});
    return ok;
  }
  /* Pusteblume — длинный плавный выдох. Проще: пушинка за 80 мс; сложнее: за 200 мс */
  X.dandelion = async (o = {}) => {
    const n = 14, per = o.level > 0 ? 200 : o.level < 0 ? 80 : 130;
    const b = board(), w = SA.el('div', 'full center'); w.innerHTML = SA.dandelionSVG(n); b.appendChild(w);
    const seeds = [...w.querySelectorAll('.seed')]; let gone = 0, acc = 0;
    const fly = () => { const s = seeds[gone++]; if (!s) return; const a = Math.random()*60 - 30;
      s.animate([{transform: 'none', opacity: 1}, {transform: `translate(${120 + Math.random()*160}px,${-80 - Math.random()*140}px) rotate(${a}deg)`, opacity: 0}], {duration: 1600, easing: 'ease-out', fill: 'forwards'}); };
    X.help(1, ['t1_puste_intro', 't1_riechen', 't1_puste']);
    if (X.once('pusteblume')){
      T.body(1, 'explain'); await say('t1_puste_intro');
      T.face(1, 'smell'); await say('t1_riechen');
      T.face(1, 'blow'); A.sfx.whoosh(); fly(); await sleep(200); fly(); await sleep(400);
      T.face(1); await say('t1_puste');
    } else { T.face(1, 'blow'); await sleep(300); }
    const ok = await breathLoop({id: 'pusteblume', prompts: [null, 't1_puste2', 't1_ru_puste'], done: () => gone >= n,
      onAir(){ acc += 30; if (acc >= per){ acc = 0; fly(); } }});
    while (gone < n){ fly(); await sleep(50); }
    await (ok ? X.praise(1, b) : X.support(1));
  };
  /* Kerzen — короткие сильные выдохи: каждое «пф» гасит свечку. Проще 3, сложнее 5 */
  X.candles = async (o = {}) => {
    const n = o.level > 0 ? 5 : 3;
    const b = board(), w = SA.el('div', 'full center'); w.innerHTML = SA.cakeSVG(n); b.appendChild(w);
    const fl = [...w.querySelectorAll('.flame')]; let out = 0;
    fl.forEach(f => f.animate([{transform: 'scaleY(1)'}, {transform: 'scaleY(1.15)'}], {duration: 300, iterations: Infinity, direction: 'alternate'}));
    const blowOut = () => { const f = fl[out++]; if (!f) return; A.sfx.puff(); f.animate([{opacity: 1, transform: 'scale(1)'}, {opacity: 0, transform: 'scale(.3) translateY(-20px)'}], {duration: 300, fill: 'forwards'}); };
    X.help(1, ['t1_kerzen_intro']);
    if (X.once('kerzen')){ T.body(1, 'explain'); await say('t1_kerzen_intro'); T.face(1, 'blow'); A.sfx.puff(); await sleep(400); T.face(1); }
    const ok = await breathLoop({id: 'kerzen', ms: 7000, prompts: [null, 't1_kerzen2', 't1_ru_kerzen'], done: () => out >= n, onPuff: blowOut});
    while (out < n){ blowOut(); await sleep(150); }
    await (ok ? X.praise(1, b) : X.support(1));
  };
  /* Schiffchen — долгий равномерный выдох: пока дует, кораблик плывёт к острову */
  X.boat = async (o = {}) => {
    const b = board(), sea = SA.el('div', 'full'); sea.style.background = 'linear-gradient(#0000 55%, #bfe6ff 55%)'; b.appendChild(sea);
    const isl = SA.el('div', ''); isl.style.cssText = 'position:absolute;right:4%;bottom:26%;width:26%;aspect-ratio:1'; isl.innerHTML = SA.pic('insel'); b.appendChild(isl);
    const boat = SA.el('div', 'boat'); boat.style.cssText = 'position:absolute;left:4%;bottom:30%;width:22%;aspect-ratio:1'; boat.innerHTML = SA.pic('schiff'); b.appendChild(boat);
    let pos = 0; const need = o.level > 0 ? 4000 : 2500;
    const move = () => { boat.style.transform = `translateX(${pos/need*(b.clientWidth*0.56)}px) rotate(${Math.sin(SA.now()/200)*4}deg)`; };
    X.help(1, ['t1_schiff_intro']);
    if (X.once('schiff')){ T.body(1, 'explain'); await say('t1_schiff_intro'); }
    const ok = await breathLoop({id: 'schiff', ms: 7000, prompts: [null, 't1_schiff2', 't1_ru_schiff'], done: () => pos >= need, onAir(){ pos = Math.min(need, pos + 30); move(); }});
    pos = need; move();
    await (ok ? X.praise(1, b) : X.support(1));
  };
  /* Schlange / Zug — долгий выдох СО звуком «ссс» / «шшш» (тут шипение и нужно — считаем любой звук ≥ 1,2 с) */
  X.hiss = async (kind) => {
    const b = board(), c = X.bigCard(b, SA.pic(kind === 'zug' ? 'zug' : 'schlange'));
    const k = kind === 'zug' ? 'zug' : 'schlange';
    X.help(1, [`t1_${k}`]);
    T.face(1, kind === 'zug' ? 'kiss' : 'smile'); await say(`t1_${k}`);
    let ok = false, attempts = 0;
    for (let a = 0; a < 3 && !ok; a++){
      attempts++;
      const st = await M.blow({ms: 6000, until: s => s.loudMs >= 1200});
      if (st.loudMs >= 1200 || !M.rawOk) ok = true;
      else await say(a === 0 ? `t1_${k}2` : `t1_ru_${k}`);
    }
    T.face(1);
    P.item({block: 'breath', id: k, kind: 'blow', result: ok ? 'done' : 'tried', attempts});
    await (ok ? X.praise(1, c) : X.support(1));
  };

  /* ========== ЗЕРКАЛО (Rumi, камера) ========== */
  /* cam — камера засчитывает сама (надёжно: улыбка, трубочка, рот, щёки); иначе таймер «старалась» или ✓ родителя */
  const EX = {
    frosch: {pose: 'smile', say: ['t1_frosch', 't1_frosch2', 't1_ru_frosch'], cam: true},
    kuss: {pose: 'kiss', say: ['t1_kuss', 't1_kuss2', 't1_ru_kuss'], cam: true},
    loewe: {pose: 'open_wide', say: ['t1_loewe', 't1_loewe2', 't1_ru_loewe'], cam: true},
    hamster: {pose: 'cheeks', say: ['t1_hamster', 't1_hamster2', 't1_ru_hamster'], cam: true},
    pusten: {pose: 'blow', say: ['t1_pusten_pose', 't1_pusten_pose2', 't1_ru_pusten_pose'], cam: true},
    wechsel: {pose: 'smile', alt: 'kiss', say: ['t1_wechsel', 't1_wechsel2', 't1_ru_wechsel'], cam: true},
    zunge_raus: {pose: 'tongue_out', say: ['t1_zunge_raus', 't1_zunge_raus2', 't1_ru_zunge_raus']},
    nase: {pose: 'tongue_up', say: ['t1_nase', 't1_nase2', 't1_ru_nase']},
    kinn: {pose: 'tongue_down', say: ['t1_kinn', 't1_kinn2', 't1_ru_kinn']},
    uhr: {pose: 'tongue_left', alt: 'tongue_right', say: ['t1_uhr', 't1_uhr2', 't1_ru_uhr']},
    marmelade: {pose: 'tongue_left', seq: ['tongue_left', 'lick', 'tongue_right'], say: ['t1_marmelade', 't1_marmelade2', 't1_ru_marmelade']}
  };
  X.EX = EX;
  let mirrorEl = null, demoTimer = null;
  X.mirrorStart = async () => {
    const b = board(); mirrorEl = SA.el('div', 'mirror'); b.appendChild(mirrorEl);
    T.face(1);
    const cam = SA.AUTO ? false : await SA.C.start(mirrorEl);
    if (!cam){ mirrorEl.appendChild(SA.el('div', 'nocam', SA.pic('kind'))); }
    if (X.once('spiegel')){ await say('t1_spiegel_intro'); if (!cam) await say('t1_ohne_kamera'); }
    P.item({block: 'mirror', id: 'kamera', kind: 'info', result: cam ? (SA.C.ready ? 'camera' : 'camera-noface') : 'nocamera'});
  };
  X.mirrorStop = () => { SA.C.stop(); clearInterval(demoTimer); };
  /* учительница «двигается»: для чередований и Marmelade кадры сменяются */
  function demo(e){
    clearInterval(demoTimer);
    const frames = e.seq || (e.alt ? [e.pose, e.alt] : [e.pose]);
    let i = 0; T.face(1, frames[0]);
    if (frames.length > 1) demoTimer = setInterval(() => { i = (i + 1) % frames.length; T.face(1, frames[i]); }, 700);
  }
  /* одно упражнение: объяснение (один раз) + показ → ребёнок держит позу. Камера: держать ~1 с (смена позы — для чередований);
     без камеры/язык: старание 3,5 с засчитывается таймером. Повторов: проще 1, обычно 2, сложнее 3 */
  X.exercise = async (id, o = {}) => {
    const e = EX[id], reps = o.level > 0 ? 3 : o.level < 0 ? 1 : 2, holdMs = o.level > 0 ? 1500 : 900;
    X.help(1, [e.say[0]]);
    T.face(1); await say(e.say[0]);
    demo(e);
    const rec = P.item({block: 'mirror', id, kind: 'pose', result: null, reps: []});
    let parentOk = false; X.marks(rec, () => { parentOk = true; });
    const camOk = e.cam && SA.C.ready;
    for (let r = 0; r < reps; r++){
      if (r > 0) A.sfx.pop();
      const tm = SA.el('div', 'timer', '<i></i><i></i><i></i><i></i>'); mirrorEl.appendChild(tm);
      const dots = [...tm.children];
      const t0 = SA.now(); let caught = 0, last = SA.now(), how = null, prompt = 1, phase = 0;
      while (!how){
        await sleep(60);
        const now = SA.now(), dt = now - last; last = now;
        if (parentOk){ how = 'parent'; break; }
        if (SA.AUTO && now - t0 > 600){ how = 'timer'; break; }
        const face = camOk && SA.C.face;
        if (face){
          /* чередование: засчитываем смены поз (улыбка → трубочка → улыбка) */
          const want = e.alt && phase % 2 ? e.alt : e.pose;
          if (SA.C.sees(want)){ caught += dt; mirrorEl.classList.add('caught'); } else { caught = Math.max(0, caught - dt*0.5); mirrorEl.classList.remove('caught'); }
          const need = e.alt ? 450 : holdMs;
          if (caught >= need){ if (e.alt && phase < 3){ phase++; caught = 0; A.sfx.tone(700 + phase*120, 900 + phase*120, 120, 'sine', .12); } else { how = 'camera'; break; } }
          dots.forEach((d, i) => d.classList.toggle('on', e.alt ? i < phase + (caught > 0 ? 1 : 0) : caught/need > i/4));
          if (now - t0 > 4500*prompt){
            if (prompt <= 2){ await say(e.say[prompt]); last = SA.now(); prompt++; }
            else { how = 'timer'; break; }
          }
        } else {
          const f = (now - t0)/3500;
          dots.forEach((d, i) => d.classList.toggle('on', f > i/4));
          if (f >= 1){ how = 'timer'; break; }
        }
      }
      tm.remove(); mirrorEl.classList.remove('caught');
      rec.reps.push(how); P._flush();
      if (how === 'camera' || how === 'parent') SA.starEl(mirrorEl); else A.sfx.soft();
    }
    clearInterval(demoTimer); X.marks(null);
    rec.result = rec.reps.includes('camera') ? 'camera' : rec.reps.includes('parent') ? 'parent' : 'timer'; P._flush();
    T.face(1); await X.praise(1, null);
  };

  /* ========== ТАНЦПАУЗА ========== */
  X.dance = async (n, sec = 20) => {
    const b = board(), row = SA.el('div', 'cards');
    const others = [1, 2, 3].filter(k => k !== n);
    for (const k of others){ const c = SA.el('div', 'card'); c.style.cssText = 'background:transparent;box-shadow:none;width:44%;max-width:44%;aspect-ratio:2/3;padding:0'; c.innerHTML = `<img class="pic" style="object-fit:contain" src="${T.src(k, 'body_dance')}" alt="">`; c.classList.add('wobble'); row.appendChild(c); }
    b.appendChild(row);
    T.body(n, 'hello'); await say(n === 1 ? 't1_tanz' : 't3_tanz');
    T.dance(n, true);
    const mus = A.music(sec), has2 = k => !!T.img[`${k}_body_dance2`];
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
    P.item({block: 'dance', id: 'tanz', kind: 'dance', result: 'done'});
  };

  /* ========== СЛУШАЕМ (Mira) — ответ нажатием: правильность видна честно ========== */
  const ANIMALS = {kuh: 't2_muh', katze: 't2_miau', hund: 't2_wau', schaf: 't2_maeh', frosch: 't2_quak'};
  X.ANIMALS = ANIMALS;
  const row = (b, items, top) => { const r = SA.el('div', 'cards'); if (top) r.style.top = top; b.appendChild(r); return items.map(html => { const c = SA.el('div', 'card pop', html); r.appendChild(c); return c; }); };
  /* общая обработка ответа: верно — звёздочка и дальше; неверно — мягко, повторить загадку; 3 попытки */
  async function answer(cards, right, opts, rec){
    let attempts = 0, firstOk = null;
    while (attempts < 3){
      attempts++;
      const i = await X.waitTap(cards, {...opts, prompts: attempts === 1 ? opts.prompts : [null, ...opts.prompts.slice(1)], right});
      if (i < 0) break;
      if (i === right){ if (firstOk === null) firstOk = attempts === 1; cards[i].classList.add('ok'); A.sfx.ding(); await X.praise(2, SA.$('#board')); break; }
      firstOk = false; cards[i].classList.add('no'); A.sfx.soft(); setTimeout(() => cards[i].classList.remove('no'), 500);
      if (attempts === 1) { T.body(2, 'support'); await say('t2_nochmal'); }
      T.body(2, 'listen');
    }
    if (firstOk === null){ cards[right].classList.add('glow'); await X.support(2); }
    P.item(Object.assign({kind: 'tap', result: firstOk ? 'ok' : firstOk === false ? 'retry' : 'none', attempts}, rec));
    return firstOk;
  }
  /* знакомство с животными (учим слова — незнание слова не ошибка) — один раз за упражнение */
  X.animalsIntro = async () => {
    if (!X.once('tiere_intro')) return;
    const b = board(), r = SA.el('div', 'cards'); b.appendChild(r);
    for (const a of Object.keys(ANIMALS)){ const c = SA.el('div', 'card pop', SA.pic(a)); c.style.cssText = 'width:18%;max-width:18%'; r.appendChild(c); T.body(2, 'point'); c.classList.add('glow'); await say('t2_' + a); c.classList.remove('glow'); }
  };
  /* Wer macht das? — найти картинку по звуку. Проще 2, обычно 3, сложнее 4 картинки */
  X.whoRound = async (o = {}) => {
    const k = o.level > 0 ? 4 : o.level < 0 ? 2 : 3;
    const set = SA.shuffle(Object.keys(ANIMALS)).slice(0, k), target = SA.pick(set);
    const b = board(), cards = row(b, set.map(a => SA.pic(a)));
    X.help(2, ['t2_wer']);
    T.body(2, 'listen');
    const first = X.once('wer');
    await answer(cards, set.indexOf(target), {cue: () => say(ANIMALS[target]), prompts: [first ? 't2_wer' : null, 't2_wer2', 't2_ru_wer']}, {block: 'listen', id: 'wer:' + target});
  };
  /* Gleich oder anders? — различение (звуки животных, потом слоги) */
  async function sameIntro(kind){
    if (!X.once('gleich')) return;
    const b = board(), [g, a] = row(b, [SA.pic('gleich'), SA.pic('anders')]);
    T.body(2, 'point'); await say(kind === 'silben' ? 't2_gleich_silben' : 't2_gleich_intro');
    g.classList.add('glow'); await say('t2_gleich_zeig'); g.classList.remove('glow');
    a.classList.add('glow'); await say('t2_anders_zeig'); a.classList.remove('glow');
  }
  X.sameRound = async (s1, s2, kind) => {
    await sameIntro(kind);
    const same = s1 === s2, b = board();
    const bub = SA.el('div', 'dots', '<i></i><i></i>'); bub.style.top = '8%'; bub.querySelectorAll('i').forEach(i => { i.style.width = i.style.height = '28px'; }); b.appendChild(bub);
    const cards = row(b, [SA.pic('gleich'), SA.pic('anders')], '22%');
    const pair = async () => { const d = bub.children; d[0].classList.add('on'); await say(s1); await sleep(300); d[1].classList.add('on'); await say(s2); d[0].classList.remove('on'); d[1].classList.remove('on'); };
    X.help(2, [kind === 'silben' ? 't2_gleich_silben' : 't2_gleich_intro']);
    T.body(2, 'listen');
    await answer(cards, same ? 0 : 1, {cue: pair, prompts: [null, 't2_gleich2', 't2_ru_gleich']}, {block: 'listen', id: `gleich:${s1.replace('t2_', '')}-${s2.replace('t2_', '')}`});
  };
  /* Klatsch! — слоги по одному; на целевой звук нажать на ладошку. Цель: выделить звук из потока */
  X.klatsch = async (target, stream) => {
    const b = board(), [hand] = row(b, [SA.pic('hand')]); hand.style.cssText = 'width:34%;max-width:34%';
    const intro = target === 'sch' ? 't2_klatsch_sch' : 't2_klatsch_m', ru = target === 'sch' ? 't2_ru_klatsch_sch' : 't2_ru_klatsch_m';
    X.help(2, [intro]);
    T.body(2, 'point');
    if (X.once('klatsch_' + target)) await say(intro);
    T.body(2, 'listen');
    let hits = 0, misses = 0, extra = 0, armed = false, tappedNow = false;
    const onTap = e => { e.preventDefault(); hand.classList.remove('pop'); void hand.offsetWidth; hand.classList.add('pop'); A.sfx.tone(300, 200, 90, 'triangle', .25); if (armed){ tappedNow = true; } else extra++; };
    hand.addEventListener('pointerdown', onTap);
    try {
      for (const s of stream){
        const isT = s.startsWith(`t2_s_${target}`);
        tappedNow = false; armed = isT;
        await say(s);
        if (SA.AUTO && isT) tappedNow = true;
        const t0 = SA.now(); while (SA.now() - t0 < 1300 && !tappedNow) await sleep(50);
        armed = false;
        if (isT){ if (tappedNow){ hits++; SA.starEl(b); } else { misses++; hand.classList.add('glow'); await sleep(500); hand.classList.remove('glow'); } }
        await sleep(250);
        if (misses === 2 && hits === 0){ misses++; await say(ru); }
      }
    } finally { hand.removeEventListener('pointerdown', onTap); }
    P.item({block: 'listen', id: 'klatsch:' + target, kind: 'tap', result: hits && !misses ? 'ok' : hits ? 'retry' : 'none', hits, misses, extra});
    if (hits) await X.praise(2, null, true); else await X.support(2);
  };
  /* Silben klatschen — постучать по барабану на каждый слог (Ba-na-ne = 3) */
  X.trommel = async (word, n) => {
    const b = board(), w = X.bigCard(b, SA.pic(word));
    w.parentElement.style.cssText += ';right:45%';
    const drum = SA.el('div', 'card pop', SA.pic('trommel')); drum.style.cssText = 'position:absolute;right:6%;top:30%;width:36%;max-width:36%'; b.appendChild(drum);
    const dots = SA.el('div', 'dots', '<i></i>'.repeat(n)); dots.style.top = '8%'; b.appendChild(dots);
    X.help(2, ['t2_trommel_intro']);
    if (X.once('trommel')){ T.body(2, 'point'); await say('t2_trommel_intro'); }
    let taps = 0, attempts = 0, ok = false;
    const onTap = e => { e.preventDefault(); taps++; drum.classList.remove('pop'); void drum.offsetWidth; drum.classList.add('pop'); A.sfx.tone(160, 90, 160, 'triangle', .35); const d = dots.children[taps - 1]; if (d) d.classList.add('on'); };
    drum.addEventListener('pointerdown', onTap);
    try {
      for (let a = 0; a < 3 && !ok; a++){
        attempts++; taps = 0; [...dots.children].forEach(d => d.classList.remove('on'));
        T.body(2, 'listen'); await say('t2_sil_' + word);
        if (SA.AUTO){ for (let i = 0; i < n; i++) onTap({preventDefault(){}}); }
        let last = SA.now(), t0 = SA.now(), prev = 0;
        while (SA.now() - t0 < 9000){ await sleep(60); if (taps !== prev){ prev = taps; last = SA.now(); } if (taps && SA.now() - last > 1300) break; if (taps >= n + 2) break; }
        if (taps === n) ok = true;
        else if (!taps) await say(a === 0 ? 't2_trommel2' : 't2_ru_trommel');
        else { A.sfx.soft(); await sleep(300); }
      }
    } finally { drum.removeEventListener('pointerdown', onTap); }
    P.item({block: 'listen', id: 'trommel:' + word, kind: 'tap', result: ok ? (attempts === 1 ? 'ok' : 'retry') : 'none', attempts});
    await (ok ? X.praise(2, b) : X.support(2));
  };
  /* Zeig mir! — две похожие картинки (Kopf/Topf), назвать одну — нажать. Сначала учительница называет обе */
  X.zeig = async (pair, o = {}) => {
    const b = board(), cards = row(b, pair.map(w => SA.pic(w)));
    X.help(2, ['t2_zeig_intro']);
    if (X.once('zeig_' + pair.join())){
      if (X.once('zeig')){ T.body(2, 'point'); await say('t2_zeig_intro'); }
      for (let i = 0; i < 2; i++){ cards[i].classList.add('glow'); await say('t2_n_' + pair[i]); cards[i].classList.remove('glow'); }
    }
    const t = SA.pick([0, 1]);
    T.body(2, 'listen');
    await answer(cards, t, {cue: () => say('t2_w_' + pair[t]), prompts: [null, 't2_zeig2', 't2_ru_zeig']}, {block: 'listen', id: 'zeig:' + pair[t]});
  };
  /* Schlange oder Zug? — «ссс» или «шшш» */
  X.schlangeZug = async () => {
    const b = board(), cards = row(b, [SA.pic('schlange'), SA.pic('zug')]);
    X.help(2, ['t2_schlange_zug']);
    if (X.once('schlangezug')){ for (const [i, k] of [[0, 't2_n_schlange'], [1, 't2_n_zug']]){ cards[i].classList.add('glow'); await say(k); cards[i].classList.remove('glow'); } }
    const t = SA.pick([0, 1]);
    T.body(2, 'listen');
    await answer(cards, t, {cue: () => say(t ? 't2_schsch' : 't2_sss'), prompts: [X.once('sz_q') ? 't2_schlange_zug' : null, 't2_schlange_zug2', 't2_ru_schlange_zug']}, {block: 'listen', id: 'schlangezug:' + (t ? 'sch' : 's')});
  };
  X.listenBye = async () => { T.body(2, 'praise'); await say('t2_ende'); };

  /* ========== ГОВОРИМ (Zoey) — микрофон = попытка; правильность отмечает родитель ========== */
  const ear = () => SA.$('#ear');
  let earPair = null;
  async function playPair(){
    if (!earPair) return;
    const {model, vis, url} = earPair;
    T.face(3); await say(model, {vis});
    await sleep(200);
    await SA.guard(new Promise(res => { const au = new Audio(url); au.onended = res; au.onerror = res; au.play().catch(res); setTimeout(res, 8000); }));
  }
  document.addEventListener('DOMContentLoaded', () => ear().addEventListener('pointerdown', e => { e.preventDefault(); A.cut(); ear().hidden = true; playPair().catch(() => {}).finally(() => { if (earPair) ear().hidden = false; }); }));
  X.earOff = () => { earPair = null; ear().hidden = true; };

  /* повтор за учительницей. Первые два раза в упражнении: образец → «Jetzt du!»; дальше — образец и сразу микрофон.
     Молчит: «Sag es mit mir!» + образец, потом русская подсказка + образец. Говорит — сразу дальше. */
  X.repeatItem = async ({id, model, vis, words = 1, block = 'speak', showPic, hear, prompts = ['t3_jetzt_du', 't3_jetzt_du2', 't3_ru_jetzt_du']}) => {
    X.earOff();
    const rec = P.item({block, id, kind: 'speak', result: null, attempts: 0, mark: null});
    X.marks(rec);
    const E = SA.E; if (E) E.repeats = (E.repeats || 0) + 1;
    const tell = !E || E.repeats <= 2;
    let ok = false, url = null;
    for (let a = 0; a < 3 && !ok; a++){
      rec.attempts = a + 1;
      T.face(3);
      if (a > 0) await say(prompts[a]);
      await say(model, {vis});
      if (a === 0 && tell) await say(prompts[0]);
      T.body(3, 'listen');
      const r = await M.listen({words, record: true, noVoiceMs: 6000});
      if (r.ok){ ok = true; url = r.url; }
      else if (r.nomic){ ok = true; rec.result = 'nomic'; }
    }
    rec.result = rec.result || (ok ? 'heard' : 'none'); P._flush();
    if (ok) await X.praise(3, showPic); else { T.body(3, 'support'); await say('t3_spaeter'); }
    if (url){ earPair = {model, vis, url}; ear().hidden = false;
      if (hear){ T.face(3); await say('t3_hoer_dich'); ear().hidden = true; await playPair(); ear().hidden = false; } }
    return {ok, rec};
  };
  const VOW = {a: 'talk_open', o: 'talk_o', i: 'talk_i', u: 'talk_u'};
  const faceCard = (b, f) => X.bigCard(b, `<img class="pic" style="object-fit:contain" src="${T.src(3, 'face_' + f)}" alt="">`);
  /* гласные: поза рта видна на картинке рта учительницы */
  X.vowel = async v => {
    const b = board(); faceCard(b, VOW[v]);
    X.help(3, ['t3_' + v]);
    T.face(3); await say('t3_' + v, {vis: VOW[v]});
    await X.repeatItem({id: 'vokal:' + v, model: `t3_${v}_kurz`, vis: VOW[v], showPic: b});
  };
  const TIERE = {muh: ['kuh', 'talk_u'], maeh: ['schaf', 'talk_open'], wau: ['hund', 'talk_o'], miau: ['katze', 'talk_i']};
  X.tier = async (k, hear) => {
    const [pic, vis] = TIERE[k], b = board(); X.bigCard(b, SA.pic(pic));
    if (X.once('tiere_sprechen')){ T.face(3); await say('t3_tiere_intro'); }
    await X.repeatItem({id: 'tier:' + k, model: 't3_' + k, vis, showPic: b, hear});
  };
  /* слоговые ряды (ma-mo-mu-mi), звуки (mmm, sss, schsch) — с картинкой-подсказкой */
  X.syll = async (key, {pic, face, intro, hear} = {}) => {
    const b = board(); if (face) faceCard(b, face); else X.bigCard(b, SA.pic(pic || 'mund'));
    if (intro && X.once(intro)){ T.face(3); await say(intro); }
    X.help(3, intro ? [intro] : null);
    await X.repeatItem({id: 'silbe:' + key.replace('t3_', ''), model: key, vis: face || 'talk_open', words: 3, showPic: b, hear});
  };
  const WVIS = {auto: 'talk_open', ei: 'talk_open', ball: 'talk_open', baum: 'talk_open', oma: 'talk_o', puppe: 'talk_u', mama: 'talk_open', papa: 'talk_open', maus: 'talk_open', mond: 'talk_o',
    banane: 'talk_open', tuer: 'talk_u', teddy: 'talk_half', nase: 'talk_open', nudel: 'talk_u', loeffel: 'talk_half', lampe: 'talk_open', kuh: 'talk_u', katze: 'talk_open',
    keks: 'talk_i', kuchen: 'talk_u', gabel: 'talk_open', gurke: 'talk_u', kopf: 'talk_o', topf: 'talk_o', kanne: 'talk_open', tanne: 'talk_open', tasche: 'talk_open', tasse: 'talk_open', schlange: 'talk_open', zug: 'talk_u'};
  /* слово: учительница называет картинку (учим слово, раз за упражнение), потом образец и повтор */
  X.word = async (w, hear) => {
    const b = board(); X.bigCard(b, SA.pic(w));
    if (X.once('woerter')){ T.face(3); await say('t3_woerter_intro'); }
    X.help(3, ['t3_s_' + w]);
    if (X.once('wort_' + w)){ T.body(3, 'point'); await say('t3_s_' + w); }
    await X.repeatItem({id: 'wort:' + w, model: 't3_w_' + w, vis: WVIS[w], showPic: b, hear});
  };

  /* ========== ИГРЫ-ЗАКРЕПЛЕНИЕ (Zoey): те же слова, каждое сказанное — шаг в игре; игра не наказывает ========== */
  X.game = async (kind, words) => {
    X.earOff();
    const b = board();
    const shelf = SA.el('div', 'shelf'); b.appendChild(shelf);
    let stage = null, rocket = null, fuel = 0;
    const intro = {kiste: 't3_spiel_intro', rakete: 't3_rakete_intro', fuettern: 't3_fuettern_intro'}[kind];
    const ru = {kiste: 't3_ru_spiel', rakete: 't3_ru_rakete', fuettern: 't3_ru_fuettern'}[kind];
    if (kind === 'kiste'){ stage = SA.el('div', ''); stage.style.cssText = 'position:absolute;left:30%;width:40%;top:22%;aspect-ratio:1'; stage.innerHTML = SA.pic('kiste', false); b.appendChild(stage); }
    if (kind === 'rakete'){ rocket = SA.el('div', ''); rocket.style.cssText = 'position:absolute;left:36%;width:28%;top:6%;aspect-ratio:1;transition:transform 1.2s cubic-bezier(.5,0,.8,.3)'; rocket.innerHTML = SA.pic('rakete', 0); b.appendChild(rocket); }
    let pet = null;
    if (kind === 'fuettern'){ pet = SA.el('div', ''); pet.style.cssText = 'position:absolute;left:34%;width:32%;top:10%;aspect-ratio:1'; pet.innerHTML = SA.pic(SA.pick(['hund', 'katze', 'baer'])); b.appendChild(pet); }
    const peek = SA.el('div', ''); peek.style.cssText = 'position:absolute;left:38%;width:24%;top:14%;aspect-ratio:1;opacity:0;transition:transform .35s,opacity .25s'; b.appendChild(peek);
    if (kind !== 'kiste') peek.style.cssText = 'position:absolute;left:4%;width:24%;top:22%;aspect-ratio:1;opacity:0;transition:transform .35s,opacity .25s';
    X.help(3, [intro]);
    T.body(3, 'explain'); if (X.once('game_' + kind)) await say(intro);
    let k = 0;
    for (const w of words){
      if (left() < 6 && k > 2) break;
      peek.innerHTML = SA.pic(w); peek.style.opacity = '1'; peek.style.transform = kind === 'kiste' ? 'translateY(30%) scale(.8)' : 'scale(1)';
      if (stage){ stage.innerHTML = SA.pic('kiste', false); stage.classList.add('wobble'); await sleep(250); stage.classList.remove('wobble'); }
      T.body(3, 'point');
      await X.repeatItem({id: `spiel:${w}`, model: 't3_w_' + w, vis: WVIS[w], block: 'game', prompts: [k === 0 ? 't3_spiel_sag' : 't3_spiel_sag2', 't3_jetzt_du2', ru]});
      A.sfx.pop();
      if (kind === 'kiste'){ stage.innerHTML = SA.pic('kiste', true); peek.style.transform = 'translateY(-40%) scale(1.1)'; await sleep(300); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); }
      if (kind === 'rakete'){ fuel = Math.min(1, fuel + 1/words.length); rocket.innerHTML = SA.pic('rakete', fuel); peek.style.transform = 'translate(150%,-40%) scale(.3)'; await sleep(300); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); }
      if (kind === 'fuettern'){ peek.style.transform = 'translate(140%,-10%) scale(.35)'; await sleep(350); pet.classList.remove('pop'); void pet.offsetWidth; pet.classList.add('pop'); A.sfx.tone(500, 300, 180, 'triangle', .2); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); }
      peek.style.opacity = '0'; k++;
    }
    X.earOff(); X.marks(null);
    if (kind === 'rakete'){ rocket.innerHTML = SA.pic('rakete', 1); await say('t3_rakete_start'); A.sfx.whoosh(); rocket.style.transform = 'translateY(-160%)'; await sleep(1200); }
    T.body(3, 'praise'); A.sfx.fanfare(); await say(kind === 'fuettern' ? 't3_fuettern_ende' : 't3_spiel_ende');
  };

  /* ========== ИТОГ УРОКА: яйцо и прощание ========== */
  X.finale = async (res) => {
    X.earOff(); X.marks(null); X.help(0, null);
    const b = board(), st = SA.P.settings(), img = st.rewardImg;
    const eggBox = SA.el('div', ''); eggBox.style.cssText = 'position:absolute;left:50%;top:50%;width:min(46%,60vh);aspect-ratio:1;transform:translate(-50%,-50%)'; b.appendChild(eggBox);
    const before = Math.max(0, res.filled - 1)/res.target;
    eggBox.innerHTML = SA.eggSVG(Math.min(1, before), res.target, img);
    T.body(3, 'praise'); await say('t3_lektion_fertig');
    const to = Math.min(1, res.filled/res.target), t0 = SA.now();
    A.sfx.sparkle();
    while (SA.now() - t0 < 1200){ const k = (SA.now() - t0)/1200; eggBox.innerHTML = SA.eggSVG(before + (to - before)*k, res.target, img); await new Promise(r => requestAnimationFrame(r)); }
    eggBox.innerHTML = SA.eggSVG(to, res.target, img);
    T.body(3, 'point');
    if (res.full){ A.sfx.fanfare(); eggBox.classList.add('wobble'); SA.starEl(b); await say('t3_ei_voll'); SA.P.emptyEgg(); }
    else if (res.target - res.filled === 1) await say('t3_ei_bald');
    else await say('t3_ei');
    for (const n of [1, 2, 3]){ T.body(n, 'bye'); await say(`t${n}_tschuess`); }
  };
})();
