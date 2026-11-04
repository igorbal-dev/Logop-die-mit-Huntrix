/* Общие мелочи. SA — пространство имён всего приложения. */
window.SA = window.SA || {};
(function(){
  const q = new URLSearchParams(location.search);
  /* ?speed=4 — всё быстрее (только для проверки); ?auto=1 — автопрохождение: ответы засчитываются сами */
  SA.SPEED = Math.max(1, +q.get('speed') || 1);
  SA.AUTO = q.get('auto') === '1';
  SA.$ = s => document.querySelector(s);
  SA.el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  SA.pick = a => a[Math.floor(Math.random()*a.length)];
  SA.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  SA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* «Закончить раньше»: SA.stopNow() — все ожидания занятия сразу прерываются исключением SA.Stop */
  SA.Stop = class extends Error {};
  SA.stopped = false;
  const waiters = new Set();
  SA.stopNow = () => { SA.stopped = true; for (const w of waiters) w(); waiters.clear(); };
  SA.check = () => { if (SA.stopped) throw new SA.Stop(); };
  /* sleep, который прерывается кнопкой «закончить» */
  SA.sleep = ms => new Promise((res, rej) => {
    if (SA.stopped) return rej(new SA.Stop());
    const t = setTimeout(() => { waiters.delete(w); res(); }, ms/SA.SPEED);
    const w = () => { clearTimeout(t); rej(new SA.Stop()); };
    waiters.add(w);
  });
  /* обещание, которое тоже прерывается кнопкой «закончить» */
  SA.guard = p => new Promise((res, rej) => {
    if (SA.stopped) return rej(new SA.Stop());
    const w = () => rej(new SA.Stop()); waiters.add(w);
    p.then(v => { waiters.delete(w); res(v); }, e => { waiters.delete(w); rej(e); });
  });
  SA.now = () => performance.now();

  /* кнопка, которую надо удерживать (защита от ребёнка) */
  SA.holdButton = (btn, ms, fn) => {
    let t = null;
    const start = e => { e.preventDefault(); btn.classList.add('holding'); t = setTimeout(() => { btn.classList.remove('holding'); t = null; fn(); }, ms); };
    const end = () => { btn.classList.remove('holding'); if (t){ clearTimeout(t); t = null; } };
    btn.addEventListener('pointerdown', start);
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, end);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  };
  /* ждём нажатия на один из элементов: возвращает индекс */
  SA.tapOne = (els) => new Promise(res => {
    const hs = els.map((e, i) => { const h = ev => { ev.preventDefault(); done(i); }; e.addEventListener('pointerdown', h); return h; });
    function done(i){ els.forEach((e, k) => e.removeEventListener('pointerdown', hs[k])); res(i); }
  });
  SA.V = window.SA_V || '0';
  SA.ver = url => url + (url.includes('?') ? '&' : '?') + 'v=' + SA.V;       /* у каждой публикации свои адреса — телефон не подставит старый файл */
  SA.fetchJSON = async url => (await fetch(SA.ver(url), {cache: 'no-cache'})).json();
  /* есть ли на сайте версия новее той, что открыта (телефон мог показать старую копию) — тогда перезагрузиться */
  SA.checkUpdate = async () => {
    try {
      const j = await (await fetch('version.json?t=' + Date.now(), {cache: 'no-store'})).json();
      if (j.v && j.v !== SA.V){
        let tried = null; try { tried = sessionStorage.getItem('sa-upd'); sessionStorage.setItem('sa-upd', j.v); } catch(e){}
        if (tried !== j.v){ location.replace(location.pathname + '?u=' + j.v); return true; }
      }
    } catch(e){}
    return false;
  };
})();
