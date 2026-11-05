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
  /* Щелчок языком («лошадка цокает»): очень короткий резкий звук (5–20 мс) в тишине — не голос, не выдох.
     В буфере ищем кусочек ≥ 18 дБ над фоном с резким началом, вокруг которого (±80 мс) почти нет звука.
     Вызовы перекрываются (браузер даёт последние N сэмплов), поэтому событие получает время, и повторы < 110 мс отбрасываются. */
  class Click {
    constructor(sr){ this.sr = sr; this.c = Math.max(32, Math.round(sr*0.0025)); this.env = []; this.pend = []; this.lastNow = null; this.done = 0; this.floor = 1e-7; this.fl = []; this.lastT = -1e9; }
    /* x — последние N сэмплов микрофона, nowMs — время конца буфера. Берём только новые сэмплы (по прошедшему времени) */
    frame(x, nowMs){
      const nNew = this.lastNow === null ? x.length : Math.max(0, Math.min(x.length, Math.round((nowMs - this.lastNow)*this.sr/1000)));
      this.lastNow = nowMs;
      for (let i = x.length - nNew; i < x.length; i++) this.pend.push(x[i]);
      const c = this.c, out = [];
      while (this.pend.length >= c){ let s = 0; for (let i = 0; i < c; i++) s += this.pend[i]*this.pend[i]; this.pend.splice(0, c); this.env.push(s/c); }
      /* время конца последнего полного кусочка */
      const tEnd = nowMs - this.pend.length/this.sr*1000, dtc = c/this.sr*1000, W = 30;
      const e = this.env;
      for (let k = Math.max(this.done, W); k < e.length - W; k++){
        this.done = k + 1;
        this.fl.push(e[k]); if (this.fl.length > 800) this.fl.shift();
        if (this.fl.length % 40 === 0){ const h = this.fl.slice().sort((a, b) => a - b); this.floor = Math.max(1e-9, h[Math.floor(h.length*0.2)]); }
        if (e[k] < this.floor*Math.pow(10, 1.8) || e[k] < 2e-6 || e[k] < e[k - 1] || e[k] < e[k + 1]) continue;
        if (e[k] < 8*e[k - 3]) continue;                                           /* резкое начало */
        let near = 0, wide = 0;
        for (let j = k - 2; j <= k + 6; j++) near += e[j];
        for (let j = k - W; j <= k + W; j++) wide += e[j];
        if (near < 0.75*wide) continue;                                            /* ±75 мс вокруг тихо — не слог, не выдох */
        const t = tEnd - (e.length - k)*dtc;
        if (t - this.lastT > 110){ this.lastT = t; out.push(t); }
      }
      if (e.length > 400){ const cut = e.length - 200; e.splice(0, cut); this.done = Math.max(0, this.done - cut); }
      return out;
    }
  }
  const api = {features, Blow, Click, N};
  if (typeof module !== 'undefined') module.exports = api; else root.SA.Breath = api;
})(typeof window !== 'undefined' ? window : globalThis);
