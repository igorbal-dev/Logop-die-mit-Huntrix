/* Камера для «зеркала». Включается только в этом задании и выключается сразу после него (значок с красной точкой виден всё время).
   Лицо распознаёт Google MediaPipe прямо в браузере: файлы модели лежат на нашем сайте (vendor/mediapipe), видео никуда
   не отправляется и не записывается. Камера надёжно видит только улыбку, трубочку, открытый рот и (не всегда) надутые щёки —
   их засчитываем сами. Язык камера не видит: его засчитывает таймер («старалась») или кнопка родителя. */
(function(){
  const C = SA.C = {on: false, ready: false, video: null, stream: null, lm: null, scores: {}, face: false};
  let raf = 0, lastT = -1, base = null;

  C.start = async (host) => {
    C.video = SA.el('video'); C.video.setAttribute('playsinline', ''); C.video.muted = true; C.video.autoplay = true;
    host.appendChild(C.video);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('нет камеры');
      C.stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 480}}, audio: false});
      C.video.srcObject = C.stream; await C.video.play().catch(() => {});
      C.on = true; SA.$('#camdot').hidden = false;
    } catch(e){ C.video.remove(); C.video = null; C.on = false; return false; }
    /* распознавание лица — если не загрузилось, зеркало всё равно работает, засчитываем по таймеру */
    try {
      if (!C.lm){
        const vision = await import('../vendor/mediapipe/vision_bundle.mjs');
        const files = await vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href);
        const opts = d => ({baseOptions: {modelAssetPath: new URL('vendor/mediapipe/face_landmarker.task', location.href).href, delegate: d},
          runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true});
        try { C.lm = await vision.FaceLandmarker.createFromOptions(files, opts('GPU')); }
        catch(e){ C.lm = await vision.FaceLandmarker.createFromOptions(files, opts('CPU')); }
      }
      C.ready = true; base = null; loop();
    } catch(e){ console.warn('face', e); C.ready = false; }
    return true;
  };
  C.stop = () => {
    cancelAnimationFrame(raf); raf = 0;
    if (C.stream) C.stream.getTracks().forEach(t => t.stop());
    if (C.video) C.video.remove();
    C.stream = null; C.video = null; C.on = false; C.ready = false; C.face = false; C.scores = {};
    SA.$('#camdot').hidden = true;
  };
  function loop(){
    raf = requestAnimationFrame(loop);
    const v = C.video; if (!v || v.readyState < 2 || !C.lm) return;
    const t = performance.now(); if (t - lastT < 66) return; lastT = t;       /* ~15 кадров в секунду хватает */
    let r; try { r = C.lm.detectForVideo(v, t); } catch(e){ return; }
    const bs = r.faceBlendshapes && r.faceBlendshapes[0];
    C.face = !!bs;
    if (!bs) return;
    const s = {}; for (const c of bs.categories) s[c.categoryName] = c.score;
    /* ширина щёк относительно расстояния между глазами — для «хомяка» в дополнение к cheekPuff */
    const lm = r.faceLandmarks[0], d = (a, b) => Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y);
    s._cheek = d(234, 454)/d(33, 263);
    s._lipsClosed = d(13, 14)/d(33, 263) < 0.06;
    if (!base && s.jawOpen < 0.2 && (s.mouthSmileLeft + s.mouthSmileRight)/2 < 0.3) base = {cheek: s._cheek};
    C.scores = s;
  }
  /* поза поймана? (только надёжные позы) */
  C.POSES = {
    smile: s => (s.mouthSmileLeft + s.mouthSmileRight)/2 > 0.55,
    kiss: s => s.mouthPucker > 0.55 && s.jawOpen < 0.4,
    blow: s => s.mouthPucker > 0.45 || s.mouthFunnel > 0.4,
    open_wide: s => s.jawOpen > 0.5,
    cheeks: s => s.cheekPuff > 0.35 || (base && s._lipsClosed && s._cheek > base.cheek*1.035)
  };
  C.sees = pose => C.ready && C.face && C.POSES[pose] ? C.POSES[pose](C.scores) : false;
})();
