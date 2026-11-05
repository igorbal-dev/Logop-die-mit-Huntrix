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
    /* ---------- уроки 2–5 ---------- */
    mama: () => svg(`<path d="M46 192 q6 -58 54 -62 q48 4 54 62 z" fill="#ff7aa8" ${S}/><path d="M50 96 q-10 70 18 84 h64 q28 -14 18 -84 z" fill="#8a4a2b" ${S}/>
      <circle cx="100" cy="88" r="40" fill="#ffe0c8" ${S}/><path d="M60 86 q2 -48 40 -48 q38 0 40 48 q-18 -26 -40 -28 q-22 2 -40 28 z" fill="#8a4a2b" ${S}/>
      ${eye(86, 90, 6)}${eye(114, 90, 6)}<path d="M88 108 q12 10 24 0" fill="#e8667f" ${S} stroke-width="3.5"/><circle cx="74" cy="104" r="6" fill="#ffb3b3" opacity=".8"/><circle cx="126" cy="104" r="6" fill="#ffb3b3" opacity=".8"/>`),
    papa: () => svg(`<path d="M42 192 q6 -58 58 -62 q52 4 58 62 z" fill="#5aa9ff" ${S}/><circle cx="100" cy="90" r="42" fill="#ffe0c8" ${S}/>
      <path d="M58 82 q0 -40 42 -42 q42 2 42 42 q-10 -18 -42 -20 q-32 2 -42 20 z" fill="#4a3550" ${S}/>${eye(84, 90, 6)}${eye(116, 90, 6)}
      <path d="M84 114 q16 -6 32 0" fill="none" ${S} stroke="#4a3550" stroke-width="7"/><path d="M88 120 q12 8 24 0" fill="none" ${S} stroke-width="3.5"/>`),
    maus: () => svg(`<circle cx="60" cy="78" r="26" fill="#c9c3cf" ${S}/><circle cx="140" cy="78" r="26" fill="#c9c3cf" ${S}/><circle cx="60" cy="78" r="13" fill="#ffb3c7"/><circle cx="140" cy="78" r="13" fill="#ffb3c7"/>
      <ellipse cx="100" cy="118" rx="52" ry="46" fill="#c9c3cf" ${S}/>${eye(82, 108, 7)}${eye(118, 108, 7)}<circle cx="100" cy="132" r="8" fill="#ff7a9a" ${S} stroke-width="3"/>
      <path d="M74 136 h-30 M74 144 l-28 8 M126 136 h30 M126 144 l28 8" ${S} stroke-width="3"/>`),
    mond: () => svg(`<path d="M120 24 a76 76 0 1 0 50 132 a62 62 0 1 1 -50 -132 z" fill="#ffd84d" ${S}/><circle cx="92" cy="96" r="5" fill="#2a1f33"/><path d="M84 122 q10 8 20 0" fill="none" ${S} stroke-width="4"/>
      <g fill="#ffe98a"><circle cx="160" cy="44" r="5"/><circle cx="176" cy="90" r="4"/><circle cx="34" cy="40" r="4"/></g>`),
    banane: () => svg(`<path d="M30 70 q20 100 140 84 q14 -2 12 -12 q-96 4 -132 -78 q-8 -10 -20 6 z" fill="#ffd84d" ${S}/><path d="M24 60 l12 -14 l10 10 z" fill="#8a6a2b" ${S} stroke-width="4"/><path d="M52 92 q30 46 100 52" fill="none" stroke="#e8b02e" stroke-width="5" stroke-linecap="round"/>`),
    tuer: () => svg(`<rect x="52" y="18" width="96" height="168" rx="10" fill="#c9843e" ${S}/><rect x="66" y="34" width="68" height="56" rx="6" fill="#b06f30" ${S} stroke-width="4"/><rect x="66" y="104" width="68" height="66" rx="6" fill="#b06f30" ${S} stroke-width="4"/><circle cx="130" cy="100" r="7" fill="#ffd84d" ${S} stroke-width="3"/>`),
    teddy: () => svg(`<circle cx="62" cy="52" r="20" fill="#c9843e" ${S}/><circle cx="138" cy="52" r="20" fill="#c9843e" ${S}/><circle cx="100" cy="74" r="44" fill="#c9843e" ${S}/>
      <ellipse cx="100" cy="150" rx="46" ry="40" fill="#c9843e" ${S}/><ellipse cx="100" cy="154" rx="24" ry="22" fill="#f0c48a"/><ellipse cx="100" cy="88" rx="18" ry="14" fill="#f0c48a" ${S} stroke-width="3"/>
      ${eye(84, 66, 6)}${eye(116, 66, 6)}<ellipse cx="100" cy="82" rx="7" ry="5" fill="#2a1f33"/><path d="M100 88 v6" ${S} stroke-width="3"/>`),
    nase: () => svg(`<path d="M100 26 q-10 70 -42 104 q-12 20 10 30 q18 6 32 -6 q14 12 32 6 q22 -10 10 -30 q-32 -34 -42 -104 z" fill="#ffd2b3" ${S}/><ellipse cx="78" cy="146" rx="10" ry="7" fill="#c9846a"/><ellipse cx="122" cy="146" rx="10" ry="7" fill="#c9846a"/>`),
    nudel: () => svg(`<ellipse cx="100" cy="146" rx="80" ry="30" fill="#fff" ${S}/><path d="M34 140 q20 -40 40 -4 q20 -40 40 0 q20 -40 40 -4 q14 -30 28 4" fill="none" stroke="#ffd84d" stroke-width="12" stroke-linecap="round"/>
      <path d="M40 132 q30 -60 60 -10 q30 -60 56 -8" fill="none" stroke="#f2c14e" stroke-width="10" stroke-linecap="round"/><path d="M150 30 l-20 110" ${S} stroke-width="7"/><path d="M164 34 l-24 106" ${S} stroke-width="7"/>`),
    loeffel: () => svg(`<ellipse cx="100" cy="62" rx="38" ry="48" fill="#d8dde3" ${S}/><ellipse cx="92" cy="54" rx="12" ry="20" fill="#fff" opacity=".7"/><rect x="92" y="104" width="16" height="84" rx="8" fill="#d8dde3" ${S}/>`),
    lampe: () => svg(`<path d="M56 96 l20 -66 h48 l20 66 z" fill="#ffd84d" ${S}/><rect x="94" y="96" width="12" height="62" fill="#8a6a2b" ${S} stroke-width="4"/><ellipse cx="100" cy="172" rx="44" ry="14" fill="#8a6a2b" ${S}/><path d="M70 110 l-14 18 M100 112 v22 M130 110 l14 18" stroke="#ffe98a" stroke-width="6" stroke-linecap="round"/>`),
    keks: () => svg(`<circle cx="100" cy="100" r="68" fill="#d9a05b" ${S}/><g fill="#6b3a1e"><circle cx="76" cy="76" r="8"/><circle cx="120" cy="70" r="7"/><circle cx="130" cy="114" r="9"/><circle cx="86" cy="124" r="7"/><circle cx="104" cy="98" r="6"/></g>`),
    kuchen: () => svg(`<path d="M30 110 h140 v56 q0 10 -10 10 h-120 q-10 0 -10 -10 z" fill="#ffd6a8" ${S}/><path d="M30 110 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0 q12 18 24 0" fill="#fff" ${S} stroke-width="4"/>
      <path d="M26 96 h148 v16 h-148 z" fill="#ff9ec4" ${S} stroke-width="4"/><circle cx="100" cy="76" r="16" fill="#ff5a5a" ${S}/><path d="M100 60 q6 -12 14 -14" fill="none" ${S} stroke="#57a84a" stroke-width="4"/>`),
    gabel: () => svg(`<path d="M72 20 v60 q0 22 28 26 q28 -4 28 -26 v-60" fill="none" ${S} stroke="#a6adb6" stroke-width="10"/><path d="M90 20 v58 M110 20 v58" ${S} stroke="#a6adb6" stroke-width="8"/><rect x="92" y="104" width="16" height="84" rx="8" fill="#a6adb6" ${S}/>`),
    gurke: () => svg(`<path d="M40 150 q-10 -30 30 -70 q50 -50 90 -40 q20 10 0 50 q-40 70 -100 74 q-16 0 -20 -14 z" fill="#57c26a" ${S}/><g fill="#2e8a3e"><circle cx="80" cy="110" r="4"/><circle cx="110" cy="84" r="4"/><circle cx="130" cy="64" r="4"/><circle cx="96" cy="132" r="4"/></g>`),
    kopf: () => svg(`<circle cx="100" cy="100" r="62" fill="#ffe0c8" ${S}/><path d="M40 90 q0 -56 60 -56 q60 0 60 56 q-20 -30 -60 -32 q-40 2 -60 32 z" fill="#8a5a3b" ${S}/>${eye(80, 100, 8)}${eye(120, 100, 8)}<path d="M82 128 q18 14 36 0" fill="none" ${S}/>
      <ellipse cx="38" cy="104" rx="8" ry="14" fill="#ffe0c8" ${S} stroke-width="4"/><ellipse cx="162" cy="104" rx="8" ry="14" fill="#ffe0c8" ${S} stroke-width="4"/>`),
    topf: () => svg(`<path d="M40 82 h120 v74 q0 22 -22 22 h-76 q-22 0 -22 -22 z" fill="#5a6a7a" ${S}/><rect x="30" y="70" width="140" height="16" rx="6" fill="#7a8a9a" ${S}/><path d="M30 96 h-16 M170 96 h16" ${S} stroke-width="10"/>
      <path d="M80 58 q6 -14 0 -26 M100 58 q6 -14 0 -26 M120 58 q6 -14 0 -26" fill="none" stroke="#c9c3cf" stroke-width="5" stroke-linecap="round"/>`),
    kanne: () => svg(`<path d="M56 60 h80 l8 110 q0 10 -10 10 h-76 q-10 0 -10 -10 z" fill="#ff7a59" ${S}/><path d="M144 80 q36 4 30 40 q-4 20 -28 22" fill="none" ${S} stroke-width="8"/><path d="M56 74 q-36 -20 -40 -44" fill="none" ${S} stroke-width="10"/>
      <rect x="66" y="46" width="60" height="16" rx="6" fill="#ffb14d" ${S}/><circle cx="96" cy="120" r="12" fill="#fff" opacity=".6"/>`),
    tanne: () => svg(`<path d="M100 14 l46 56 h-22 l34 44 h-24 l34 46 h-136 l34 -46 h-24 l34 -44 h-22 z" fill="#2e9a4e" ${S}/><rect x="88" y="160" width="24" height="28" fill="#8a5a3b" ${S} stroke-width="4"/><circle cx="100" cy="16" r="8" fill="#ffd84d" ${S} stroke-width="3"/>`),
    tasche: () => svg(`<path d="M70 70 q0 -44 30 -44 q30 0 30 44" fill="none" ${S} stroke-width="10"/><path d="M36 70 h128 l-10 106 q-1 10 -11 10 h-86 q-10 0 -11 -10 z" fill="#b06cff" ${S}/><rect x="84" y="104" width="32" height="20" rx="5" fill="#ffd84d" ${S} stroke-width="4"/>`),
    tasse: () => svg(`<path d="M40 62 h104 v76 q0 34 -34 34 h-36 q-34 0 -34 -34 z" fill="#5aa9ff" ${S}/><path d="M144 82 q36 0 34 30 q-2 26 -34 26" fill="none" ${S} stroke-width="9"/><ellipse cx="92" cy="62" rx="52" ry="10" fill="#8a5a3b" ${S} stroke-width="4"/>
      <path d="M76 44 q6 -12 0 -24 M104 44 q6 -12 0 -24" fill="none" stroke="#c9c3cf" stroke-width="5" stroke-linecap="round"/><ellipse cx="100" cy="186" rx="70" ry="8" fill="#e0c9ee"/>`),
    schlange: () => svg(`<path d="M30 150 q30 -40 60 0 q30 40 60 0 q20 -26 22 -60" fill="none" stroke="#4a3550" stroke-width="30" stroke-linecap="round"/><path d="M30 150 q30 -40 60 0 q30 40 60 0 q20 -26 22 -60" fill="none" stroke="#57c26a" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="172" cy="78" rx="20" ry="16" fill="#57c26a" ${S}/>${eye(176, 72, 5)}<path d="M190 84 l12 4 l-8 4 M202 88 l6 -4" fill="none" stroke="#ff5a5a" stroke-width="3" stroke-linecap="round"/>`),
    zug: () => svg(`<rect x="70" y="60" width="100" height="80" rx="8" fill="#ff5a5a" ${S}/><rect x="20" y="90" width="56" height="50" rx="6" fill="#ff5a5a" ${S}/><rect x="86" y="74" width="34" height="30" rx="5" fill="#bfe6ff" ${S} stroke-width="4"/><rect x="128" y="74" width="30" height="30" rx="5" fill="#bfe6ff" ${S} stroke-width="4"/>
      <rect x="30" y="58" width="20" height="34" fill="#4a3550" ${S} stroke-width="4"/><circle cx="50" cy="152" r="16" fill="#3b3344" ${S}/><circle cx="100" cy="152" r="16" fill="#3b3344" ${S}/><circle cx="148" cy="152" r="16" fill="#3b3344" ${S}/>
      <g fill="#dcdce6"><circle cx="40" cy="40" r="10"/><circle cx="56" cy="24" r="8"/><circle cx="74" cy="14" r="6"/></g>`),
    fisch: () => svg(`<path d="M30 100 q50 -60 110 0 q-60 60 -110 0 z" fill="#ff9a4d" ${S}/><path d="M138 100 l40 -30 v60 z" fill="#ff9a4d" ${S}/>${eye(62, 94, 7)}<path d="M84 76 q10 24 0 48 M104 76 q10 24 0 48" fill="none" stroke="#e8752e" stroke-width="4"/>`),
    tisch: () => svg(`<rect x="20" y="70" width="160" height="22" rx="6" fill="#c9843e" ${S}/><path d="M40 92 v84 M160 92 v84" ${S} stroke="#a8622a" stroke-width="14"/><path d="M40 92 v84 M160 92 v84" fill="none" ${S}/>`),
    tomate: () => svg(`<circle cx="100" cy="110" r="64" fill="#ff5a5a" ${S}/><path d="M76 52 q24 14 48 0 q-6 12 -24 18 q-18 -6 -24 -18 z" fill="#57a84a" ${S} stroke-width="4"/><ellipse cx="76" cy="92" rx="10" ry="16" fill="#fff" opacity=".5"/>`),
    trommel: () => svg(`<ellipse cx="100" cy="72" rx="70" ry="22" fill="#fff4e4" ${S}/><path d="M30 72 v70 q0 22 70 22 q70 0 70 -22 v-70" fill="#ff5a5a" ${S}/><path d="M30 80 l30 70 l40 -70 l40 70 l30 -70" fill="none" stroke="#ffd84d" stroke-width="5"/>
      <path d="M150 20 l-40 46 M170 30 l-46 40" ${S} stroke="#8a5a3b" stroke-width="7"/><circle cx="150" cy="20" r="7" fill="#fff" ${S} stroke-width="3"/><circle cx="170" cy="30" r="7" fill="#fff" ${S} stroke-width="3"/>`),
    hand: () => svg(`<path d="M70 180 q-30 -40 -40 -90 q-2 -14 12 -14 q10 0 14 12 l10 30 v-80 q0 -14 12 -14 q12 0 12 14 v70 v-86 q0 -14 12 -14 q12 0 12 14 v86 v-74 q0 -14 12 -14 q12 0 12 14 v84 v-54 q0 -12 12 -12 q12 0 12 12 v76 q0 40 -30 60 z" fill="#ffe0c8" ${S}/>`),
    rakete: (f = 0) => svg(`<defs><clipPath id="rk"><path d="M100 16 q46 40 40 110 h-80 q-6 -70 40 -110 z"/></clipPath></defs><path d="M100 16 q46 40 40 110 h-80 q-6 -70 40 -110 z" fill="#efe7f6" ${S}/>
      <rect x="40" y="${(126 - 110*f).toFixed(1)}" width="120" height="${(110*f).toFixed(1)}" fill="#ff9a4d" clip-path="url(#rk)"/><path d="M100 16 q46 40 40 110 h-80 q-6 -70 40 -110 z" fill="none" ${S}/>
      <circle cx="100" cy="70" r="16" fill="#bfe6ff" ${S}/><path d="M60 100 l-26 40 h28 z M140 100 l26 40 h-28 z" fill="#ff5a5a" ${S}/><path d="M80 126 h40 l-6 18 h-28 z" fill="#5a6a7a" ${S} stroke-width="4"/>`),
    flamme: () => svg(`<path d="M100 20 q40 50 20 100 q-20 40 -20 60 q0 -20 -20 -60 q-20 -50 20 -100 z" fill="#ffb020" stroke="#ff7a00" stroke-width="4"/><path d="M100 70 q16 30 6 60 q-6 16 -6 30 q0 -14 -6 -30 q-10 -30 6 -60 z" fill="#fff36b"/>`),
    schiff: () => svg(`<path d="M30 120 h140 l-24 40 h-92 z" fill="#ff7a59" ${S}/><path d="M98 120 v-96" ${S}/><path d="M102 30 l52 76 h-52 z" fill="#fff" ${S}/><path d="M96 40 l-40 66 h40 z" fill="#ffd84d" ${S}/>`),
    insel: () => svg(`<ellipse cx="100" cy="160" rx="80" ry="24" fill="#f2d08a" ${S}/><path d="M104 150 q-6 -60 6 -110" fill="none" ${S} stroke="#8a5a3b" stroke-width="9"/><path d="M110 44 q-40 -10 -60 16 q30 -6 60 -10 q30 -20 60 -6 q-26 -16 -60 0 z" fill="#57c26a" ${S} stroke-width="4"/>`),
    baer: () => svg(`<circle cx="58" cy="54" r="22" fill="#8a5a3b" ${S}/><circle cx="142" cy="54" r="22" fill="#8a5a3b" ${S}/><circle cx="100" cy="104" r="64" fill="#8a5a3b" ${S}/><ellipse cx="100" cy="126" rx="30" ry="24" fill="#d9a05b" ${S} stroke-width="4"/>
      ${eye(78, 92, 7)}${eye(122, 92, 7)}<ellipse cx="100" cy="114" rx="10" ry="7" fill="#2a1f33"/><path d="M90 134 h20" ${S} stroke-width="4"/>`),
    specht: () => svg(`<rect x="146" y="10" width="34" height="186" fill="#a8774b" ${S}/><ellipse cx="96" cy="110" rx="40" ry="50" fill="#2a2a3a" ${S}/><circle cx="104" cy="62" r="28" fill="#fff" ${S}/><path d="M90 40 q14 -14 30 0 z" fill="#ff3b3b" ${S} stroke-width="3"/>
      ${eye(112, 60, 6)}<path d="M128 62 l20 4 l-20 6 z" fill="#ffb020" ${S} stroke-width="3"/><path d="M80 110 q10 20 30 24" fill="none" stroke="#fff" stroke-width="5"/>`),
    ohr: () => svg(`<path d="M60 90 q0 -60 56 -60 q50 0 50 56 q0 30 -26 46 q-16 10 -18 34 q-4 30 -34 30 q-24 0 -28 -24" fill="#ffd2b3" ${S}/><path d="M92 90 q0 -26 26 -26 q22 0 22 22 q0 16 -18 22" fill="none" ${S}/>`),
    mund: () => svg(`<path d="M30 100 q70 -50 140 0 q-70 70 -140 0 z" fill="#e8667f" ${S}/><path d="M42 100 q58 -26 116 0 q-58 40 -116 0 z" fill="#6b2440"/><path d="M50 98 q50 -14 100 0 v6 q-50 -10 -100 0 z" fill="#fff"/>`),
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
  /* Схемы артикуляционной гимнастики (как карточки у логопеда): спереди — язык снаружи; сбоку (разрез) — язык во рту.
     Сбоку: лицо смотрит влево, верхние зубы и нёбо сверху, нижние зубы и дно рта снизу. */
  SA.tonguePic = kind => {
    const T = '#ff7a9a', TS = 'stroke="#d94f73" stroke-width="4" stroke-linejoin="round"', A = 'stroke="#4a3550" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"';
    /* движение на схеме (SMIL): тот же темп, что у кадров Rumi (700 мс на кадр); SA.syncHint перезапускает с начала */
    const move = (vals, ms) => `<animateTransform attributeName="transform" type="translate" values="${vals}" dur="${ms}ms" repeatCount="indefinite" calcMode="spline" keySplines="${vals.split(';').slice(1).map(() => '.45 0 .55 1').join(';')}"/>`;
    const blink = (vals, ms) => `<animate attributeName="opacity" values="${vals}" dur="${ms}ms" repeatCount="indefinite"/>`;
    const arrow = (d, end) => `<path d="${d}" ${A}/><path d="${end}" ${A}/>`;
    const front = (open, body) => `<ellipse cx="100" cy="100" rx="88" ry="88" fill="#ffe0c8"/>
      <path d="M40 ${100 - open} q60 -26 120 0 q-4 ${open*2 + 30} -60 ${open*2 + 34} q-56 -4 -60 -${open*2 + 34} z" fill="#6b2440" stroke="#e8667f" stroke-width="8" stroke-linejoin="round"/>
      <path d="M50 ${98 - open} q50 -18 100 0 v10 q-50 -14 -100 0 z" fill="#fff"/>${body}`;
    const side = (jaw, tongue, extra = '') => `<rect width="200" height="200" rx="40" fill="#ffe0c8"/>
      <path d="M58 84 Q105 34 178 76 L178 46 L40 46 L40 78 Z" fill="#f2c4aa"/><path d="M58 84 Q105 34 178 76" ${A}/>
      <path d="M30 70 q14 4 22 12" ${A}/><rect x="50" y="80" width="12" height="20" rx="4" fill="#fff" stroke="#4a3550" stroke-width="3"/>
      <g transform="translate(0 ${jaw})"><path d="M30 144 q14 -4 22 -12" ${A}/><rect x="52" y="114" width="12" height="20" rx="4" fill="#fff" stroke="#4a3550" stroke-width="3"/>
      <path d="M64 136 Q120 168 178 128" ${A}/></g>${tongue}${extra}`;
    const P = {
      /* лопатка: широкий спокойный язык лежит на нижней губе */
      pfannkuchen: front(14, `<path d="M48 112 q52 -10 104 0 q10 54 -52 60 q-62 -6 -52 -60 z" fill="${T}" ${TS}/><path d="M100 118 v36" stroke="#d94f73" stroke-width="3"/>`),
      /* иголочка: узкий острый язык вперёд */
      nadel: front(10, `<path d="M86 106 q14 -4 28 0 q-2 40 -14 66 q-12 -26 -14 -66 z" fill="${T}" ${TS}/>`),
      /* чашечка: широкий язык снаружи, края и кончик подняты */
      tasse: front(16, `<path d="M48 100 q8 40 52 40 q44 0 52 -40 q10 66 -52 72 q-62 -6 -52 -72 z" fill="${T}" ${TS}/><ellipse cx="100" cy="132" rx="36" ry="15" fill="#c93a62"/><path d="M62 124 q38 24 76 0" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`),
      /* заборчик: улыбка, зубы сомкнуты и видны */
      zaun: `<ellipse cx="100" cy="100" rx="88" ry="88" fill="#ffe0c8"/><path d="M30 92 q70 18 140 0 q-14 44 -70 44 q-56 0 -70 -44 z" fill="#6b2440" stroke="#e8667f" stroke-width="8" stroke-linejoin="round"/>
        <path d="M40 96 q60 14 120 0 v16 q-60 14 -120 0 z" fill="#fff"/><path d="M42 112 q58 12 116 0 v14 q-58 12 -116 0 z" fill="#fff"/><path d="M42 112 q58 12 116 0" stroke="#bbb" stroke-width="2" fill="none"/>
        ${[60, 80, 100, 120, 140].map(x => `<path d="M${x} 98 v26" stroke="#ddd" stroke-width="2"/>`).join('')}`,
      /* горка: рот открыт, кончик упирается в нижние зубы, спинка выгнута */
      berg: side(14, `<path d="M66 140 Q70 126 92 108 Q118 82 142 92 Q166 104 176 140 Q120 158 66 140 z" fill="${T}" ${TS}/>`, arrow('M118 120 v-26', 'M110 102 l8 -10 l8 10')),
      /* грибок: язык присосан к нёбу, рот открыт */
      pilz: side(26, `<path d="M64 88 Q105 48 176 80 L176 104 Q122 96 70 104 Q60 98 64 88 z" fill="${T}" ${TS}/><path d="M80 104 v40 M150 100 v46" stroke="#d94f73" stroke-width="4" stroke-dasharray="4 5"/>`),
      /* качели: кончик вверх к верхним зубам — вниз к нижним */
      schaukel: side(22, `<path d="M64 130 Q80 120 108 120 Q150 118 176 140 Q120 166 70 150 z" fill="${T}" ${TS}>${blink('0;1;0', 1400)}</path><path d="M62 98 Q78 110 104 122 Q150 116 176 140 Q120 160 72 136 Q58 116 62 98 z" fill="${T}" ${TS}>${blink('1;0;1', 1400)}</path>`,
        arrow('M40 104 v34', 'M32 112 l8 -10 l8 10 M32 130 l8 10 l8 -10')),
      /* маляр: кончик гладит нёбо от зубов назад */
      maler: side(22, `<g><path d="M66 86 Q86 76 108 88 Q150 112 176 140 Q120 160 72 140 Q58 110 66 86 z" fill="${T}" ${TS}/>${move('0 0;34 -6;0 0', 1400)}</g>`, arrow('M80 64 Q110 48 150 60', 'M140 52 l12 8 l-12 8')),
      /* чистим зубки: кончик за верхними зубами, влево-вправо */
      zaehne: front(24, `<g><path d="M70 112 q30 -30 60 0 q4 28 -30 30 q-34 -2 -30 -30 z" fill="${T}" ${TS}/>${move('0 0;-26 0;0 0;26 0;0 0', 2800)}</g>`) + arrow('M60 72 h80', 'M70 64 l-10 8 l10 8 M130 64 l10 8 l-10 8'),
      /* часики: узкий язык вправо-влево из уголка в уголок (слева → середина → справа → середина) */
      uhr: front(10, `<g><path d="M90 100 q10 -4 20 0 q6 44 -10 66 q-16 -22 -10 -66 z" fill="${T}" ${TS}><animateTransform attributeName="transform" type="rotate" values="72 100 100;0 100 100;-72 100 100;0 100 100;72 100 100" dur="2800ms" repeatCount="indefinite"/></path></g>`),
      /* вкусное варенье: широкий язык облизывает верхнюю губу слева направо и обратно */
      marmelade: front(14, `<circle cx="62" cy="76" r="6" fill="#c9462b"/><circle cx="100" cy="66" r="6" fill="#c9462b"/><circle cx="138" cy="76" r="6" fill="#c9462b"/>
        <g><path d="M76 104 q-6 -48 24 -54 q30 6 24 54 z" fill="${T}" ${TS}/>${move('-34 8;0 0;34 8;0 0;-34 8', 2800)}</g>`),
      /* лошадка: язык присасывается и щёлкает */
      klick: side(18, `<path d="M64 90 Q105 50 176 82 L176 110 Q122 100 70 108 Q60 100 64 90 z" fill="${T}" ${TS}/>`, `<g fill="#ffd84d" stroke="#4a3550" stroke-width="3"><path d="M150 150 l8 -14 l6 14 l14 -6 l-8 14 l14 6 l-16 4 l4 14 l-12 -10 l-10 10 l2 -14 l-14 -2 l14 -8 z"/></g>`),
      /* футбол: широкий язык на нижней губе, воздух по середине */
      fussball: front(14, `<path d="M48 112 q52 -10 104 0 q10 54 -52 60 q-62 -6 -52 -60 z" fill="${T}" ${TS}/><circle cx="100" cy="186" r="10" fill="#fff" stroke="#4a3550" stroke-width="3"/>`) + arrow('M100 118 v44', 'M92 154 l8 10 l8 -10')
    };
    return svg(P[kind] || '');
  };
  /* перезапустить движение схемы с начала (чтобы шло в такт с кадрами Rumi) */
  SA.syncHint = el => { const v = el && el.querySelector('svg'); try { if (v && v.setCurrentTime) v.setCurrentTime(0); } catch(e){} };
})();
