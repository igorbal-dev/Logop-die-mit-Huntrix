/* Старт: загрузка настроек, реплик, картинок; стартовый экран; кнопка «играть» включает звук, микрофон и занятие. */
(function(){
  const T = SA.T, P = SA.P;
  SA.renderHome = () => {
    const h = SA.$('#homeTeachers'); h.innerHTML = '';
    for (const n of [1, 2, 3]){ const c = SA.el('div', 'tcard'); c.innerHTML = `<img src="${T.src(n, 'body_hello')}" alt="">`; h.appendChild(c); }
    const d = P.load(), t = d.settings.eggTarget, f = Math.min(d.egg.filled, t);
    SA.$('#homeEgg').innerHTML = SA.eggSVG(f/t, t, d.settings.rewardImg);
  };

  async function start(){
    SA.$('#loading').hidden = false;
    await Promise.all([T.init(), SA.A.loadLines('de')]);
    SA.renderHome();
    SA.$('#loading').hidden = true;
  }

  let running = false;
  SA.$('#go').addEventListener('click', async () => {
    if (running) return; running = true;
    SA.A.unlock(); SA.A.sfx.pop();
    try { navigator.wakeLock && navigator.wakeLock.request('screen').catch(() => {}); } catch(e){}
    try { const de = document.documentElement; if (!document.fullscreenElement && de.requestFullscreen && !/iPhone|iPad/.test(navigator.userAgent)) de.requestFullscreen().catch(() => {}); } catch(e){}
    SA.$('#loading').hidden = false;
    await Promise.all([SA.A.loadSounds(Object.keys(SA.A.LINES)), SA.AUTO ? null : SA.M.setup(), T.ready]);
    SA.$('#loading').hidden = true;
    running = false;
    SA.openMap();
  });
  SA.$('#mapHome').addEventListener('click', () => SA.goHome());
  SA.holdButton(SA.$('#stop'), 2000, () => SA.stopNow());
  SA.holdButton(SA.$('#gear'), 2000, () => SA.parentGate());
  start().catch(e => { console.error(e); SA.$('#loading').hidden = true; });
})();
