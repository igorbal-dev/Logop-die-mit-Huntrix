/* Камера для «зеркала». Включается только в этом задании и выключается сразу после него (значок с красной точкой виден всё время).
   Лицо распознаёт Google MediaPipe прямо в браузере: файлы модели лежат на нашем сайте (vendor/mediapipe), видео никуда
   не отправляется и не записывается. Камера надёжно видит только улыбку, трубочку, открытый рот и (не всегда) надутые щёки —
   их засчитываем сами. Язык камера не видит: его засчитывает таймер («старалась») или кнопка родителя. */
(function(){
  const C = SA.C = {on: false, ready: false, video: null, stream: null, lm: null, scores: {}, face: false};
  let raf = 0, lastT = -1, base = null, calmW = [];

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
      C.ready = true; calmW = []; loop();
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
    /* «Хомяк»: cheekPuff у MediaPipe почти всегда 0 (проверено — даже на нарисованных надутых щеках), поэтому меряем сами:
       надутые щёки расширяют НИЖНЮЮ часть лица (точки 58–288, 172–397, 136–365, 150–379) на 4–6 % относительно
       расстояния между глазами; при трубочке и улыбке она почти не меняется (±1 %), при открытом рте — сужается.
       Сравниваем с этим же ребёнком в спокойном лице: «спокойные» кадры копятся всё время, пока работает зеркало. */
    const lm = r.faceLandmarks[0], d = (a, b) => Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y), iod = d(33, 263);
    s._w = (d(58, 288) + d(172, 397) + d(136, 365) + d(150, 379))/4/iod;
    const calm = s.jawOpen < 0.15 && (s.mouthSmileLeft + s.mouthSmileRight)/2 < 0.3 && s.mouthPucker < 0.35;
    if (calm){ calmW.push(s._w); if (calmW.length > 240) calmW.shift(); }
    s._base = calmW.length >= 8 ? calmW.slice().sort((a, b) => a - b)[Math.floor(calmW.length*0.4)] : null;
    s._ratio = s._base ? s._w/s._base : null;
    C.scores = s;
  }
  /* поза поймана? (только надёжные позы) */
  C.POSES = {
    smile: s => (s.mouthSmileLeft + s.mouthSmileRight)/2 > 0.55,
    kiss: s => s.mouthPucker > 0.55 && s.jawOpen < 0.4,
    blow: s => s.mouthPucker > 0.45 || s.mouthFunnel > 0.4,
    open_wide: s => s.jawOpen > 0.5,
    cheeks: s => s.cheekPuff > 0.35 || (s._ratio !== null && s.jawOpen < 0.25 && s._ratio > 1 + C.cheekThr)
  };
  C.cheekThr = 0.03;        /* на сколько шире спокойного лица (3 %); родитель может проверить в «Проверка камеры» */
  C.sees = pose => C.ready && C.face && C.POSES[pose] ? C.POSES[pose](C.scores) : false;
})();
