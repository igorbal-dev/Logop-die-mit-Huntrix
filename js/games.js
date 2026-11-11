/* ИГРЫ-ЗАКРЕПЛЕНИЕ (Zoey, последняя станция урока): те же слова, что в «словах», каждое сказанное слово — шаг в игре.
   13 игр на одном движке (X.game). В каждом уроке две разные; на втором круге — случайные, не как в прошлом уроке (X.pickGames).
   Игра не проигрывается: если время кончилось раньше, finish() сам доводит картинку до конца. Логопедия как везде:
   образец → повтор (микрофон = попытка), правильность — ✓ / ~ родителя. */
(function(){
  const X = SA.X, A = SA.A, T = SA.T, P = SA.P;
  const say = (k, o) => A.say(k, o), sleep = SA.sleep;
  const WVIS = X.WVIS;
  const put = (host, css, html = '', cls = '') => { const d = SA.el('div', cls, html); d.style.cssText = 'position:absolute;' + css; host.appendChild(d); return d; };
  /* анимация с учётом ?speed= (проверка) и кнопки «закончить» */
  const anim = async (el, frames, ms, opt = {}) => { el.animate(frames, {duration: ms/SA.SPEED, fill: 'forwards', easing: 'ease-out', ...opt}); await sleep(ms); };
  const COLORS = ['#ff7a9a', '#5aa9ff', '#ffd84d', '#7bd36a', '#b06cff', '#ff9a4d', '#4dd0c8'];
  const S = 'stroke="#4a3550" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
  const svg = (body, vb = '0 0 200 200') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;overflow:visible">${body}</svg>`;
  const mini = (w, css) => `<div style="position:absolute;${css}">${SA.pic(w)}</div>`;
  const chime = (i = 0) => A.sfx.tone(523*Math.pow(2, (i % 7)*2/12), 523*Math.pow(2, (i % 7)*2/12)*1.01, 220, 'triangle', .16);

  const G = X.GAMES = {
    /* 1. Волшебный сундучок: предмет выглядывает, слово — выпрыгивает на полку */
    kiste: {name: 'Волшебный сундучок', intro: 't3_spiel_intro', sag: 't3_spiel_sag', ru: 't3_ru_spiel', ende: 't3_spiel_ende', setup(b){
      const shelf = put(b, '', '', 'shelf'); shelf.style.position = 'absolute';
      const box = put(b, 'left:30%;width:40%;top:22%;aspect-ratio:1', SA.pic('kiste', false));
      return {peek: 'left:38%;width:24%;top:14%', peekT: 'translateY(30%) scale(.8)',
        async show(){ box.innerHTML = SA.pic('kiste', false); box.classList.add('wobble'); await sleep(250); box.classList.remove('wobble'); },
        async step(w, k, peek){ box.innerHTML = SA.pic('kiste', true); peek.style.transform = 'translateY(-40%) scale(1.1)'; await sleep(300); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); }};
    }},
    /* 2. Ракета: каждое слово заправляет, в конце старт */
    rakete: {name: 'Ракета', intro: 't3_rakete_intro', ru: 't3_ru_rakete', ende: 't3_g_rakete_ende', setup(b, ws){
      const shelf = put(b, '', '', 'shelf'); shelf.style.position = 'absolute';
      const r = put(b, 'left:36%;width:28%;top:6%;aspect-ratio:1;transition:transform 1.2s cubic-bezier(.5,0,.8,.3)', SA.pic('rakete', 0)); let fuel = 0;
      return {async step(w, k, peek){ fuel = Math.min(1, fuel + 1/ws.length); r.innerHTML = SA.pic('rakete', fuel); peek.style.transform = 'translate(150%,-40%) scale(.3)'; await sleep(300); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); },
        async finish(){ r.innerHTML = SA.pic('rakete', 1); await say('t3_rakete_start'); A.sfx.whoosh(); r.style.transform = 'translateY(-160%)'; await sleep(1200); }};
    }},
    /* 3. Покорми зверька: каждое слово — угощение */
    fuettern: {name: 'Покорми зверька', intro: 't3_fuettern_intro', ru: 't3_ru_fuettern', ende: 't3_fuettern_ende', setup(b){
      const shelf = put(b, '', '', 'shelf'); shelf.style.position = 'absolute';
      const pet = put(b, 'left:34%;width:32%;top:10%;aspect-ratio:1', SA.pic(SA.pick(['hund', 'katze', 'baer'])));
      return {async step(w, k, peek){ peek.style.transform = 'translate(140%,-10%) scale(.35)'; await sleep(350); pet.classList.remove('pop'); void pet.offsetWidth; pet.classList.add('pop');
        A.sfx.tone(500, 300, 180, 'triangle', .2); shelf.appendChild(SA.el('div', 'pop', SA.pic(w))); }};
    }},
    /* 4. Паровозик: каждое слово — вагончик; в конце поезд уезжает */
    zug: {name: 'Паровозик', intro: 't3_g_zug_intro', ru: 't3_g_zug_ru', ende: 't3_g_zug_ende', setup(b){
      put(b, 'left:0;right:0;bottom:12%;height:3%;background:#a8774b;border-radius:4px');
      const train = put(b, 'left:2%;right:2%;bottom:14%;height:26%;display:flex;flex-direction:row-reverse;justify-content:flex-start;align-items:flex-end;gap:1%');
      const eng = SA.el('div', ''); eng.style.cssText = 'height:100%;aspect-ratio:1;flex:none'; eng.innerHTML = SA.pic('zug'); train.appendChild(eng);
      return {async step(w, k, peek){
        const wg = SA.el('div', 'pop'); wg.style.cssText = 'position:relative;height:62%;aspect-ratio:1;flex:none';
        wg.innerHTML = svg(`<rect x="10" y="30" width="180" height="130" rx="14" fill="${COLORS[k % 7]}" ${S}/><circle cx="50" cy="168" r="20" fill="#4a3550"/><circle cx="150" cy="168" r="20" fill="#4a3550"/><path d="M-10 120 h20" ${S}/>`) + mini(w, 'left:22%;top:18%;width:56%;height:56%');
        peek.style.opacity = '0'; train.appendChild(wg); A.sfx.tone(300, 200, 120, 'square', .08); await sleep(350); },
        async finish(){ say('t3_zug_fx').catch(() => {}); A.sfx.tone(660, 660, 400, 'square', .06, 1.8);      /* паровоз «ш-ш-ш-ш» из голоса */ await anim(train, [{transform: 'none'}, {transform: 'translateX(130%)'}], 2200, {easing: 'ease-in'}); }};
    }},
    /* 5. Башня: каждое слово — кубик сверху; в конце звезда на макушке */
    turm: {name: 'Башня', intro: 't3_g_turm_intro', ru: 't3_g_turm_ru', ende: 't3_g_turm_ende', setup(b){
      put(b, 'left:20%;right:20%;bottom:4%;height:3%;background:#57c26a;border-radius:6px');
      const tower = put(b, 'left:30%;right:30%;bottom:7%;height:93%;display:flex;flex-direction:column-reverse;align-items:center');
      return {peek: 'left:3%;top:4%;height:30%', async step(w, k, peek){
        const c = SA.el('div', ''); c.style.cssText = `height:14.5%;aspect-ratio:1;flex:none;background:${COLORS[k % 7]};border:4px solid #4a3550;border-radius:10px;padding:2%;margin-top:-1px;box-sizing:border-box`;
        c.innerHTML = SA.pic(w); tower.appendChild(c); peek.style.opacity = '0';
        await anim(c, [{transform: 'translateY(-500%)'}, {transform: 'translateY(8%)', offset: .85}, {transform: 'none'}], 600, {easing: 'ease-in'}); A.sfx.tone(220, 160, 120, 'triangle', .3); },
        async finish(){ const st = SA.el('div', 'pop', SA.pic('star')); st.style.cssText = 'height:10%;aspect-ratio:1;flex:none'; tower.appendChild(st); A.sfx.sparkle(); tower.classList.add('wobble'); await sleep(900); tower.classList.remove('wobble'); }};
    }},
    /* 6. Воздушные шарики: каждое слово получает шарик и взлетает; в конце все улетают */
    ballons: {name: 'Шарики', intro: 't3_g_ballons_intro', ru: 't3_g_ballons_ru', ende: 't3_g_ballons_ende', setup(b, ws){
      b.style.background = 'linear-gradient(#bfe6ff,#eaf6ff)';
      const all = [];
      return {peek: 'left:38%;top:2%;height:28%', async step(w, k, peek){
        const n = Math.max(ws.length, 4), x = 4 + (k % n)*(92/n);
        const bl = put(b, `left:${x}%;width:${88/n}%;bottom:0;height:56%`, '<div style="position:absolute;left:0;right:0;top:0;bottom:24%">' + svg(`<ellipse cx="50" cy="40" rx="34" ry="40" fill="${COLORS[k % 7]}" ${S}/><path d="M50 80 l-6 8 h12 z" fill="${COLORS[k % 7]}" ${S} stroke-width="3"/><path d="M50 88 q-8 30 0 60 q8 30 0 52" fill="none" stroke="#4a3550" stroke-width="3"/><ellipse cx="38" cy="26" rx="7" ry="12" fill="#fff" opacity=".6"/>`, '0 0 100 200') + '</div>'
          + mini(w, 'left:5%;bottom:0;width:90%;aspect-ratio:1;background:#fff;border-radius:16px;box-shadow:0 4px 0 rgba(0,0,0,.1)'));
        all.push(bl); peek.style.opacity = '0'; A.sfx.tone(400, 800, 300, 'sine', .15);
        await anim(bl, [{transform: 'translateY(60%)', opacity: 0}, {transform: `translateY(${-16 - (k % 2)*8}%)`, opacity: 1}], 900); },
        async finish(){ A.sfx.whoosh(); all.forEach((e, i) => e.animate([{transform: 'translateY(-260%)'}], {duration: (1800 + i*150)/SA.SPEED, fill: 'forwards', easing: 'ease-in'})); await sleep(1500); },
        end(){ b.style.background = ''; }};
    }},
    /* 7. Сад: каждое слово — вырастает цветок; в конце выходит солнышко */
    blumen: {name: 'Сад', intro: 't3_g_blumen_intro', ru: 't3_g_blumen_ru', ende: 't3_g_blumen_ende', setup(b, ws){
      put(b, 'left:0;right:0;bottom:0;height:12%;background:#8fd06a;border-top:5px solid #4a8f3e');
      const sun = put(b, 'right:4%;top:-30%;height:26%;aspect-ratio:1;transition:top 1.2s', svg(`<g stroke="#ffb020" stroke-width="8" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M100 100 m${(Math.cos(a*Math.PI/180)*70).toFixed(0)} ${(Math.sin(a*Math.PI/180)*70).toFixed(0)} l${(Math.cos(a*Math.PI/180)*20).toFixed(0)} ${(Math.sin(a*Math.PI/180)*20).toFixed(0)}"/>`).join('')}</g><circle cx="100" cy="100" r="54" fill="#ffd84d" ${S}/><circle cx="82" cy="94" r="6" fill="#4a3550"/><circle cx="118" cy="94" r="6" fill="#4a3550"/><path d="M80 116 q20 18 40 0" fill="none" ${S}/>`));
      const n = Math.max(ws.length, 4);
      return {async step(w, k, peek){
        const x = 3 + k*(94/n), fl = put(b, `left:${x}%;width:${90/n}%;bottom:8%;height:62%;transform-origin:50% 100%`,
          svg(`<path d="M50 220 V90" stroke="#3e9a4a" stroke-width="7"/><path d="M50 170 q-28 -6 -34 -30 q26 4 34 22" fill="#7bd36a" ${S} stroke-width="3"/>${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${(50 + Math.cos(a*Math.PI/180)*34).toFixed(0)}" cy="${(52 + Math.sin(a*Math.PI/180)*34).toFixed(0)}" r="22" fill="${COLORS[k % 7]}" ${S} stroke-width="3"/>`).join('')}<circle cx="50" cy="52" r="32" fill="#fff" ${S} stroke-width="3"/>`, '0 0 100 220')
          + mini(w, 'left:22%;top:9%;width:56%;aspect-ratio:1'));
        peek.style.opacity = '0'; A.sfx.tone(300, 900, 500, 'sine', .14);
        await anim(fl, [{transform: 'scaleY(0)'}, {transform: 'scaleY(1.06)', offset: .8}, {transform: 'none'}], 800); },
        async finish(){ sun.style.top = '3%'; A.sfx.sparkle(); await sleep(1300); }};
    }},
    /* 8. Рыбалка: рыбка с картинкой плавает; слово — рыбка прыгает в ведёрко */
    angeln: {name: 'Рыбалка', intro: 't3_g_angeln_intro', ru: 't3_g_angeln_ru', ende: 't3_g_angeln_ende', setup(b){
      put(b, 'left:0;right:0;bottom:0;height:55%;background:linear-gradient(#7cc8f0,#3f8fd0);border-top:6px solid #fff');
      const bucket = put(b, 'right:3%;top:4%;height:34%;aspect-ratio:1', svg(`<path d="M30 60 h140 l-16 120 q-2 10 -12 10 h-84 q-10 0 -12 -10 z" fill="#ffb14d" ${S}/><path d="M30 60 q70 -70 140 0" fill="none" ${S}/>`));
      const caught = put(b, 'left:26%;right:34%;top:4%;display:flex;flex-wrap:wrap;gap:3%;justify-content:center');
      let fish = null;
      return {noPeek: true, async show(w, k){
        fish = put(b, 'left:8%;bottom:10%;height:34%;aspect-ratio:1.4', svg(`<path d="M20 70 q60 -70 150 0 q-90 70 -150 0 z" fill="${COLORS[(k + 3) % 7]}" ${S}/><path d="M168 70 l26 -30 v60 z" fill="${COLORS[(k + 3) % 7]}" ${S}/><circle cx="50" cy="62" r="7" fill="#2a1f33"/>`, '0 0 200 140') + mini(w, 'left:30%;top:18%;width:42%;height:62%'));
        fish.animate([{transform: 'translateX(0) rotate(-4deg)'}, {transform: 'translateX(25%) rotate(4deg)'}], {duration: 900, iterations: Infinity, direction: 'alternate'}); await sleep(200); },
        async step(w, k){ fish.getAnimations().forEach(a => a.cancel()); A.sfx.noise(200, 1200, .25);
          await anim(fish, [{transform: 'none'}, {transform: 'translate(110%,-130%) rotate(-30deg) scale(.8)', offset: .5}, {transform: 'translate(220%,-150%) scale(.2)', opacity: 0}], 900);
          fish.remove(); caught.appendChild(SA.el('div', 'pop', SA.pic(w))); caught.lastChild.style.cssText = 'width:22%;aspect-ratio:1'; A.sfx.pop(); }};
    }},
    /* 9. Картинка-загадка: под плитками спряталась учительница; каждое слово открывает кусочек */
    puzzle: {name: 'Картинка-загадка', intro: 't3_g_puzzle_intro', ru: 't3_g_puzzle_ru', ende: 't3_g_puzzle_ende', setup(b, ws){
      const who = SA.pick([1, 2]), pz = put(b, 'left:50%;top:4%;height:92%;aspect-ratio:3/4;transform:translateX(-50%);border-radius:24px;overflow:hidden;background:#fff6e8;box-shadow:0 8px 0 rgba(0,0,0,.12)',
        `<img src="${T.src(who, 'body_hello')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain">`);
      const cols = 2, rows = ws.length > 4 ? 3 : 2, tiles = [];
      for (let i = 0; i < cols*rows; i++){ const t = SA.el('div', ''); t.style.cssText = `position:absolute;left:${(i % cols)*50}%;top:${Math.floor(i/cols)*100/rows}%;width:50%;height:${100/rows}%;background:${COLORS[i % 7]};border:3px solid #fff;box-sizing:border-box;display:grid;place-items:center`;
        t.innerHTML = '<span style="font:900 7vh sans-serif;color:#fff">?</span>'; pz.appendChild(t); tiles.push(t); }
      const order = SA.shuffle(tiles), per = Math.ceil(tiles.length/ws.length); let open = 0;
      const flip = async () => { const t = order[open++]; if (!t) return; chime(open); await anim(t, [{transform: 'none', opacity: 1}, {transform: 'rotateY(90deg) scale(.6)', opacity: 0}], 450); };
      return {peek: 'left:3%;top:4%;height:30%', async step(){ for (let i = 0; i < per; i++) await flip(); },
        async finish(){ while (open < order.length) await flip(); A.sfx.fanfare(); await sleep(600); }};
    }},
    /* 10. Подарки: слово распаковывает подарок — сюрприз внутри */
    geschenke: {name: 'Подарки', intro: 't3_g_geschenke_intro', ru: 't3_g_geschenke_ru', ende: 't3_g_geschenke_ende', setup(b, ws){
      const n = ws.length, cols = n > 3 ? Math.ceil(n/2) : n, rows = n > 3 ? 2 : 1, gifts = [];
      for (let i = 0; i < n; i++){
        const g = put(b, `left:${6 + (i % cols)*(88/cols)}%;top:${rows === 1 ? 30 : 6 + Math.floor(i/cols)*46}%;width:${80/cols}%;height:${rows === 1 ? 44 : 40}%`);
        const box = SA.el('div', ''); box.style.cssText = 'position:absolute;inset:0'; box.innerHTML = svg(`<rect x="30" y="80" width="140" height="110" rx="8" fill="${COLORS[i % 7]}" ${S}/><rect x="90" y="80" width="20" height="110" fill="#fff36b" ${S} stroke-width="3"/>`);
        const lid = SA.el('div', ''); lid.style.cssText = 'position:absolute;inset:0;transform-origin:15% 40%'; lid.innerHTML = svg(`<rect x="22" y="56" width="156" height="30" rx="6" fill="${COLORS[i % 7]}" ${S}/><rect x="90" y="56" width="20" height="30" fill="#fff36b" ${S} stroke-width="3"/><path d="M100 56 q-30 -40 -40 -10 q10 14 40 10 q30 4 40 -10 q-10 -30 -40 10" fill="#fff36b" ${S} stroke-width="3"/>`);
        g.appendChild(box); g.appendChild(lid); gifts.push({g, lid});
      }
      return {noPeek: true, async show(w, k){ const {g, lid} = gifts[k]; g.classList.add('wobble'); await sleep(500); g.classList.remove('wobble');
          A.sfx.sparkle(); lid.animate([{transform: 'none'}, {transform: 'translate(-20%,-30%) rotate(-40deg)'}], {duration: 400/SA.SPEED, fill: 'forwards'});
          const p = SA.el('div', 'pop'); p.style.cssText = 'position:absolute;left:20%;top:-6%;width:60%;aspect-ratio:1;background:#fff;border-radius:20%;padding:6%;box-sizing:border-box;box-shadow:0 4px 0 rgba(0,0,0,.12)'; p.innerHTML = SA.pic(w); g.appendChild(p); await sleep(400); },
        async step(w, k){ SA.starEl(gifts[k].g); await sleep(300); },
        async finish(k){ for (let i = k; i < gifts.length; i++){ gifts[i].lid.animate([{transform: 'none'}, {transform: 'translate(-20%,-30%) rotate(-40deg)'}], {duration: 300, fill: 'forwards'}); } A.sfx.sparkle(); await sleep(500); }};
    }},
    /* 11. Салют: каждое слово — вспышка с картинкой в ночном небе */
    feuerwerk: {name: 'Салют', intro: 't3_g_feuerwerk_intro', ru: 't3_g_feuerwerk_ru', ende: 't3_g_feuerwerk_ende', setup(b, ws){
      b.style.background = 'linear-gradient(#1d1640,#3a2a6a)';
      const spots = SA.shuffle([[12, 8], [40, 4], [68, 10], [20, 42], [52, 36], [76, 44], [36, 22]]);
      const burst = (x, y, c, big) => {
        const f = put(b, `left:${x}%;top:${y}%;width:${big ? 30 : 22}%;aspect-ratio:1`); A.sfx.noise(260, 500, .3);
        for (let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, d = SA.el('i', ''); d.style.cssText = `position:absolute;left:46%;top:46%;width:8%;height:8%;border-radius:50%;background:${COLORS[(c + i) % 7]}`; f.appendChild(d);
          d.animate([{transform: 'none', opacity: 1}, {transform: `translate(${Math.cos(a)*500}%,${Math.sin(a)*500}%)`, opacity: 0}], {duration: 1100/SA.SPEED, fill: 'forwards', easing: 'ease-out'}); }
        return f;
      };
      const rocket = async (x, y) => { const r = put(b, `left:${x + 9}%;bottom:0;width:2%;height:8%;background:#fff36b;border-radius:4px`); A.sfx.tone(300, 1400, 500, 'sine', .08);
        await anim(r, [{transform: 'none'}, {transform: `translateY(-${(100 - y - 20)*12}%)`, opacity: .2}], 500, {easing: 'ease-in'}); r.remove(); };
      return {peek: 'left:3%;bottom:4%;height:28%', async step(w, k, peek){
        const [x, y] = spots[k % spots.length]; peek.style.opacity = '0'; await rocket(x, y);
        const f = burst(x, y, k, false); const p = SA.el('div', 'pop'); p.style.cssText = 'position:absolute;inset:22%'; p.innerHTML = SA.pic(w); f.appendChild(p); await sleep(500); },
        async finish(){ for (let i = 0; i < 3; i++){ burst(10 + i*30, 10 + (i % 2)*20, i*2, true); await sleep(350); } await sleep(500); },
        end(){ b.style.background = ''; }};
    }},
    /* 12. Снеговик: каждое слово приносит часть (низ, середина, голова, глаза и нос, шапка, шарф) */
    schneemann: {name: 'Снеговик', intro: 't3_g_schneemann_intro', ru: 't3_g_schneemann_ru', ende: 't3_g_schneemann_ende', setup(b, ws){
      b.style.background = 'linear-gradient(#cfe6ff,#f4f9ff)';
      put(b, 'left:0;right:0;bottom:0;height:12%;background:#fff;border-top:4px solid #dfe9f5');
      const parts = [`<circle cx="100" cy="230" r="56" fill="#fff" ${S}/>`, `<circle cx="100" cy="148" r="42" fill="#fff" ${S}/><circle cx="100" cy="136" r="5" fill="#4a3550"/><circle cx="100" cy="156" r="5" fill="#4a3550"/>`,
        `<circle cx="100" cy="80" r="32" fill="#fff" ${S}/>`, `<circle cx="88" cy="74" r="5" fill="#2a1f33"/><circle cx="112" cy="74" r="5" fill="#2a1f33"/><path d="M100 82 l26 6 l-26 4 z" fill="#ff9a4d" stroke="#e8752e" stroke-width="3"/><path d="M88 96 q12 8 24 0" fill="none" stroke="#2a1f33" stroke-width="3"/>`,
        `<rect x="76" y="20" width="48" height="34" rx="4" fill="#4a3550"/><rect x="64" y="50" width="72" height="10" rx="4" fill="#4a3550"/><rect x="76" y="40" width="48" height="8" fill="#ff5a5a"/>`,
        `<path d="M70 108 q30 14 60 0 v12 q-30 14 -60 0 z" fill="#ff5a5a" ${S} stroke-width="3"/><path d="M118 116 l8 34 h-14 z" fill="#ff5a5a" ${S} stroke-width="3"/><path class="arm" d="M60 150 l-40 -30 M140 150 l40 -34 m-14 10 l10 -18" fill="none" stroke="#8a5a3b" stroke-width="6" stroke-linecap="round"/>`];
      const sm = put(b, 'left:50%;bottom:6%;height:90%;aspect-ratio:200/290;transform:translateX(-50%)', svg(parts.map((p, i) => `<g data-p="${i}" style="opacity:0">${p}</g>`).join(''), '0 0 200 290'));
      const gs = [...sm.querySelectorAll('g')], per = Math.ceil(gs.length/ws.length); let shown = 0;
      const add = async () => { const g = gs[shown++]; if (!g) return; chime(shown); g.style.opacity = '1'; g.animate([{transform: 'translateY(-30px)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: 450/SA.SPEED, fill: 'forwards'}); await sleep(350); };
      return {peek: 'left:3%;top:4%;height:30%', async step(){ for (let i = 0; i < per; i++) await add(); },
        async finish(){ while (shown < gs.length) await add(); A.sfx.sparkle(); sm.classList.add('wobble'); await sleep(900); sm.classList.remove('wobble'); },
        end(){ b.style.background = ''; }};
    }},
    /* 13. Дорожка к кладу: каждое слово — прыжок на камешек через речку; в конце сундук с кладом */
    weg: {name: 'Дорожка к кладу', intro: 't3_g_weg_intro', ru: 't3_g_weg_ru', ende: 't3_g_weg_ende', setup(b, ws){
      put(b, 'left:0;right:0;top:48%;height:32%;background:linear-gradient(#7cc8f0,#4f9fe0)');
      const n = ws.length, xs = [6, ...Array.from({length: n}, (_, i) => 16 + i*(54/Math.max(1, n - 1))), 72];
      xs.slice(1, -1).forEach((x, i) => put(b, `left:${x}%;top:${i % 2 ? 58 : 54}%;width:10%;height:12%;background:#b8b0a6;border:4px solid #4a3550;border-radius:50%`));
      const chest = put(b, 'right:1%;top:30%;height:30%;aspect-ratio:1', SA.pic('kiste', false));
      const kid = put(b, `left:${xs[0] - 5}%;top:30%;height:30%;aspect-ratio:1;transition:left .55s ease-in-out`, SA.pic('kind'));
      let at = 0;
      const hop = async () => { at++; if (at >= xs.length) return; kid.style.left = (xs[at] - 5) + '%'; A.sfx.tone(400, 800, 200, 'triangle', .15);
        await anim(kid, [{transform: 'none'}, {transform: 'translateY(-35%)'}, {transform: 'none'}], 550, {easing: 'ease-in-out'}); };
      return {peek: 'left:3%;top:2%;height:26%', async step(){ await hop(); },
        async finish(){ while (at < xs.length - 1) await hop(); chest.innerHTML = SA.pic('kiste', true); const st = put(b, 'right:6%;top:10%;height:20%;aspect-ratio:1', SA.pic('star'), 'pop'); A.sfx.fanfare(); await sleep(800); st.remove(); }};
    }}
  };

  /* одна игра: картинка-подсказка слова → образец → повтор → шаг игры */
  X.game = async (kind, words, tag) => {
    X.earOff();
    const g = G[kind] || G.kiste, b = X.board();
    const s = g.setup(b, words);
    const peek = s.noPeek ? null : put(b, 'aspect-ratio:1;opacity:0;transition:transform .35s,opacity .25s;background:#fff;border-radius:20%;padding:1.5%;box-sizing:border-box;box-shadow:0 6px 0 rgba(0,0,0,.12);z-index:3;' + (s.peek || 'left:4%;width:24%;top:22%'));
    X.help(3, [g.intro]);
    T.body(3, 'explain'); if (X.once('game_' + kind)) await say(g.intro);
    let k = 0;
    try {
      for (const w of words){
        if (X.left() < 6 && k > 2) break;
        if (peek){ peek.style.transition = 'none'; peek.style.transform = s.peekT || 'scale(.6)'; peek.innerHTML = SA.pic(w); void peek.offsetWidth; peek.style.transition = 'transform .35s,opacity .25s'; peek.style.opacity = '1'; peek.style.transform = s.peekT || 'scale(1)'; }
        if (s.show) await s.show(w, k, peek);
        T.body(3, 'point');
        await X.repeatItem({id: `spiel:${w}`, model: 't3_w_' + w, vis: WVIS[w], block: 'game', tag, prompts: [k === 0 && g.sag ? g.sag : 't3_spiel_sag2', 't3_jetzt_du2', g.ru]});
        A.sfx.pop();
        await s.step(w, k, peek);
        if (peek) peek.style.opacity = '0';
        k++;
      }
      X.earOff(); X.marks(null);
      if (s.finish) await s.finish(k);
      T.body(3, 'praise'); A.sfx.fanfare(); await say(g.ende);
    } finally { if (s.end) s.end(); }
    P.item({block: 'game', id: 'game:' + g.name, kind: 'game', result: 'done'});
  };

  /* какие игры в этом уроке: на первом круге — из плана урока, дальше — случайные, не как в прошлом уроке */
  X.pickGames = (planned, level) => X.pickFresh('sa-game-last', Object.keys(G), planned, level);
})();
