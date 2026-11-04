/* Звук. Перенесено из игры Эмили (js/mini.js: play, sayTTS, sfx) и дополнено:
   - реплики: content/<язык>/lines.json, записи assets/snd/<ключ>.mp3 (одна реплика — один файл, везде одна и та же);
   - нет записи — реплику говорит голос браузера (временно), как в игре;
   - во время реплики известна громкость (SA.A.level) — по ней учительница открывает рот;
   - реплики идут строго по очереди; пока говорит учительница, микрофон не слушает (SA.A.speaking). */
(function(){
  const A = SA.A = {ctx: null, BUF: {}, LINES: {}, speaking: 0, level: 0, onSpeak: null, lang: 'de'};
  let chain = Promise.resolve(), curStop = null, gen = 0;
  /* ребёнок уже ответил — учительница замолкает: обрывается текущая реплика и всё, что стояло в очереди */
  A.cut = () => { gen++; if (curStop) curStop(); try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch(e){} };

  A.unlock = () => {
    /* iPhone: звук и речь включаются только из нажатия */
    try {
      A.ctx = A.ctx || new (window.AudioContext || window.webkitAudioContext)();
      A.ctx.resume();
      const s = A.ctx.createBufferSource(); s.buffer = A.ctx.createBuffer(1, 1, 22050); s.connect(A.ctx.destination); s.start();
      A.out = A.ctx.createGain(); A.an = A.ctx.createAnalyser(); A.an.fftSize = 512; A.out.connect(A.an); A.out.connect(A.ctx.destination);
      A.abuf = new Float32Array(A.an.fftSize);
    } catch(e){ A.ctx = null; }
    if ('speechSynthesis' in window) try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'de-DE'; speechSynthesis.speak(u); } catch(e){}
  };
  const decode = ab => new Promise((res, rej) => { const p = A.ctx.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); });

  A.loadLines = async (lang) => {
    A.lang = lang;
    const j = await SA.fetchJSON(`content/${lang}/lines.json`);
    Object.assign(A.LINES, j.lines);
  };
  /* записи грузим все сразу (≈140 коротких mp3); каких нет — скажет голос браузера */
  A.loadSounds = async (keys) => {
    if (!A.ctx) return;
    await Promise.all(keys.map(async k => {
      if (A.BUF[k]) return;
      try { const r = await fetch(SA.ver(`assets/snd/${k}.mp3`)); if (!r.ok) return; A.BUF[k] = await decode(await r.arrayBuffer()); } catch(e){}
    }));
  };
  A.has = k => !!A.BUF[k];

  /* голос браузера: немецкий — Anna (iOS) / Google Deutsch (Android); русский — Milena / Google */
  function voiceFor(lang){
    let vs = []; try { vs = speechSynthesis.getVoices() || []; } catch(e){}
    vs = vs.filter(v => new RegExp('^' + lang + '([-_]|$)', 'i').test(v.lang || ''));
    return lang === 'de' ? (vs.find(v => /^anna\b/i.test(v.name)) || vs.find(v => /google deutsch/i.test(v.name)) || vs[0] || null)
      : (vs.find(v => /^milena\b/i.test(v.name)) || vs.find(v => /google/i.test(v.name)) || vs[0] || null);
  }
  if ('speechSynthesis' in window) try { speechSynthesis.getVoices(); } catch(e){}
  let keepU = null;
  function tts(line){
    const PITCH = {1: 1.15, 2: 0.95, 3: 1.05};
    return new Promise(res => {
      const text = line.text;
      if (!('speechSynthesis' in window)) return setTimeout(res, 400 + text.length*50);
      const u = keepU = new SpeechSynthesisUtterance(text), v = voiceFor(line.lang);
      u.lang = line.lang === 'ru' ? 'ru-RU' : 'de-DE'; if (v) u.voice = v; u.rate = 0.9; u.pitch = PITCH[line.t] || 1;
      let done = false; const fin = () => { if (!done){ done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 2500 + text.length*110);
      try { speechSynthesis.resume(); } catch(e){}
      speechSynthesis.speak(u);
    });
  }
  /* громкость во время записи (для рта); у голоса браузера громкости нет — рот двигается сам */
  let fakeTalk = false;
  function meter(){
    requestAnimationFrame(meter);
    if (fakeTalk){ A.level = 0.25 + 0.25*Math.sin(SA.now()/70) + 0.1*Math.random(); return; }
    if (!A.an || !A.speaking){ A.level = 0; return; }
    A.an.getFloatTimeDomainData(A.abuf); let s = 0; for (const x of A.abuf) s += x*x;
    A.level = Math.min(1, Math.sqrt(s/A.abuf.length)*5);
  }
  requestAnimationFrame(meter);

  async function playNow(key, opt){
    const line = A.LINES[key];
    if (!line){ console.warn('нет реплики', key); return; }
    A.speaking++;
    if (A.onSpeak) A.onSpeak(line.t, true, key, opt);
    try {
      const b = A.BUF[key];
      if (b && A.ctx){
        if (A.ctx.state !== 'running') A.ctx.resume();
        await new Promise(resolve => {
          const s = A.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = opt.rate || 1; s.connect(A.out);
          let done = false; const fin = () => { if (!done){ done = true; if (curStop === stopIt) curStop = null; resolve(); } };
          const stopIt = () => { try { s.stop(); } catch(e){} fin(); }; curStop = stopIt;
          s.onended = fin; setTimeout(fin, b.duration*1000/(opt.rate || 1) + 400); s.start();
        });
      } else { fakeTalk = true; await tts(line); fakeTalk = false; }
    } finally {
      A.speaking--;
      if (A.onSpeak) A.onSpeak(line.t, false, key, opt);
      SA.lastSpokeAt = SA.now();
    }
  }
  /* реплика: ждёт свою очередь; прерывается кнопкой «закончить» (сама реплика договаривается) */
  A.say = (key, opt = {}) => {
    const g = gen;
    const p = chain.then(() => (SA.stopped && !opt.always) || g !== gen ? null : playNow(key, opt));
    chain = p.catch(() => {});
    return opt.always ? p : SA.guard(p);
  };
  /* одна из реплик набора, но не та, что звучала недавно (похвала, поддержка) */
  const recent = {};
  A.sayOne = (keys, opt) => {
    const name = keys.join(',');
    const last = recent[name] = recent[name] || [];
    let pool = keys.filter(k => !last.includes(k)); if (!pool.length) pool = keys;
    const k = SA.pick(pool); last.push(k); while (last.length > Math.min(3, keys.length - 1)) last.shift();
    return A.say(k, opt);
  };

  /* ---------- звуки интерфейса (как в игре) ---------- */
  A.sfx = {
    tone(f1, f2, ms, type = 'sine', vol = .18, at = 0){
      if (!A.ctx) return; const t = A.ctx.currentTime + at, o = A.ctx.createOscillator(), g = A.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + ms/1000);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + ms/1000);
      o.connect(g).connect(A.ctx.destination); o.start(t); o.stop(t + ms/1000 + .02);
    },
    noise(ms, freq, vol, at = 0){ if (!A.ctx) return; const n = Math.round(A.ctx.sampleRate*ms/1000), b = A.ctx.createBuffer(1, n, A.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/n, 2);
      const s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .9;
      g.gain.value = vol; s.connect(f).connect(g).connect(A.ctx.destination); s.start(A.ctx.currentTime + at); },
    pop(){ this.tone(500, 900, 120, 'triangle', .22); },
    ding(){ this.tone(880, 1320, 200, 'triangle', .2); this.tone(1320, 1760, 240, 'triangle', .16, .11); },
    soft(){ this.tone(660, 520, 220, 'sine', .12); },
    whoosh(){ this.noise(380, 1500, .28); },
    puff(){ this.noise(160, 700, .35); },
    sparkle(){ [1568, 1976, 2349, 2637].forEach((f, i) => this.tone(f, f*1.02, 160, 'sine', .08, i*.07)); },
    fanfare(){ [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 260, 'triangle', .18, i*.14)); }
  };

  /* ---------- музыка для танцпаузы: весёлый бит 118 уд/мин, синтез без файлов ---------- */
  A.music = (sec) => {
    if (!A.ctx) return {stop(){}};
    const c = A.ctx, master = c.createGain(); master.gain.value = .55; master.connect(c.destination);
    const bpm = 118, beat = 60/bpm, t0 = c.currentTime + .05, bars = Math.ceil(sec/(beat*4));
    const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];     /* Am F C G */
    const hz = m => 440*Math.pow(2, (m - 69)/12);
    const note = (f, t, d, type, v, dest = master) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(dest); o.start(t); o.stop(t + d + .05); };
    const kick = t => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g).connect(master); o.start(t); o.stop(t + .3); };
    const hat = (t, v) => { const n = Math.round(c.sampleRate*.05), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random()*2 - 1)*(1 - i/n); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = b; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = v; s.connect(f).connect(g).connect(master); s.start(t); };
    const mel = [69, 72, 76, 72, 74, 72, 69, 67];
    for (let bar = 0; bar < bars; bar++){
      const ch = chords[bar % 4], tb = t0 + bar*beat*4;
      for (let b = 0; b < 4; b++){
        const t = tb + b*beat; kick(t); hat(t + beat/2, .12); hat(t + beat*.75, .06);
        if (b % 2) note(1800, t, .08, 'square', .025);                        /* хлопок */
        note(hz(ch[0] - 12), t, beat*.9, 'triangle', .22);                       /* бас */
        ch.forEach(m => note(hz(m), t + beat/2, beat*.4, 'sawtooth', .025));     /* аккорд */
      }
      for (let i = 0; i < 8; i++) if (bar % 2 || i % 2 === 0) note(hz(mel[(i + bar*3) % 8]), tb + i*beat/2, beat*.45, 'square', .035);
    }
    const end = t0 + bars*beat*4;
    master.gain.setValueAtTime(.55, Math.min(end, t0 + sec) - .6); master.gain.linearRampToValueAtTime(0, Math.min(end, t0 + sec));
    return {stop(){ try { master.gain.cancelScheduledValues(c.currentTime); master.gain.setValueAtTime(0, c.currentTime); } catch(e){} }};
  };
})();
