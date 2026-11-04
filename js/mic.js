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
      buf = new Float32Array(an.fftSize); M.ok = true; requestAnimationFrame(monitor);
      return true;
    } catch(e){ M.ok = false; return false; }
  };
  function rms(){ an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x*x; return Math.sqrt(s/buf.length); }
  function monitor(now){
    requestAnimationFrame(monitor);
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

  /* Выдох: следим за звуком ms миллисекунд. onTick(active, level) каждый кадр; вернёт {blowMs, puffs}.
     puffs — отдельные «пф» (звук после паузы ≥ 0,25 с). until(stats) — закончить раньше, если вернёт true. */
  M.blow = async ({ms = 6000, onTick, until} = {}) => {
    const st = {blowMs: 0, puffs: 0, any: false};
    if (SA.AUTO){
      const t0 = SA.now(); let k = 0;
      while (SA.now() - t0 < Math.min(ms, 3000)/SA.SPEED){ await SA.sleep(60); k++; const a = (k % 8) < 5; if (a){ st.blowMs += 60; st.any = true; } if (k % 8 === 0) st.puffs++; onTick && onTick(a, a ? 2 : 0, st); if (until && until(st)) break; }
      return st;
    }
    showRing(true);
    const t0 = SA.now(); let last = SA.now(), was = false, quietFrom = SA.now();
    try {
      while (SA.now() - t0 < ms){
        await SA.sleep(30);
        const now = SA.now(), dt = Math.min(100, now - last); last = now;
        const a = M.ok ? (V.active && V.run > 60) : false;
        if (a){ st.blowMs += dt; st.any = true; if (!was && now - quietFrom > 250) st.puffs++; }
        else if (was) quietFrom = now;
        was = a;
        const l = lvl(); l.style.opacity = Math.min(1, V.level*0.8); l.style.transform = `scale(${0.95 + Math.min(0.5, V.level*0.12)})`;
        onTick && onTick(a, V.level, st);
        if (until && until(st)) break;
      }
    } finally { showRing(false); }
    return st;
  };
})();
