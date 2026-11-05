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

  /* ========== ДЫХАНИЕ (Rumi): 10 разных игр на один «движок» ==========
     Засчитывается выдох (js/breath.js: шум без тона). Подстраховка — камера: если она видит «губы трубочкой» (поза выдоха),
     игра тоже идёт (медленнее), даже когда микрофон выдох не поймал (iPhone может «съедать» шум выдоха).
     Игра никогда не проигрывается: после 3 попыток всё равно доходит до конца (похвала за старание). */
  /* камера для дыхания и зеркала — одна на всю разминку; видео переносится в нужное окошко */
  X.camInto = async host => {
    if (SA.AUTO) return false;
    if (SA.C.on && SA.C.video){ host.appendChild(SA.C.video); SA.C.video.play().catch(() => {}); return true; }
    return await SA.C.start(host);
  };
  const W = () => SA.$('#board').clientWidth, H = () => SA.$('#board').clientHeight;
  async function breathGame({id, intro, again, ru, scene, demo}){
    const b = board();
    const g = scene(b);                       /* {tick(ms, air), done(), puff?(), end?()} */
    const cam = SA.el('div', 'blowcam'); b.appendChild(cam);
    const camOk = await X.camInto(cam);
    if (!camOk) cam.remove();
    const wind = SA.el('div', 'wind', '<i></i><i></i><i></i>'); b.appendChild(wind);
    X.help(1, [intro]);
    if (X.once('b_' + id)){ T.body(1, 'explain'); await say(intro); if (demo !== false){ T.face(1, 'blow'); A.sfx.whoosh(); await sleep(500); } }
    T.face(1);
    let attempts = 0, saidPsst = false, prevBlow = 0, camWas = false, camOff = SA.now();
    for (let a = 0; a < 3 && !g.done(); a++){
      attempts++;
      T.face(1, 'blow');
      let last = SA.now(), moved = 0;
      const st = await M.blow({ms: 6500, onTick(air, s){
        const now = SA.now(), dt = Math.min(100, now - last); last = now;
        const pose = camOk && SA.C.sees('blow');
        if (pose && !camWas && now - camOff > 250 && g.puff && !air) g.puff();      /* «пф» губами — тоже свечка */
        if (!pose && camWas) camOff = now; camWas = pose;
        const ms = air ? dt : pose ? dt*0.6 : 0;
        wind.classList.toggle('on', ms > 0);
        if (ms > 0){ moved += ms; g.tick(ms, air); }
        while (g.puff && s.puffs > prevBlow){ prevBlow++; g.puff(); }
      }, until: () => g.done()});
      prevBlow = 0;
      wind.classList.remove('on'); T.face(1);
      if (g.done()) break;
      if (!moved && st.voiceMs > 700 && !saidPsst){ saidPsst = true; await say('t1_nur_pusten'); a--; continue; }
      if (a < 2) await say(moved ? again : (a === 0 ? again : ru));
    }
    const ok = g.done();
    if (g.finish) await g.finish(ok);
    P.item({block: 'breath', id, kind: 'blow', result: ok ? 'done' : 'tried', attempts});
    await (ok ? X.praise(1, b, true) : X.support(1));
  }
  const svgEl = html => { const d = SA.el('div', ''); d.innerHTML = html; return d; };
  const place = (el, css) => { el.style.cssText = 'position:absolute;' + css; return el; };

  /* 1. Pusteblume — длинный плавный выдох: пушинки улетают */
  X.dandelion = (o = {}) => { const per = o.level > 0 ? 200 : 130; return breathGame({id: 'pusteblume', intro: 't1_puste_intro', again: 't1_puste2', ru: 't1_ru_puste', scene(b){
    const w = place(svgEl(SA.dandelionSVG(14)), 'inset:4% 20% 4% 20%'); b.appendChild(w); w.firstChild.style.cssText = 'width:100%;height:100%';
    const seeds = [...w.querySelectorAll('.seed')]; let gone = 0, acc = 0;
    const fly = () => { const s = seeds[gone++]; if (!s) return; s.animate([{transform: 'none', opacity: 1}, {transform: `translate(${120 + Math.random()*160}px,${-80 - Math.random()*140}px) rotate(${Math.random()*60 - 30}deg)`, opacity: 0}], {duration: 1600, easing: 'ease-out', fill: 'forwards'}); };
    return {tick(ms){ acc += ms; while (acc >= per){ acc -= per; fly(); } }, done: () => gone >= seeds.length, async finish(){ while (gone < seeds.length){ fly(); await sleep(40); } }};
  }}); };
  /* 2. Kerzen — короткие сильные «пф»: каждое гасит свечку (или 0,4 с непрерывного выдоха) */
  X.candles = (o = {}) => { const n = o.level > 0 ? 5 : 3; return breathGame({id: 'kerzen', intro: 't1_kerzen_intro', again: 't1_kerzen2', ru: 't1_ru_kerzen', scene(b){
    const w = place(svgEl(SA.cakeSVG(n)), 'inset:6% 18%'); b.appendChild(w); w.firstChild.style.cssText = 'width:100%;height:100%';
    const fl = [...w.querySelectorAll('.flame')]; let out = 0, acc = 0;
    fl.forEach(f => f.animate([{transform: 'scaleY(1)'}, {transform: 'scaleY(1.15)'}], {duration: 300, iterations: Infinity, direction: 'alternate'}));
    const blowOut = () => { const f = fl[out++]; if (!f) return; A.sfx.puff(); f.animate([{opacity: 1}, {opacity: 0, transform: 'scale(.3) translateY(-20px)'}], {duration: 300, fill: 'forwards'}); };
    return {tick(ms){ acc += ms; if (acc >= 400){ acc = 0; blowOut(); } }, puff(){ acc = 0; blowOut(); }, done: () => out >= n, async finish(){ while (out < n){ blowOut(); await sleep(150); } }};
  }}); };
  /* 3. Ballon — надуть шарик; полный — улетает с конфетти */
  X.balloon = () => breathGame({id: 'ballon', intro: 't1_ballon_intro', again: 't1_ballon2', ru: 't1_ru_ballon', scene(b){
    const col = SA.pick(['#ff5a5a', '#5aa9ff', '#ffb020', '#7bd36a', '#b06cff']);
    const w = place(svgEl(`<svg viewBox="0 0 200 260"><path d="M100 196 q-6 30 10 60" fill="none" stroke="#4a3550" stroke-width="3"/><g class="bl" style="transform-origin:100px 196px"><ellipse cx="100" cy="110" rx="70" ry="86" fill="${col}" stroke="#4a3550" stroke-width="5"/><ellipse cx="74" cy="76" rx="12" ry="22" fill="#fff" opacity=".5"/><path d="M92 194 h16 l-8 10 z" fill="${col}" stroke="#4a3550" stroke-width="4"/></g></svg>`), 'inset:4% 25% 2% 25%'); b.appendChild(w);
    const bl = w.querySelector('.bl'); let f = 0; const need = 3000;
    const draw = () => { bl.style.transform = `scale(${0.25 + 0.75*f/need})`; }; draw();
    return {tick(ms){ f = Math.min(need, f + ms); draw(); }, done: () => f >= need, async finish(){ f = need; draw(); A.sfx.pop(); A.sfx.sparkle(); w.animate([{transform: 'none'}, {transform: 'translateY(-130%) rotate(8deg)'}], {duration: 1400, easing: 'ease-in', fill: 'forwards'}); await say('t1_ballon_ende'); }};
  }});
  /* 4. Zauberflöte — дудочка играет мелодию, пока Эмили дует (каждые 0,28 с выдоха — следующая нота) */
  const MEL = [60, 62, 64, 65, 67, 67, 69, 69, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60];      /* «Alle meine Entchen» — народная песенка */
  X.flute = () => breathGame({id: 'floete', intro: 't1_floete_intro', again: 't1_floete2', ru: 't1_ru_floete', scene(b){
    const w = place(svgEl(`<svg viewBox="0 0 260 120"><rect x="10" y="44" width="240" height="30" rx="15" fill="#e8b02e" stroke="#4a3550" stroke-width="5"/>${[60, 95, 130, 165, 200].map(x => `<circle cx="${x}" cy="59" r="7" fill="#4a3550"/>`).join('')}<rect x="10" y="44" width="34" height="30" rx="12" fill="#c98a1e" stroke="#4a3550" stroke-width="5"/></svg>`), 'left:8%;right:8%;top:46%;'); b.appendChild(w);
    const notes = SA.el('div', 'notes'); b.appendChild(notes);
    let k = 0, acc = 0;
    const note = () => { const m = MEL[k++]; const hz = 440*Math.pow(2, (m - 69)/12); A.sfx.tone(hz, hz, 300, 'sine', .22); A.sfx.tone(hz*2, hz*2, 260, 'triangle', .05);
      const n = SA.el('b', '', '♪'); n.style.left = (10 + Math.random()*75) + '%'; notes.appendChild(n); setTimeout(() => n.remove(), 1500); };
    return {tick(ms){ acc += ms; while (acc >= 280 && k < MEL.length){ acc -= 280; note(); } }, done: () => k >= MEL.length, async finish(){ while (k < MEL.length){ note(); await sleep(220); } }};
  }});
  /* 5. Suppe — остудить горячий суп: пар уходит, потом мишка ест */
  X.soup = () => breathGame({id: 'suppe', intro: 't1_suppe_intro', again: 't1_suppe2', ru: 't1_ru_suppe', scene(b){
    const w = place(svgEl(`<svg viewBox="0 0 200 200"><g class="steam"><path d="M70 80 q-12 -20 0 -40 q12 -20 0 -40" /><path d="M100 80 q-12 -20 0 -40 q12 -20 0 -40"/><path d="M130 80 q-12 -20 0 -40 q12 -20 0 -40"/></g><ellipse cx="100" cy="100" rx="80" ry="18" fill="#ff9a4d" stroke="#4a3550" stroke-width="5"/><path d="M20 100 q0 80 80 80 q80 0 80 -80" fill="#5aa9ff" stroke="#4a3550" stroke-width="5"/><circle cx="76" cy="98" r="6" fill="#ffd84d"/><circle cx="120" cy="96" r="5" fill="#7bd36a"/></svg>`), 'left:34%;width:34%;top:20%;aspect-ratio:1'); b.appendChild(w);
    const bear = place(svgEl(SA.pic('baer')), 'left:4%;width:26%;top:30%;aspect-ratio:1'); b.appendChild(bear);
    const steam = w.querySelector('.steam'); steam.setAttribute('fill', 'none'); steam.setAttribute('stroke', '#c9c3cf'); steam.setAttribute('stroke-width', '8'); steam.setAttribute('stroke-linecap', 'round');
    steam.animate([{transform: 'translateY(0)'}, {transform: 'translateY(-8px)'}], {duration: 700, iterations: Infinity, direction: 'alternate'});
    let f = 0; const need = 3000;
    return {tick(ms){ f = Math.min(need, f + ms); steam.style.opacity = 1 - f/need; }, done: () => f >= need, async finish(){ steam.style.opacity = 0; bear.animate([{transform: 'none'}, {transform: 'translateX(40%) rotate(-6deg)'}, {transform: 'none'}], {duration: 900}); A.sfx.tone(500, 300, 200, 'triangle', .2); await say('t1_suppe_ende'); }};
  }});
  /* 6. Seifenblasen — мягкий выдох: из колечка летят пузыри */
  X.bubbles = () => breathGame({id: 'seifenblasen', intro: 't1_blasen_intro', again: 't1_blasen2', ru: 't1_ru_blasen', scene(b){
    const ring = place(svgEl(`<svg viewBox="0 0 120 200"><circle cx="60" cy="50" r="36" fill="none" stroke="#b06cff" stroke-width="10"/><rect x="54" y="86" width="12" height="100" rx="6" fill="#b06cff" stroke="#4a3550" stroke-width="3"/></svg>`), 'left:10%;width:18%;top:30%;aspect-ratio:120/200'); b.appendChild(ring);
    let n = 0, acc = 0; const need = 14;
    const bubble = () => { n++; const r = 30 + Math.random()*50, x = 20 + Math.random()*60; const e = place(SA.el('i', 'bubble'), `left:${x}%;bottom:30%;width:${r}px;height:${r}px`); b.appendChild(e);
      e.animate([{transform: 'translate(0,0) scale(.3)', opacity: 1}, {transform: `translate(${Math.random()*80 - 40}px,${-H()*0.7}px) scale(1)`, opacity: .9}], {duration: 2600 + Math.random()*900, easing: 'ease-out', fill: 'forwards'}).finished.then(() => { A.sfx.tone(1600, 2200, 60, 'sine', .05); e.remove(); }).catch(() => {}); };
    return {tick(ms){ acc += ms; while (acc >= 200){ acc -= 200; bubble(); } }, done: () => n >= need, async finish(){ while (n < need){ bubble(); await sleep(80); } await sleep(600); }};
  }});
  /* 7. Windrad — вертушка крутится, пока дуешь */
  X.pinwheel = () => breathGame({id: 'windrad', intro: 't1_windrad_intro', again: 't1_windrad2', ru: 't1_ru_windrad', scene(b){
    const cols = ['#ff5a5a', '#ffd84d', '#5aa9ff', '#7bd36a'];
    const w = place(svgEl(`<svg viewBox="0 0 200 260"><rect x="94" y="100" width="12" height="150" rx="6" fill="#a8774b" stroke="#4a3550" stroke-width="3"/><g class="pw" style="transform-origin:100px 100px">${cols.map((c, i) => `<path d="M100 100 L100 20 Q150 30 100 100" fill="${c}" stroke="#4a3550" stroke-width="4" transform="rotate(${i*90} 100 100)"/>`).join('')}<circle cx="100" cy="100" r="9" fill="#fff" stroke="#4a3550" stroke-width="4"/></g></svg>`), 'left:30%;width:40%;top:4%;bottom:4%'); b.appendChild(w);
    const pw = w.querySelector('.pw'); let f = 0, ang = 0; const need = 3500;
    return {tick(ms){ f = Math.min(need, f + ms); ang += ms*0.9; pw.style.transform = `rotate(${ang}deg)`; if (Math.random() < 0.05) A.sfx.noise(80, 2000, .05); }, done: () => f >= need,
      async finish(){ for (let i = 0; i < 20; i++){ ang += 30 - i; pw.style.transform = `rotate(${ang}deg)`; await sleep(40); } }};
  }});
  /* 8. Blätter — сдуть листья, а под ними картинка-сюрприз */
  X.leaves = () => breathGame({id: 'blaetter', intro: 't1_blaetter_intro', again: 't1_blaetter2', ru: 't1_ru_blaetter', scene(b){
    const pic = place(svgEl(SA.pic(SA.pick(['teddy', 'ball', 'auto', 'puppe', 'maus', 'kuchen']))), 'left:30%;width:40%;top:12%;aspect-ratio:1'); b.appendChild(pic);
    const ls = []; for (let i = 0; i < 9; i++){ const c = SA.pick(['#e8752e', '#ffb020', '#c9462b', '#8a5a2b']); const l = place(svgEl(`<svg viewBox="0 0 100 100"><path d="M50 8 q40 30 0 84 q-40 -54 0 -84 z" fill="${c}" stroke="#4a3550" stroke-width="4"/><path d="M50 14 v76" stroke="#4a3550" stroke-width="3"/></svg>`), `left:${28 + (i % 3)*15}%;top:${10 + Math.floor(i/3)*24}%;width:20%;aspect-ratio:1;transform:rotate(${Math.random()*80 - 40}deg)`); b.appendChild(l); ls.push(l); }
    let k = 0, acc = 0;
    const off = () => { const l = ls[k++]; if (!l) return; l.animate([{}, {transform: `translate(${W()*0.6}px,${-H()*0.3 + Math.random()*H()*0.6}px) rotate(${400 + Math.random()*300}deg)`, opacity: 0}], {duration: 1300, easing: 'ease-in', fill: 'forwards'}); };
    return {tick(ms){ acc += ms; while (acc >= 300){ acc -= 300; off(); } }, done: () => k >= ls.length, async finish(){ while (k < ls.length){ off(); await sleep(60); } pic.classList.add('pop'); A.sfx.sparkle(); await sleep(500); }};
  }});
  /* 9. Wolke — сдуть тучку, выглядывает солнце */
  X.cloud = () => breathGame({id: 'wolke', intro: 't1_wolke_intro', again: 't1_wolke2', ru: 't1_ru_wolke', scene(b){
    const sun = place(svgEl(`<svg viewBox="0 0 200 200"><g stroke="#ffb020" stroke-width="10" stroke-linecap="round">${[...Array(8)].map((_, i) => `<path d="M100 20 v-16" transform="rotate(${i*45} 100 100)"/>`).join('')}</g><circle cx="100" cy="100" r="62" fill="#ffd84d" stroke="#4a3550" stroke-width="5"/><circle cx="80" cy="92" r="7" fill="#2a1f33"/><circle cx="120" cy="92" r="7" fill="#2a1f33"/><path d="M76 118 q24 22 48 0" fill="none" stroke="#4a3550" stroke-width="5" stroke-linecap="round"/></svg>`), 'left:36%;width:30%;top:12%;aspect-ratio:1'); b.appendChild(sun);
    const cl = place(svgEl(`<svg viewBox="0 0 240 150"><path d="M50 130 q-46 0 -40 -40 q6 -34 46 -30 q10 -44 60 -44 q52 0 62 46 q46 -6 52 34 q4 34 -40 34 z" fill="#c9cfe0" stroke="#4a3550" stroke-width="5"/></svg>`), 'left:22%;width:56%;top:10%'); b.appendChild(cl);
    let f = 0; const need = 3000;
    return {tick(ms){ f = Math.min(need, f + ms); cl.style.transform = `translateX(${f/need*W()*0.7}px)`; }, done: () => f >= need, async finish(){ cl.style.transform = `translateX(${W()}px)`; sun.classList.add('pop'); A.sfx.sparkle(); await sleep(400); }};
  }});
  /* 10. Bootrennen — гонка корабликов: кораблик Rumi плывёт сам, кораблик Эмили — от её выдоха. Эмили всегда успевает выиграть */
  X.boat = (o = {}) => breathGame({id: 'bootrennen', intro: 't1_rennen_intro', again: 't1_rennen2', ru: 't1_ru_rennen', scene(b){
    const sea = place(SA.el('div', ''), 'inset:0;background:linear-gradient(#0000 30%, #bfe6ff 30%)'); b.appendChild(sea);
    const flag = place(svgEl(`<svg viewBox="0 0 40 120"><rect x="6" y="6" width="5" height="110" fill="#4a3550"/><path d="M11 8 h24 v20 h-24 z" fill="#ff5a5a"/></svg>`), 'right:6%;top:24%;height:70%'); b.appendChild(flag);
    const mk = (top, col) => place(svgEl(SA.pic('schiff').replace('#ff7a59', col)), `left:2%;top:${top};width:20%;aspect-ratio:1;transition:transform .2s linear`);
    const mine = mk('58%', '#ff7a59'), hers = mk('26%', '#b06cff'); b.append(hers, mine);
    const need = o.level > 0 ? 4000 : 3000, track = () => W()*0.66;
    let me = 0, her = 0, t0 = SA.now();
    const draw = () => { mine.style.transform = `translateX(${me/need*track()}px)`; hers.style.transform = `translateX(${Math.min(her, 0.9)*track()}px)`; };
    const iv = setInterval(() => { her = Math.min(0.9, her + 0.004 + (me/need > her ? 0.003 : 0)); draw(); }, 100);      /* соперница чуть отстаёт, но не стоит на месте */
    return {tick(ms){ me = Math.min(need, me + ms); draw(); }, done: () => me >= need, async finish(ok){ clearInterval(iv); me = need; draw(); A.sfx.fanfare(); await sleep(300); await say(ok ? 't1_rennen_sieg' : 't1_rennen_ende'); }};
  }});

  /* набор дыхательных игр урока; на втором круге — случайные, но не те же, что в прошлом уроке */
  X.BREATH = {pusteblume: X.dandelion, kerzen: X.candles, ballon: X.balloon, floete: X.flute, suppe: X.soup, blasen: X.bubbles, windrad: X.pinwheel, blaetter: X.leaves, wolke: X.cloud, rennen: X.boat};
  X.pickBreath = (planned, level) => {
    if (!level) return planned;
    let last = []; try { last = JSON.parse(localStorage.getItem('sa-breath-last') || '[]'); } catch(e){}
    const pool = SA.shuffle(Object.keys(X.BREATH).filter(k => !last.includes(k)));
    const pick = pool.slice(0, planned.length);
    try { localStorage.setItem('sa-breath-last', JSON.stringify(pick)); } catch(e){}
    return pick;
  };

  X.hiss = async (kind) => {
    const b = board(), c = X.bigCard(b, SA.pic(kind === 'zug' ? 'zug' : 'schlange'));
    const k = kind === 'zug' ? 'zug' : 'schlange';
    X.help(1, [`t1_${k}`, kind === 'zug' ? 't1_schsch' : 't1_sss', 't1_mach_mit']);
    T.face(1, kind === 'zug' ? 'kiss' : 'smile'); await say(`t1_${k}`); await say(kind === 'zug' ? 't1_schsch' : 't1_sss'); await say('t1_mach_mit');
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
    const cam = await X.camInto(mirrorEl);
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
    const e = EX[id], reps = SA.quick() ? 1 : o.level > 0 ? 3 : o.level < 0 ? 1 : 2, holdMs = o.level > 0 ? 1500 : 900;
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
    if (SA.quick()) sec = 5;
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
    if (X.once('schlangezug')){ for (const [i, k, z] of [[0, 't2_n_schlange', 't2_sss'], [1, 't2_n_zug', 't2_schsch']]){ cards[i].classList.add('glow'); await say(k); await say(z); cards[i].classList.remove('glow'); } }
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
