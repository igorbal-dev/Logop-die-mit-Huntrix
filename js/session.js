/* Карта урока: 5 станций (упражнений) по порядку. Сделанная — со звездой, следующая — светится, остальные ждут.
   Ребёнок нажимает светящуюся станцию → упражнение (~3 мин) → звезда → снова карта. Можно закончить на любой станции
   и продолжить потом с неё же. После 3-й станции — танцпауза. Все 5 → яйцо и следующий урок. */
(function(){
  const X = SA.X, P = SA.P, T = SA.T, A = SA.A;
  const lessonDef = n => SA.LESSONS[(n - 1) % SA.LESSONS.length];
  const icon = name => name === 'pusteblume' ? SA.dandelionSVG(10) : SA.pic(name);
  let busy = false, tipsSaid = 0, idleTimer = null;

  SA.openMap = () => {
    const pr = P.prog(), L = lessonDef(pr.lesson), next = pr.done.indexOf(false);
    SA.$('#home').hidden = true; SA.$('#lesson').hidden = true; SA.$('#map').hidden = false;
    const st = SA.$('#stations'); st.innerHTML = '';
    L.ex.forEach((e, i) => {
      const b = SA.el('button', 'st' + (pr.done[i] ? ' done' : i === next ? ' cur' : ' wait'));
      b.setAttribute('aria-label', `Упражнение ${i + 1}`);
      b.innerHTML = `<span class="ico">${icon(e.icon)}</span><img class="tf" src="${T.src(e.t, 'face_neutral')}" alt=""><span class="badge">${pr.done[i] ? SA.pic('star') : ''}</span>`;
      b.addEventListener('click', () => tapStation(i));
      st.appendChild(b);
      if (i < 4){ const path = SA.el('i', 'path' + (pr.done[i] ? ' on' : '')); st.appendChild(path); }
    });
    /* какой по счёту урок — точками (ребёнок не читает) */
    const total = SA.LESSONS.length, dots = SA.$('#lessonDots'); dots.innerHTML = '';
    for (let i = 1; i <= total; i++) dots.appendChild(SA.el('i', i < pr.lesson ? 'on' : i === pr.lesson ? 'now' : ''));
    SA.$('#quickBadge').hidden = !SA.quick();
    const d = P.load(); SA.$('#mapEgg').innerHTML = SA.eggSVG(Math.min(d.egg.filled, d.settings.eggTarget)/d.settings.eggTarget, d.settings.eggTarget, d.settings.rewardImg);
    /* подсказка: «нажми на следующую картинку» — первые разы и если ребёнок ничего не нажимает */
    clearTimeout(idleTimer);
    if (A.ctx && next > 0 && tipsSaid < 2){ tipsSaid++; A.say('t3_station_naechste', {always: true}).catch(() => {}); }
    idleTimer = setTimeout(() => { if (!SA.$('#map').hidden && !busy) A.say('t3_ru_station', {always: true}).catch(() => {}); }, 12000);
  };

  async function tapStation(i){
    if (busy) return;
    const pr = P.prog(), next = pr.done.indexOf(false);
    /* порядок методический: можно повторить сделанное или начать следующее, но не перескакивать */
    if (!pr.done[i] && i !== next && !SA.quick()){ A.sfx.soft(); const b = SA.$('#stations').querySelectorAll('.st')[next]; if (b){ b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); } return; }
    clearTimeout(idleTimer); A.cut();
    busy = true;
    try { await runExercise(pr.lesson, i, !pr.done.some(Boolean) && i === 0); }
    finally { busy = false; }
  }

  async function runExercise(lessonN, i, first){
    const L = lessonDef(lessonN), e = L.ex[i], pr = P.prog();
    const min = SA.clamp(+P.settings().minutes || 15, 10, 30), sec = Math.round(min*60/5);
    SA.$('#map').hidden = true; SA.$('#lesson').hidden = false;
    T.attach(SA.$('#tview')); X.board(); X.help(0, null);
    SA.stopped = false;
    const t0 = SA.now();
    SA.E = {sec, t0, level: pr.cycle > 0 ? 1 : 0, told: new Set(), first: lessonN === 1 && pr.cycle === 0, left: () => sec - (SA.now() - t0)/1000*SA.SPEED};
    SA.curBlock = `${lessonN}.${e.id}`;
    P.begin(lessonN, e.id, sec);
    let completed = false;
    try {
      if (first) await X.ritual();
      await e.run(SA.E);
      completed = true;
    } catch(err){ if (!(err instanceof SA.Stop)) console.error(err); }
    SA.stopped = false;
    try { SA.C.stop(); } catch(err){}
    await SA.M.breathClose();
    X.marks(null); X.earOff(); X.help(0, null); SA.$('#micring').hidden = true;
    P.end(completed, i);
    SA.M.clearRecordings();
    SA.E = null;
    if (completed){
      try {
        /* звезда за станцию; после 3-й — танцпауза */
        A.sfx.fanfare(); T.body(3, 'praise'); SA.starEl(SA.$('#board'));
        if (i === 2) await X.dance(3, 20);
        else await A.sayOne(['t3_station_fertig', 't3_station_fertig2', 't3_station_fertig3']);
        const now = P.prog();
        if (now.done.every(Boolean)){
          const res = P.lessonDone(SA.LESSONS.length);
          await X.finale(res);
        }
      } catch(err){ if (!(err instanceof SA.Stop)) console.error(err); SA.stopped = false; }
    }
    window.__exDone = (window.__exDone || 0) + 1;      /* для автопроверки */
    SA.openMap();
  }
  SA.runExercise = runExercise;

  /* «на старт»: с карты — домой */
  SA.goHome = () => { clearTimeout(idleTimer); A.cut(); SA.$('#map').hidden = true; SA.$('#lesson').hidden = true; SA.$('#home').hidden = false; SA.renderHome(); };
})();
