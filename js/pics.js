/* Картинки слов и предметов — нарисованы кодом (SVG 200×200), как предметы в игре. SA.pic(name) -> строка SVG. */
(function(){
  const S = 'stroke="#4a3550" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
  const eye = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2a1f33"/><circle cx="${x + r*.35}" cy="${y - r*.35}" r="${r*.35}" fill="#fff"/>`;
  const svg = (body, vb = '0 0 200 200') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  const P = {
    kuh: () => svg(`<ellipse cx="62" cy="58" rx="22" ry="12" fill="#fff" ${S} transform="rotate(-25 62 58)"/><ellipse cx="138" cy="58" rx="22" ry="12" fill="#fff" ${S} transform="rotate(25 138 58)"/>
      <path d="M70 46 Q66 26 78 22 M130 46 Q134 26 122 22" fill="none" ${S}/><rect x="56" y="40" width="88" height="104" rx="44" fill="#fff" ${S}/>
      <path d="M62 66 q14 -14 26 4 q-8 16 -24 10 z" fill="#4a3550"/><path d="M124 58 q16 2 14 20 q-14 4 -18 -10 z" fill="#4a3550"/>
      ${eye(82, 86)}${eye(118, 86)}<ellipse cx="100" cy="128" rx="38" ry="26" fill="#ffb3c7" ${S}/><circle cx="88" cy="128" r="5" fill="#4a3550"/><circle cx="112" cy="128" r="5" fill="#4a3550"/>`),
    katze: () => svg(`<path d="M50 70 L58 26 L88 54 Z M150 70 L142 26 L112 54 Z" fill="#ffb14d" ${S}/><circle cx="100" cy="100" r="56" fill="#ffb14d" ${S}/>
      <path d="M100 48 v18 M84 52 l4 14 M116 52 l-4 14" ${S} stroke="#d9822b"/>${eye(80, 96, 8)}${eye(120, 96, 8)}
      <path d="M94 116 h12 l-6 7 z" fill="#ff7a9a" ${S} stroke-width="3"/><path d="M100 123 q-8 10 -16 4 M100 123 q8 10 16 4" fill="none" ${S} stroke-width="4"/>
      <path d="M62 116 h-28 M62 124 l-26 8 M138 116 h28 M138 124 l26 8" ${S} stroke-width="3"/>`),
    hund: () => svg(`<ellipse cx="52" cy="92" rx="20" ry="38" fill="#a8774b" ${S} transform="rotate(14 52 92)"/><ellipse cx="148" cy="92" rx="20" ry="38" fill="#a8774b" ${S} transform="rotate(-14 148 92)"/>
      <circle cx="100" cy="98" r="52" fill="#f3d2a6" ${S}/>${eye(82, 90, 8)}${eye(118, 90, 8)}<ellipse cx="100" cy="118" rx="26" ry="20" fill="#fff4e4" ${S}/>
      <ellipse cx="100" cy="110" rx="10" ry="7" fill="#2a1f33"/><path d="M100 117 v8 q-8 8 -14 2 M100 125 q8 8 14 2" fill="none" ${S} stroke-width="4"/><path d="M96 134 q4 14 10 0" fill="#ff7a9a" ${S} stroke-width="3"/>`),
    schaf: () => svg(`<g fill="#fff" ${S}><circle cx="62" cy="80" r="22"/><circle cx="100" cy="64" r="24"/><circle cx="138" cy="80" r="22"/><circle cx="56" cy="118" r="22"/><circle cx="144" cy="118" r="22"/><circle cx="100" cy="140" r="24"/></g>
      <ellipse cx="70" cy="96" rx="16" ry="8" fill="#5a4a5a" ${S} transform="rotate(-20 70 96)"/><ellipse cx="130" cy="96" rx="16" ry="8" fill="#5a4a5a" ${S} transform="rotate(20 130 96)"/>
      <ellipse cx="100" cy="106" rx="30" ry="36" fill="#5a4a5a" ${S}/>${eye(89, 98, 6)}${eye(111, 98, 6)}<path d="M92 124 q8 6 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
    frosch: () => svg(`<circle cx="66" cy="66" r="24" fill="#7bd36a" ${S}/><circle cx="134" cy="66" r="24" fill="#7bd36a" ${S}/><ellipse cx="100" cy="116" rx="70" ry="50" fill="#7bd36a" ${S}/>
      <circle cx="66" cy="64" r="14" fill="#fff"/><circle cx="134" cy="64" r="14" fill="#fff"/>${eye(68, 66, 7)}${eye(136, 66, 7)}
      <path d="M52 116 q48 42 96 0" fill="#ff7a9a" ${S}/><circle cx="58" cy="100" r="7" fill="#ff9fb0" opacity=".7"/><circle cx="142" cy="100" r="7" fill="#ff9fb0" opacity=".7"/>`),
    auto: () => svg(`<path d="M24 128 v-26 q0 -10 10 -12 l26 -4 l22 -28 q6 -6 16 -6 h40 q10 0 16 8 l18 26 l14 4 q10 4 10 14 v24 z" fill="#ff5a5a" ${S}/>
      <path d="M88 84 l14 -20 h32 l14 20 z" fill="#bfe6ff" ${S} stroke-width="4"/><path d="M118 64 v20" ${S} stroke-width="4"/>
      <circle cx="64" cy="132" r="20" fill="#3b3344" ${S}/><circle cx="64" cy="132" r="8" fill="#ccc"/><circle cx="148" cy="132" r="20" fill="#3b3344" ${S}/><circle cx="148" cy="132" r="8" fill="#ccc"/>
      <circle cx="178" cy="104" r="5" fill="#ffd84d"/>`),
    ei: () => svg(`<path d="M100 24 C140 24 160 92 158 120 C156 156 132 176 100 176 C68 176 44 156 42 120 C40 92 60 24 100 24 Z" fill="#fff6e8" ${S}/><ellipse cx="80" cy="72" rx="9" ry="16" fill="#fff" transform="rotate(20 80 72)"/>`),
    ball: () => svg(`<circle cx="100" cy="100" r="66" fill="#ffd84d" ${S}/><path d="M100 34 q-30 66 0 132" fill="#ff5a5a" ${S}/><path d="M100 34 q30 66 0 132" fill="#5aa9ff" ${S}/><path d="M34 100 h132" fill="none" ${S}/>`),
    baum: () => svg(`<rect x="88" y="110" width="24" height="64" rx="6" fill="#a8774b" ${S}/><g fill="#57c26a" ${S}><circle cx="100" cy="62" r="36"/><circle cx="66" cy="94" r="30"/><circle cx="134" cy="94" r="30"/><circle cx="100" cy="104" r="30"/></g>
      <circle cx="78" cy="88" r="6" fill="#ff5a5a"/><circle cx="122" cy="70" r="6" fill="#ff5a5a"/><circle cx="112" cy="108" r="6" fill="#ff5a5a"/>`),
    oma: () => svg(`<path d="M50 190 q4 -54 50 -58 q46 4 50 58 z" fill="#9b7fd1" ${S}/><circle cx="100" cy="88" r="44" fill="#ffe0c8" ${S}/>
      <path d="M58 82 q0 -46 42 -46 q42 0 42 46 q-12 -22 -42 -24 q-30 2 -42 24 z" fill="#dcdce6" ${S}/><circle cx="100" cy="32" r="16" fill="#dcdce6" ${S}/>
      <circle cx="84" cy="90" r="11" fill="#fff" ${S} stroke-width="3"/><circle cx="116" cy="90" r="11" fill="#fff" ${S} stroke-width="3"/><path d="M95 90 h10" ${S} stroke-width="3"/>
      <circle cx="84" cy="90" r="4" fill="#2a1f33"/><circle cx="116" cy="90" r="4" fill="#2a1f33"/><path d="M86 112 q14 10 28 0" fill="none" ${S} stroke-width="4"/>
      <circle cx="70" cy="108" r="6" fill="#ffb3b3" opacity=".8"/><circle cx="130" cy="108" r="6" fill="#ffb3b3" opacity=".8"/>`),
    puppe: () => svg(`<path d="M62 186 l12 -66 h52 l12 66 z" fill="#ff8cc6" ${S}/><circle cx="100" cy="80" r="40" fill="#ffe0c8" ${S}/>
      <path d="M58 84 q-6 -52 42 -52 q48 0 42 52 q-6 -26 -22 -30 q-20 10 -40 0 q-16 4 -22 30 z" fill="#ffcf4d" ${S}/>
      <path d="M58 82 q-14 30 -6 50 M142 82 q14 30 6 50" fill="none" ${S} stroke="#e8b02e" stroke-width="10"/>
      ${eye(86, 84, 6)}${eye(114, 84, 6)}<path d="M90 102 q10 8 20 0" fill="none" ${S} stroke-width="4"/><circle cx="76" cy="98" r="6" fill="#ffb3b3" opacity=".8"/><circle cx="124" cy="98" r="6" fill="#ffb3b3" opacity=".8"/>
      <path d="M74 120 l-24 30 M126 120 l24 30" ${S} stroke="#ffe0c8" stroke-width="12"/>`),
    /* символы для «одинаковые / разные» */
    gleich: () => svg(`<circle cx="62" cy="100" r="40" fill="#5aa9ff" ${S}/><circle cx="138" cy="100" r="40" fill="#5aa9ff" ${S}/>`),
    anders: () => svg(`<circle cx="60" cy="100" r="40" fill="#5aa9ff" ${S}/><path d="M138 56 L182 140 H94 Z" fill="#ff7a59" ${S}/>`),
    star: () => svg(`<path d="M100 14 L124 72 L186 76 L138 116 L154 178 L100 144 L46 178 L62 116 L14 76 L76 72 Z" fill="#ffd84d" ${S}/>`),
    /* силуэт ребёнка, если камеры нет */
    kind: () => svg(`<circle cx="100" cy="86" r="50" fill="#ffe0c8" ${S}/><path d="M50 84 q-4 -58 50 -58 q54 0 50 58 q-14 -30 -50 -32 q-36 2 -50 32 z" fill="#8a5a3b" ${S}/>
      ${eye(82, 88, 7)}${eye(118, 88, 7)}<path d="M84 112 q16 12 32 0" fill="none" ${S}/><path d="M40 196 q6 -50 60 -54 q54 4 60 54" fill="#ff8cc6" ${S}/>`),
    kiste: (open) => svg(`<path d="M30 92 h140 v84 q0 8 -8 8 h-124 q-8 0 -8 -8 z" fill="#b06cff" ${S}/><path d="M30 120 h140" ${S} stroke="#ffd84d" stroke-width="8"/>
      ${open ? `<path d="M26 92 l14 -52 h120 l14 52 z" fill="#c995ff" ${S} transform="rotate(-16 30 92)"/>` : `<path d="M24 60 h152 v34 h-152 z" fill="#c995ff" ${S}/>`}
      <rect x="88" y="${open ? 106 : 80}" width="24" height="28" rx="5" fill="#ffd84d" ${S} stroke-width="4"/>
      <g fill="#fff36b"><circle cx="48" cy="40" r="4"/><circle cx="160" cy="30" r="5"/><circle cx="178" cy="70" r="3"/></g>`)
  };
  SA.pic = (name, arg) => (P[name] ? P[name](arg) : svg(`<rect x="20" y="20" width="160" height="160" rx="30" fill="#eee" ${S}/>`));

  /* одуванчик: n пушинок; SA.dandelion.blow(k) — улетает k штук */
  SA.dandelionSVG = (n) => {
    let seeds = '';
    for (let i = 0; i < n; i++){
      const a = (i/n)*Math.PI*2, r = 48 + (i % 3)*6, x = 100 + Math.cos(a)*r, y = 78 + Math.sin(a)*r;
      seeds += `<g class="seed" data-i="${i}" style="transform-origin:100px 78px"><path d="M100 78 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#d8d2c4" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#fff" stroke="#d8d2c4" stroke-width="2"/></g>`;
    }
    return svg(`<path d="M100 84 Q96 140 104 196" fill="none" stroke="#57a84a" stroke-width="7" stroke-linecap="round"/><path d="M102 160 q-26 -6 -36 -26 q24 2 36 18" fill="#7bd36a" stroke="#4a8f3e" stroke-width="3"/>
      ${seeds}<circle cx="100" cy="78" r="12" fill="#e8dcc0" stroke="#bfae8a" stroke-width="3"/>`);
  };
  /* торт со свечками */
  SA.cakeSVG = (n) => {
    let c = '';
    const w = 120/n;
    for (let i = 0; i < n; i++){
      const x = 40 + w*(i + .5);
      c += `<g class="candle" data-i="${i}"><rect x="${x - 6}" y="72" width="12" height="34" rx="3" fill="${['#ff7a9a', '#5aa9ff', '#ffd84d', '#7bd36a', '#b06cff', '#ff9a4d'][i % 6]}" ${S} stroke-width="3"/>
        <path class="flame" d="M${x} 46 q12 14 0 24 q-12 -10 0 -24 z" fill="#ffb020" stroke="#ff7a00" stroke-width="2"/></g>`;
    }
    return svg(`<ellipse cx="100" cy="178" rx="84" ry="12" fill="#e0c9ee"/><path d="M28 116 h144 v50 q0 10 -10 10 h-124 q-10 0 -10 -10 z" fill="#ffd6a8" ${S}/>
      <path d="M28 116 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0" fill="#fff" ${S} stroke-width="4"/>
      <path d="M24 106 h152 v12 h-152 z" fill="#ff9ec4" ${S} stroke-width="4"/>${c}`);
  };
  /* яйцо-награда: заполняется снизу на долю f (0..1). img — картинка награды (проявляется из серой) */
  SA.eggSVG = (f, segments, img) => {
    const id = 'eg' + Math.random().toString(36).slice(2, 7), y = 190 - 170*f;
    const shape = 'M100 14 C150 14 178 96 176 128 C174 168 142 192 100 192 C58 192 26 168 24 128 C22 96 50 14 100 14 Z';
    let lines = '';
    for (let i = 1; i < segments; i++){ const yy = 190 - 170*i/segments; lines += `<path d="M20 ${yy.toFixed(1)} h160" stroke="#fff" stroke-width="3" stroke-dasharray="8 8" opacity=".8"/>`; }
    const fill = img ? `<image href="${img}" x="20" y="10" width="160" height="186" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect x="0" y="0" width="200" height="200" fill="#ff8a3d"/><path d="M20 100 q20 -20 40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="10" fill="none" opacity=".85"/><circle cx="66" cy="140" r="9" fill="#ffd84d"/><circle cx="130" cy="60" r="8" fill="#ffd84d"/><circle cx="140" cy="150" r="7" fill="#fff"/>`;
    return svg(`<defs><clipPath id="${id}c"><path d="${shape}"/></clipPath><clipPath id="${id}f"><rect x="0" y="${y.toFixed(1)}" width="200" height="200"/></clipPath>
      <filter id="${id}g"><feColorMatrix type="saturate" values="0"/></filter></defs>
      <g clip-path="url(#${id}c)"><rect width="200" height="200" fill="#efe7f6"/>${img ? `<g filter="url(#${id}g)" opacity=".35">${fill}</g>` : ''}<g clip-path="url(#${id}f)">${fill}</g>${lines}</g>
      <path d="${shape}" fill="none" stroke="#4a3550" stroke-width="6"/><ellipse cx="72" cy="58" rx="10" ry="20" fill="#fff" opacity=".6" transform="rotate(20 72 58)"/>`);
  };
  /* кораблик (для занятий 3+) и солнышко-звёздочка для похвалы */
  SA.starEl = (host) => { const s = SA.el('div', 'star', SA.pic('star')); host.appendChild(s); setTimeout(() => s.remove(), 1000); SA.A.sfx.sparkle(); };
})();
