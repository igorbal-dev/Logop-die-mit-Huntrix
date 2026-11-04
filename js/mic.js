/* Микрофон. Логика «Эмили что-то сказала» перенесена из игры (js/common.js) без изменений порогов:
   тишина в комнате подстраивается сама, пока говорит учительница — не слушаем, ответ засчитывается, когда Эмили договорила.
   Добавлено: выдох (дуть) — тот же детектор громкости, но считаем, сколько длится звук и сколько было отдельных «пф»;
   запись попытки для «послушай себя» (только в памяти, до конца занятия). Распознавания речи нет. */
(function(){
  const M = SA.M = {ok: false, stream: null};
  const V = M.V = {floor: 0.008, run: 0, quietSince: 0, uttStart: -1e9, voicedAt: -1e9, usedAt: -1e9, level: 0, busyUntil: 0, last: 0, active: false, runStart: 0};
  const HEARD_MS = 160, EARLY_MS = 1800;
  let an = null, buf = null;

  M.setup = async () => {
    if (M.ok) return true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !SA.A.ctx) return false;
      M.stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}});
      const src = SA.A.ctx.createMediaStreamSource(M.stream); an = SA.A.ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
      buf = new Float32Array(an.fftSize); M.ok = true; if (!M.loop){ M.loop = true; requestAnimationFrame(monitor); }
      return true;
    } catch(e){ M.ok = false; return false; }
  };
  function rms(){ an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x*x; return Math.sqrt(s/buf.length); }
  function monitor(now){
    requestAnimationFrame(monitor);
    if (!M.ok) return;
    const dt = Math.min(100, now - (V.last || now)); V.last = now;
    const r = rms();
    if (SA.A.speaking > 0) V.busyUntil = now + 220;          /* игра не «слышит» сама себя */
    const busy = now < V.busyUntil;
    if (!busy){
      if (r < V.floor) V.floor += (r - V.floor)*0.08; else V.floor += (r - V.floor)*0.0015;
      V.floor = Math.min(0.05, Math.max(0.002, V.floor));
    }
    const thr = Math.max(0.011, V.floor*2.2 + 0.004);
    V.level = r/thr;
    V.active = !busy && r > thr;
    if (V.active){
      if (V.run === 0 && now - V.quietSince > 0) V.runStart = now;
      V.run += dt;
      if (V.run >= HEARD_MS){ if (V.runStart > V.voicedAt + 250) V.uttStart = V.runStart; V.voicedAt = now; }
    } else {
      if (V.run > 0) V.quietSince = now;
      V.run = Math.max(0, V.run - dt*2);
      if (busy) V.voicedAt = Math.min(V.voicedAt, now - 300);
    }
  }

  /* значок микрофона над учительницей: горит, пока слушаем; кольцо — громкость */
  const ring = () => SA.$('#micring'), lvl = () => SA.$('#miclevel');
  function showRing(on){ const r = ring(); r.hidden = !on; r.classList.remove('heard'); }
  function heard(){ const r = ring(); r.classList.add('heard'); V.busyUntil = SA.now() + 500; SA.A.sfx.ding(); setTimeout(() => { r.hidden = true; r.classList.remove('heard'); }, 600); }

  /* запись попытки */
  let rec = null, chunks = [];
  function recStart(){
    if (!M.stream || !window.MediaRecorder) return;
    try { chunks = []; rec = new MediaRecorder(M.stream); rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data); rec.start(); } catch(e){ rec = null; }
  }
  function recStop(keep){
    return new Promise(res => {
      if (!rec) return res(null);
      const r = rec; rec = null;
      r.onstop = () => { res(keep && chunks.length ? URL.createObjectURL(new Blob(chunks, {type: r.mimeType || 'audio/webm'})) : null); };
      try { r.stop(); } catch(e){ res(null); }
    });
  }
  M.recordings = [];                          /* ссылки на записи этого занятия — стираются в конце */
  M.clearRecordings = () => { M.recordings.forEach(u => URL.revokeObjectURL(u)); M.recordings = []; };

  /* Ждём, пока Эмили скажет (любой звук голоса). words — сколько слов в образце (чем больше, тем дольше ждём).
     Вернёт {ok, url} — url: запись попытки, если record. */
  M.listen = async ({words = 1, noVoiceMs = 7000, record = false} = {}) => {
    if (SA.AUTO){ await SA.sleep(700); return {ok: true, url: null}; }
    if (!M.ok){ await SA.sleep(2500); return {ok: false, url: null, nomic: true}; }
    const SILENCE_MS = 1000, MIN_WAIT = Math.max(1200, words*650), CAP = 10000;
    showRing(true); if (record) recStart();
    const t0 = SA.now();
    let ok = false;
    try {
      while (true){
        await SA.sleep(40);
        const now = SA.now(), l = lvl(); l.style.opacity = Math.min(1, V.level*0.8); l.style.transform = `scale(${0.95 + Math.min(0.5, V.level*0.12)})`;
        const spoke = V.uttStart > V.usedAt && V.voicedAt > t0 - EARLY_MS;
        if (spoke && now - t0 >= MIN_WAIT && now - V.voicedAt >= SILENCE_MS && V.run === 0){ ok = true; break; }
        if (spoke && now - t0 > CAP){ ok = true; break; }
        if (!spoke && now - t0 > noVoiceMs) break;
      }
    } catch(e){ showRing(false); await recStop(false); throw e; }
    let url = null;
    if (ok){ V.usedAt = SA.now(); heard(); url = await recStop(record); if (url) M.recordings.push(url); }
    else { showRing(false); await recStop(false); }
    return {ok, url};
  };

  /* ---------- выдох: отдельный микрофон БЕЗ шумоподавления + js/breath.js (выдох = шум без тона) ---------- */
  let raw = null;            /* {stream, an, buf, det} — открывается на время дыхательных заданий */
  M.breathOpen = async () => {
    if (raw) return true;
    /* iPhone: два микрофона сразу нельзя — основной (с шумоподавлением, для голоса) на время дыхания закрываем */
    if (M.stream){ M.stream.getTracks().forEach(t => t.stop()); M.stream = null; M.ok = false; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}});
      const src = SA.A.ctx.createMediaStreamSource(s), an = SA.A.ctx.createAnalyser(); an.fftSize = SA.Breath.N; src.connect(an);
      const sens = +((SA.P && SA.P.settings().breathSens) ?? 1);
      raw = {stream: s, an, buf: new Float32Array(an.fftSize), det: new SA.Breath.Blow(SA.A.ctx.sampleRate, sens), last: SA.now()};
      return true;
    } catch(e){ raw = null; return false; }
  };
  M.breathClose = async () => { if (raw){ raw.stream.getTracks().forEach(t => t.stop()); raw = null; } if (!M.ok && !SA.AUTO) await M.setup(); };
  /* один кадр: {air, voice, db} */
  M.breathFrame = () => {
    if (!raw) return {air: false, voice: false, db: -99};
    const now = SA.now(), dt = Math.min(100, now - raw.last); raw.last = now;
    raw.an.getFloatTimeDomainData(raw.buf);
    if (SA.A.speaking > 0){ raw.det.run = 0; return {air: false, voice: false, loud: false, db: -99}; }      /* учительница говорит — не слушаем */
    const r = raw.det.frame(raw.buf, dt);
    return {air: r.air, voice: r.voice, loud: r.loud, db: r.f.db};
  };

  /* Выдох: следим ms миллисекунд. onTick(air, st) каждый кадр; вернёт {blowMs, puffs, any, voiceMs}.
     puffs — отдельные «пф» (выдох после паузы ≥ 0,25 с). until(st) — закончить раньше. */
  M.blow = async ({ms = 6000, onTick, until} = {}) => {
    const st = {blowMs: 0, puffs: 0, any: false, voiceMs: 0, loudMs: 0};
    if (SA.AUTO){
      const t0 = SA.now(); let k = 0;
      while (SA.now() - t0 < Math.min(ms, 3000)/SA.SPEED){ await SA.sleep(60); k++; const a = (k % 8) < 5; if (a){ st.blowMs += 60; st.loudMs += 300; st.any = true; } if (k % 8 === 0) st.puffs++; onTick && onTick(a, st); if (until && until(st)) break; }
      return st;
    }
    const okRaw = M.rawOk = await M.breathOpen();
    showRing(true);
    const t0 = SA.now(); let last = SA.now(), was = false, quietFrom = SA.now();
    try {
      while (SA.now() - t0 < ms){
        await SA.sleep(30);
        const now = SA.now(), dt = Math.min(100, now - last); last = now;
        const f = okRaw ? M.breathFrame() : {air: false, voice: false, db: -99};
        const a = f.air;
        if (f.voice) st.voiceMs += dt;
        if (f.loud) st.loudMs += dt;
        if (a){ st.blowMs += dt; st.any = true; if (!was && now - quietFrom > 250) st.puffs++; }
        else if (was) quietFrom = now;
        was = a;
        const l = lvl(); l.style.opacity = a ? 1 : 0.15; l.style.transform = `scale(${a ? 1.25 : 0.95})`;
        onTick && onTick(a, st);
        if (until && until(st)) break;
      }
    } finally { showRing(false); }
    return st;
  };
})();
