/* Распознавание выдоха (дуть на одуванчик, свечки). Работает и в браузере, и в Node (для проверки на записях).
   Почему не просто «громко»: голос тоже громкий. Выдох — это шум без высоты тона: поток воздуха даёт «ветер»
   в микрофоне (много энергии внизу, < 300 Гц) или ровное шипение («хххх»). Голос — периодический (есть основной тон).
   Поэтому кадр (≈43 мс) считается выдохом, только если он громче фона И в нём нет тона. Кадр с тоном (голос) сбрасывает выдох.
   Микрофон для дыхания открывается БЕЗ шумоподавления: шумоподавление браузера как раз вырезает выдох и оставляет голос. */
(function(root){
  const N = 2048;
  /* быстрое преобразование Фурье (на месте), re/im — Float64Array длины N */
  function fft(re, im){
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++){ let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j){ [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1){
      const ang = -2*Math.PI/len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len){ let cr = 1, ci = 0;
        for (let k = 0; k < len/2; k++){ const a = i + k, b = a + len/2, xr = re[b]*cr - im[b]*ci, xi = re[b]*ci + im[b]*cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi; const t = cr*wr - ci*wi; ci = cr*wi + ci*wr; cr = t; } }
    }
  }
  const win = new Float64Array(N).map((_, i) => 0.5 - 0.5*Math.cos(2*Math.PI*i/(N - 1)));
  const re = new Float64Array(N), im = new Float64Array(N), hp = new Float64Array(N);

  /* признаки одного кадра: уровень (дБ), доля низких частот, «ровность» спектра, периодичность (тон) */
  function features(x, sr){
    let s = 0; for (let i = 0; i < N; i++) s += x[i]*x[i];
    const db = 10*Math.log10(s/N + 1e-12);
    for (let i = 0; i < N; i++){ re[i] = x[i]*win[i]; im[i] = 0; }
    fft(re, im);
    const bin = sr/N; let low = 0, tot = 0, lg = 0, ar = 0, cnt = 0, hi = 0;
    for (let k = 1; k < N/2; k++){
      const f = k*bin, p = re[k]*re[k] + im[k]*im[k];
      if (f < 10000){ tot += p; if (f < 300) low += p; if (f > 3500) hi += p; }
      if (f >= 150 && f <= 6000){ lg += Math.log(p + 1e-20); ar += p; cnt++; }
    }
    const flat = cnt ? Math.exp(lg/cnt)/(ar/cnt + 1e-20) : 0;
    /* тон: автокорреляция после фильтра выше ~150 Гц (иначе низкий «ветер» выглядит периодическим) */
    const a = Math.exp(-2*Math.PI*150/sr); let y1 = 0, x1 = 0;
    for (let i = 0; i < N; i++){ const y = a*(y1 + x[i] - x1); x1 = x[i]; y1 = y; hp[i] = y; }
    let e0 = 0; for (let i = 0; i < N; i++) e0 += hp[i]*hp[i];
    let per = 0;
    if (e0 > 1e-9){
      const lmin = Math.floor(sr/700), lmax = Math.min(N/2, Math.ceil(sr/70));
      for (let L = lmin; L <= lmax; L++){ let c = 0, e1 = 0, e2 = 0;
        for (let i = 0; i + L < N; i++){ c += hp[i]*hp[i + L]; e1 += hp[i]*hp[i]; e2 += hp[i + L]*hp[i + L]; }
        const r = c/Math.sqrt(e1*e2 + 1e-20); if (r > per) per = r; }
    }
    return {db, low: tot ? low/tot : 0, hi: tot ? hi/tot : 0, flat, per};
  }

  /* детектор: кормим кадрами, он считает «чистый» выдох. sens: 0 — строже, 1 — обычно, 2 — чувствительнее */
  class Blow {
    constructor(sr, sens = 1){ this.sr = sr; this.hist = []; this.floor = -75; this.run = 0; this.sinceVoice = 1e9; this.sens = sens; this.last = null; }
    frame(x, dtMs){
      const f = this.last = features(x, this.sr);
      /* фон комнаты: 15-й перцентиль громкости за последние ~4 с — подстраивается всегда (раньше застревал, если в комнате шумно) */
      this.hist.push(f.db); if (this.hist.length > 130) this.hist.shift();
      if (this.hist.length >= 10){ const h = this.hist.slice().sort((a, b) => a - b); this.floor = h[Math.floor(h.length*0.15)]; }
      const margin = [14, 10, 7][this.sens] ?? 10;
      const loud = f.db > this.floor + margin && f.db > -72;
      /* голос — есть тон (периодичность). Только он и отбрасывается */
      const voice = loud && f.per > 0.6;
      /* выдох — громкий шум без тона. Чистое «ссс» (почти вся энергия выше 3,5 кГц) — не выдох.
         Раньше порог был 45 % и отсекал настоящий выдох прямо в микрофон — в нём тоже много высоких частот */
      const air = loud && f.per < 0.5 && f.hi < 0.75;
      if (voice){ this.run = 0; this.sinceVoice = 0; }
      else this.sinceVoice += dtMs;
      if (!voice && air && this.sinceVoice > 200) this.run += dtMs;
      else this.run = Math.max(0, this.run - dtMs*2);
      return {air: air && this.run >= 120, voice, loud, f, floor: this.floor};
    }
  }
  const api = {features, Blow, N};
  if (typeof module !== 'undefined') module.exports = api; else root.SA.Breath = api;
})(typeof window !== 'undefined' ? window : globalThis);
