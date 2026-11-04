/* Учительницы: настройки (config/teachers.json), картинки и заглушки, показ и «говорящий рот».
   Картинка ищется так: <папка>/teacherN_<имя>.png, потом .webp, потом .jpg. Нет файла — заглушка, нарисованная кодом.
   При загрузке картинка выравнивается сама: убирается ровный фон (если он не прозрачный), обрезаются пустые края,
   фигура ставится по центру головы и приводится к одному размеру. Ручная подгонка — adjust в config/teachers.json. */
(function(){
  const T = SA.T = {cfg: null, img: {}, real: {}, cur: 0, mode: 'body', pose: 'hello', fixed: null, vis: null};
  /* все картинки, которые использует код (см. sprites-speech-academy.md) */
  T.FACE = ['neutral', 'talk_half', 'talk_open', 'talk_o', 'talk_i', 'talk_u', 'smell', 'blow', 'smile', 'kiss', 'open_wide', 'cheeks',
    'tongue_out', 'tongue_up', 'tongue_down', 'tongue_left', 'tongue_right', 'lick', 'click', 'snd_sch', 'snd_s', 'snd_f', 'snd_l', 'snd_k'];
  T.BODY = ['hello', 'explain', 'point', 'listen', 'think', 'praise', 'support', 'dance', 'dance2', 'bye', 'clap'];
  T.NEED = {   /* какие картинки нужны каждой учительнице: обязательные для занятия 1 и позже */
    1: {must: ['face_neutral', 'face_talk_half', 'face_talk_open', 'face_smell', 'face_blow', 'face_smile', 'face_kiss', 'face_open_wide', 'face_cheeks',
               'body_hello', 'body_explain', 'body_praise', 'body_support', 'body_dance', 'body_bye'],
        later: ['face_tongue_out', 'face_tongue_up', 'face_tongue_down', 'face_tongue_left', 'face_tongue_right', 'face_lick', 'face_click', 'body_point', 'body_listen', 'body_dance2']},
    2: {must: ['face_neutral', 'face_talk_half', 'face_talk_open', 'body_hello', 'body_listen', 'body_point', 'body_praise', 'body_support', 'body_dance', 'body_bye'],
        later: ['body_clap', 'body_think', 'body_explain', 'body_dance2']},
    3: {must: ['face_neutral', 'face_talk_half', 'face_talk_open', 'face_talk_o', 'face_talk_i', 'face_talk_u',
               'body_hello', 'body_explain', 'body_listen', 'body_point', 'body_praise', 'body_support', 'body_dance', 'body_bye'],
        later: ['face_snd_sch', 'face_snd_s', 'face_snd_f', 'face_snd_l', 'face_snd_k', 'body_think', 'body_dance2']}
  };

  T.init = async () => {
    T.cfg = await SA.fetchJSON('config/teachers.json');
    /* сначала только то, что видно на старте (три приветствия), остальное догружается в фоне: T.ready */
    await Promise.all([1, 2, 3].map(n => loadOne(n, 'body_hello')));
    const jobs = [];
    for (const n of [1, 2, 3]) for (const name of [...T.NEED[n].must, ...T.NEED[n].later]) if (name !== 'body_hello') jobs.push(loadOne(n, name));
    T.ready = Promise.all(jobs);
  };
  T.name = n => T.cfg.teachers[n].name;
  T.src = (n, name) => T.img[`${n}_${name}`] || placeholder(n, name);

  function tryLoad(url){
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = SA.ver(url); });
  }
  async function loadOne(n, name){
    const t = T.cfg.teachers[n], base = `${t.folder}/teacher${n}_${name}`;
    for (const ext of ['png', 'webp', 'jpg']){
      const im = await tryLoad(`${base}.${ext}`);
      if (im){ try { T.img[`${n}_${name}`] = await normalize(im, name, T.cfg.adjust[`teacher${n}_${name}`]); T.real[`${n}_${name}`] = `${base}.${ext}`; } catch(e){ console.warn(e); } return; }
    }
  }

  /* выравнивание: фон -> прозрачный, обрезка, по центру головы, один размер */
  async function normalize(im, name, adj){
    const W = im.naturalWidth, H = im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', {willReadFrequently: true}); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, W, H), px = d.data;
    const A = (x, y) => px[(y*W + x)*4 + 3];
    const corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]];
    if (corners.every(([x, y]) => A(x, y) > 240)) removeBg(px, W, H);
    /* рамка по непрозрачным точкам */
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y*W + x)*4 + 3] > 24){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) throw new Error('пустая картинка ' + name);
    /* центр головы: середина непрозрачного в верхней трети фигуры */
    const yh = y0 + (y1 - y0)*0.3; let hx0 = W, hx1 = -1;
    for (let y = y0; y < yh; y += 2) for (let x = x0; x <= x1; x += 2) if (px[(y*W + x)*4 + 3] > 24){ if (x < hx0) hx0 = x; if (x > hx1) hx1 = x; }
    const cx = hx1 >= 0 ? (hx0 + hx1)/2 : (x0 + x1)/2;
    g.putImageData(d, 0, 0);
    const face = name.startsWith('face_'), OW = 1024, OH = face ? 1024 : 1536;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    /* лицо: по ширине плеч и низу; тело: по высоте и низу */
    let s = face ? Math.min(OW*0.96/bw, OH*0.98/bh) : Math.min(OH*0.97/bh, OW*1.4/bw);
    if (adj && adj.scale) s *= adj.scale;
    const o = document.createElement('canvas'); o.width = OW; o.height = OH; const og = o.getContext('2d');
    og.imageSmoothingQuality = 'high';
    const dx = OW/2 - (cx - x0)*s + (adj && adj.dx || 0)*OW, dy = OH - bh*s + (adj && adj.dy || 0)*OH;
    og.drawImage(c, x0, y0, bw, bh, dx, dy, bw*s, bh*s);
    return await new Promise(res => o.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  /* ровный фон: заливка от краёв всем, что похоже на цвет углов */
  function removeBg(px, W, H){
    const ref = [0, (W - 1), (H - 1)*W, H*W - 1].map(i => [px[i*4], px[i*4 + 1], px[i*4 + 2]]);
    const near = i => ref.some(r => Math.abs(px[i*4] - r[0]) + Math.abs(px[i*4 + 1] - r[1]) + Math.abs(px[i*4 + 2] - r[2]) < 60);
    const seen = new Uint8Array(W*H), st = [];
    for (let x = 0; x < W; x++){ st.push(x, (H - 1)*W + x); }
    for (let y = 0; y < H; y++){ st.push(y*W, y*W + W - 1); }
    while (st.length){
      const i = st.pop(); if (seen[i]) continue; seen[i] = 1;
      if (!near(i)) continue;
      px[i*4 + 3] = 0;
      const x = i % W, y = (i/W) | 0;
      if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1); if (y > 0) st.push(i - W); if (y < H - 1) st.push(i + W);
    }
  }

  /* ---------- заглушки: нарисованы кодом, позы рта и языка понятны ребёнку ---------- */
  const cache = {};
  function placeholder(n, name){
    const k = n + '_' + name; if (cache[k]) return cache[k];
    const t = T.cfg.teachers[n], svg = name.startsWith('face_') ? faceSVG(t, name.slice(5), n) : bodySVG(t, name.slice(5), n);
    return cache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const INK = '#4a3550', SKIN = '#ffe0c8', LIP = '#e8667f', MOUTH = '#6b2440', TONGUE = '#ff7a9a';
  function mouth(kind){
    const lips = (d, w = 5) => `<path d="${d}" fill="${MOUTH}" stroke="${LIP}" stroke-width="${w}" stroke-linejoin="round"/>`;
    switch (kind){
      case 'neutral': case 'smell': return `<path d="M86 128 q14 9 28 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
      case 'talk_half': return lips('M88 126 q12 -6 24 0 q-12 10 -24 0 z') + `<path d="M93 129 q7 3 14 0" fill="${TONGUE}"/>`;
      case 'talk_open': return lips('M84 122 q16 -8 32 0 q-2 20 -16 22 q-14 -2 -16 -22 z') + `<path d="M88 123 h24 v4 h-24z" fill="#fff"/><path d="M90 138 q10 -8 20 0 q-10 6 -20 0z" fill="${TONGUE}"/>`;
      case 'talk_o': return `<circle cx="100" cy="130" r="11" fill="${MOUTH}" stroke="${LIP}" stroke-width="6"/>`;
      case 'talk_i': return lips('M78 126 q22 -6 44 0 q-22 10 -44 0 z', 4) + `<path d="M82 126 q18 -3 36 0 v2 q-18 3 -36 0z" fill="#fff"/>`;
      case 'talk_u': case 'blow': return `<ellipse cx="100" cy="130" rx="9" ry="8" fill="${MOUTH}" stroke="${LIP}" stroke-width="8"/>`;
      case 'smile': return lips('M70 120 q30 4 60 0 q-6 22 -30 22 q-24 0 -30 -22 z', 4) + `<path d="M74 121 q26 4 52 0 v6 q-26 4 -52 0z" fill="#fff"/><path d="M76 127 q24 4 48 0" stroke="#ddd" stroke-width="1.5" fill="none"/>`;
      case 'kiss': return `<ellipse cx="100" cy="131" rx="13" ry="11" fill="${LIP}" stroke="#c94a63" stroke-width="3"/><ellipse cx="100" cy="131" rx="4" ry="3" fill="${MOUTH}"/><path d="M90 126 q10 -4 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`;
      case 'open_wide': return lips('M78 116 q22 -10 44 0 q0 40 -22 42 q-22 -2 -22 -42 z') + `<path d="M84 117 h32 v4 h-32z" fill="#fff"/><path d="M84 146 q16 -10 32 0 q-16 9 -32 0z" fill="${TONGUE}"/>`;
      case 'cheeks': return `<path d="M90 130 h20" stroke="${LIP}" stroke-width="7" stroke-linecap="round"/>`;
      case 'tongue_out': return lips('M84 122 q16 -6 32 0 q-2 14 -16 16 q-14 -2 -16 -16 z') + `<path d="M88 128 q12 -4 24 0 v14 q0 14 -12 14 q-12 0 -12 -14 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/><path d="M100 132 v14" stroke="#d94f73" stroke-width="2"/>`;
      case 'tongue_up': return lips('M84 124 q16 -4 32 0 q-2 16 -16 18 q-14 -2 -16 -18 z') + `<path d="M90 130 q-2 -18 4 -26 q6 -6 12 0 q6 8 4 26 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/>`;
      case 'tongue_down': return lips('M84 120 q16 -6 32 0 q-2 14 -16 16 q-14 -2 -16 -16 z') + `<path d="M89 126 q11 -4 22 0 v22 q0 14 -11 14 q-11 0 -11 -14 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/>`;
      case 'tongue_left': return lips('M84 124 q16 -6 32 0 q-2 12 -16 14 q-14 -2 -16 -14 z') + `<path d="M92 130 q-10 -4 -18 0 q-8 6 0 10 q10 2 18 -4 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/>`;
      case 'tongue_right': return lips('M84 124 q16 -6 32 0 q-2 12 -16 14 q-14 -2 -16 -14 z') + `<path d="M108 130 q10 -4 18 0 q8 6 0 10 q-10 2 -18 -4 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/>`;
      case 'lick': return lips('M86 126 q14 -2 28 0 q-2 12 -14 14 q-12 -2 -14 -14 z') + `<path d="M92 128 q8 -14 16 0 q-8 4 -16 0z" fill="${TONGUE}" stroke="#d94f73" stroke-width="3"/>`;
      case 'click': return lips('M82 118 q18 -6 36 0 q-2 26 -18 28 q-16 -2 -18 -28 z') + `<path d="M86 119 h28 v4 h-28z" fill="#fff"/><path d="M88 142 q2 -16 12 -18 q10 2 12 18 q-12 4 -24 0z" fill="${TONGUE}" stroke="#d94f73" stroke-width="2"/>`;
      case 'snd_sch': return `<ellipse cx="100" cy="130" rx="14" ry="12" fill="${MOUTH}" stroke="${LIP}" stroke-width="7"/><path d="M89 126 h22 v3 h-22z M89 133 h22 v3 h-22z" fill="#fff"/>`;
      case 'snd_s': return lips('M80 126 q20 -6 40 0 q-20 10 -40 0 z', 4) + `<path d="M84 123 h32 v6 h-32z" fill="#fff"/><path d="M84 129 h32" stroke="#ccc" stroke-width="1.5"/>`;
      case 'snd_f': return lips('M84 126 q16 -6 32 0 q-16 8 -32 0 z', 4) + `<path d="M90 122 h20 v6 h-20z" fill="#fff"/>`;
      case 'snd_l': return lips('M84 122 q16 -6 32 0 q-2 18 -16 20 q-14 -2 -16 -20 z') + `<path d="M88 123 h24 v3 h-24z" fill="#fff"/><path d="M92 140 q2 -14 8 -15 q6 1 8 15 z" fill="${TONGUE}" stroke="#d94f73" stroke-width="2"/>`;
      case 'snd_k': return lips('M84 122 q16 -6 32 0 q-2 20 -16 22 q-14 -2 -16 -22 z') + `<path d="M88 123 h24 v3 h-24z" fill="#fff"/><path d="M88 140 q12 -14 24 0 q-12 4 -24 0z" fill="${TONGUE}"/>`;
    }
    return mouth('neutral');
  }
  function faceSVG(t, kind, n){
    const closed = kind === 'smell', puff = kind === 'cheeks', blow = kind === 'blow';
    const eyes = closed ? `<path d="M70 98 q8 6 16 0 M114 98 q8 6 16 0" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="78" cy="96" rx="9" ry="11" fill="#2a1f33"/><ellipse cx="122" cy="96" rx="9" ry="11" fill="#2a1f33"/><circle cx="81" cy="91" r="3.5" fill="#fff"/><circle cx="125" cy="91" r="3.5" fill="#fff"/>`;
    const cheekW = puff ? 70 : blow ? 62 : 56;
    const cheeks = puff ? `<circle cx="66" cy="124" r="16" fill="#ffc4b0" stroke="${INK}" stroke-width="2"/><circle cx="134" cy="124" r="16" fill="#ffc4b0" stroke="${INK}" stroke-width="2"/><circle cx="60" cy="118" r="4" fill="#fff" opacity=".8"/><circle cx="128" cy="118" r="4" fill="#fff" opacity=".8"/>`
      : `<ellipse cx="66" cy="116" rx="9" ry="6" fill="#ffb3b3" opacity=".7"/><ellipse cx="134" cy="116" rx="9" ry="6" fill="#ffb3b3" opacity=".7"/>`;
    const nose = closed ? `<path d="M100 104 q4 8 -2 12" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M90 104 q-8 -4 -12 2 M110 104 q8 -4 12 2" stroke="#9a7fb0" stroke-width="2.5" fill="none" stroke-dasharray="3 4"/>`
      : `<path d="M100 106 q3 6 -1 9" stroke="#d9a07a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <path d="M38 200 q4 -34 62 -38 q58 4 62 38 z" fill="${t.color}" stroke="${INK}" stroke-width="4"/>
      <path d="M44 100 q-6 -70 56 -70 q62 0 56 70 l6 50 q-10 10 -20 0 l-6 -40 h-72 l-6 40 q-10 10 -20 0 z" fill="${t.hair}" stroke="${INK}" stroke-width="4"/>
      <rect x="90" y="150" width="20" height="16" fill="${SKIN}"/>
      <path d="M${100 - cheekW} 100 q0 -58 ${cheekW} -58 q${cheekW} 0 ${cheekW} 58 q0 56 -${cheekW} 58 q-${cheekW} -2 -${cheekW} -58 z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>
      <path d="M48 86 q14 -44 52 -46 q38 2 52 46 q-26 -20 -52 -18 q-28 -2 -52 18 z" fill="${t.hair}" stroke="${INK}" stroke-width="4"/>
      ${eyes}${nose}${cheeks}${mouth(kind)}
      <circle cx="170" cy="30" r="18" fill="#fff" stroke="${t.color}" stroke-width="5"/><text x="170" y="38" text-anchor="middle" font-family="Trebuchet MS,sans-serif" font-weight="800" font-size="22" fill="${t.color}">${n}</text>
    </svg>`;
  }
  function bodySVG(t, pose, n){
    const full = pose === 'dance' || pose === 'dance2';
    const arm = (pts) => `<path d="M${pts}" fill="none" stroke="${t.color}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>`;
    const A = {   /* руки: [путь, кисть] для левой (на экране слева) и правой */
      hello: [['70 150 L52 112 L40 74', 40, 66], ['130 150 L142 200 L146 236', 146, 240]],
      explain: [['70 150 L60 200 L58 236', 58, 240], ['130 150 L162 176 L170 148', 172, 140]],
      point: [['70 150 L60 200 L58 236', 58, 240], ['130 150 L166 150 L192 146', 194, 146]],
      listen: [['70 150 L60 200 L58 236', 58, 240], ['130 150 L156 120 L148 86', 146, 80]],
      think: [['70 150 L60 200 L58 236', 58, 240], ['130 150 L124 182 L110 120', 108, 114]],
      praise: [['70 150 L44 120 L30 90', 28, 84], ['130 150 L156 120 L170 90', 172, 84]],
      support: [['70 150 L82 182 L94 168', 96, 166], ['130 150 L158 190 L170 214', 172, 218]],
      bye: [['70 150 L46 112 L36 72', 36, 64], ['130 150 L154 112 L164 72', 164, 64]],
      clap: [['70 150 L80 190 L96 176', 96, 176], ['130 150 L120 190 L104 176', 104, 176]],
      dance: [['74 116 L48 86 L36 52', 36, 46], ['126 116 L152 86 L164 52', 164, 46]],
      dance2: [['74 116 L40 122 L14 112', 12, 110], ['126 116 L160 122 L186 112', 188, 110]]
    }[pose] || [['70 150 L60 200 L58 236', 58, 240], ['130 150 L140 200 L142 236', 142, 240]];
    const H = full ? 300 : 300;
    const head = full ? {cx: 100, cy: 52, r: 30} : {cx: 100, cy: 76, r: 44};
    const thumb = '';
    const body = full
      ? `<path d="M74 104 h52 l8 90 h-68 z" fill="${t.color}" stroke="${INK}" stroke-width="4"/>
         <path d="M84 192 ${pose === 'dance' ? 'L70 244 L56 292' : 'L76 246 L84 292'}" fill="none" stroke="#5a4a6a" stroke-width="18" stroke-linecap="round"/>
         <path d="M116 192 ${pose === 'dance' ? 'L128 244 L140 292' : 'L132 242 L150 286'}" fill="none" stroke="#5a4a6a" stroke-width="18" stroke-linecap="round"/>
         ${A.map(([p, x, y]) => arm(p.replace(/^(\d+) (\d+)/, '$1 $2')) + hand(x, y)).join('')}`
      : `<path d="M44 300 v-110 q0 -50 56 -52 q56 2 56 52 v110 z" fill="${t.color}" stroke="${INK}" stroke-width="4"/>${A.map(([p, x, y]) => arm(p) + hand(x, y)).join('')}${thumb}`;
    const r = head.r, cx = head.cx, cy = head.cy;
    const face = `<path d="M${cx - r*1.1} ${cy + r*0.2} q-4 -${r*1.5} ${r*1.1} -${r*1.5} q${r*1.2} 0 ${r*1.1} ${r*1.5} l4 ${r*0.9} q-8 6 -14 0 l-2 -${r*0.6} h-${r*1.7} l-2 ${r*0.6} q-6 6 -14 0 z" fill="${t.hair}" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M${cx - r*0.92} ${cy - r*0.2} q${r*0.3} -${r*0.85} ${r*0.92} -${r*0.88} q${r*0.62} 0 ${r*0.92} ${r*0.88} q-${r*0.5} -${r*0.4} -${r*0.92} -${r*0.36} q-${r*0.46} -${r*0.04} -${r*0.92} ${r*0.36} z" fill="${t.hair}" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="${cx - r*0.35}" cy="${cy + r*0.05}" r="${r*0.11}" fill="#2a1f33"/><circle cx="${cx + r*0.35}" cy="${cy + r*0.05}" r="${r*0.11}" fill="#2a1f33"/>
      <path d="M${cx - r*0.3} ${cy + r*0.42} q${r*0.3} ${r*0.3} ${r*0.6} 0" fill="${pose === 'praise' || pose === 'dance' || pose === 'dance2' ? MOUTH : 'none'}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="${cx - r*0.6}" cy="${cy + r*0.32}" rx="${r*0.16}" ry="${r*0.1}" fill="#ffb3b3" opacity=".7"/><ellipse cx="${cx + r*0.6}" cy="${cy + r*0.32}" rx="${r*0.16}" ry="${r*0.1}" fill="#ffb3b3" opacity=".7"/>`;
    const badge = full ? `<circle cx="100" cy="150" r="14" fill="#fff"/><text x="100" y="157" text-anchor="middle" font-family="Trebuchet MS,sans-serif" font-weight="800" font-size="18" fill="${t.color}">${n}</text>`
      : `<circle cx="100" cy="236" r="20" fill="#fff"/><text x="100" y="245" text-anchor="middle" font-family="Trebuchet MS,sans-serif" font-weight="800" font-size="26" fill="${t.color}">${n}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 ${H}">${pose === 'listen' ? '' : ''}${full ? face + body : body + face}${badge}</svg>`;
  }

  /* ---------- показ на экране занятия ---------- */
  let view = null, imgEl = null, lastSrc = '';
  const setSrc = s => { if (s !== lastSrc){ imgEl.src = s; lastSrc = s; } };
  T.attach = (el) => { view = el; view.innerHTML = ''; imgEl = SA.el('img'); imgEl.alt = ''; view.appendChild(imgEl); };
  /* тело в позе: T.body(1, 'hello') */
  T.body = (n, pose) => { T.cur = n; T.mode = 'body'; T.pose = pose; T.fixed = null; view.className = ''; setSrc(T.src(n, 'body_' + pose)); };
  /* лицо крупно; fixed — поза рта, которую держим (упражнение), иначе — говорит/молчит */
  T.face = (n, fixed) => { T.cur = n; T.mode = 'face'; T.fixed = fixed || null; view.className = 'face'; setSrc(T.src(n, 'face_' + (fixed || 'neutral'))); };
  T.dance = (n, on) => { if (on){ T.body(n, 'dance'); view.classList.add('dance'); } else view.classList.remove('dance'); };
  /* рот во время реплики: по громкости записи; vis — для образцов гласных (o, i, u, open) */
  SA.A.onSpeak = (n, on, key, opt) => {
    if (!view) return;
    T.vis = on ? (opt && opt.vis) || null : null;
    view.classList.toggle('talking', on && n === T.cur);
  };
  function lipLoop(){
    requestAnimationFrame(lipLoop);
    if (!view || T.mode !== 'face') return;
    const talking = SA.A.speaking > 0 && view.classList.contains('talking');
    if (!talking){ setSrc(T.src(T.cur, 'face_' + (T.fixed || 'neutral'))); return; }
    const l = SA.A.level;
    let f = l < 0.06 ? 'neutral' : (T.vis && l > 0.12) ? T.vis : l < 0.22 ? 'talk_half' : 'talk_open';
    if (f === 'open') f = 'talk_open';
    setSrc(T.src(T.cur, 'face_' + f));
  }
  requestAnimationFrame(lipLoop);
  /* у тела во время реплики — лёгкое покачивание (CSS .talking) */
})();
