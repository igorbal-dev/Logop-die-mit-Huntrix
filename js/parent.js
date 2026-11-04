/* Родительский раздел: вход — удержать шестерёнку 2 с и решить пример на умножение (ребёнок 5 лет не решит).
   Этап 2: длительность, награда, история занятий с отметками, проверка картинок учительниц, сброс. */
(function(){
  const P = SA.P, T = SA.T;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  SA.parentGate = () => {
    const g = SA.$('#pgate'), a = 3 + Math.floor(Math.random()*7), b = 3 + Math.floor(Math.random()*7);
    SA.$('#pq').textContent = `${a} × ${b} = ?`; SA.$('#pa').value = ''; g.hidden = false;
    setTimeout(() => SA.$('#pa').focus(), 50);
    const form = g.querySelector('form');
    form.onsubmit = e => { e.preventDefault(); if (+SA.$('#pa').value === a*b){ g.hidden = true; SA.openParent(); } else { SA.$('#pa').value = ''; SA.$('#pq').textContent = `${a} × ${b} = ?  (ещё раз)`; } };
    SA.$('#pcancel').onclick = () => { g.hidden = true; };
  };

  const fmtDur = s => `${Math.floor(s/60)}:${String(s % 60).padStart(2, '0')}`;
  const ITEM_RU = {pusteblume: 'одуванчик', kerzen: 'свечки', kamera: 'камера', frosch: 'лягушка (улыбка)', kuss: 'трубочка', loewe: 'лев (рот широко)', hamster: 'хомяк (щёки)', hallo: '«Hallo!» в начале'};
  const RES_RU = {heard: 'сказала', none: 'промолчала', nomic: 'без микрофона', done: 'сделала', tried: 'старалась', camera: 'камера увидела', parent: 'подтвердил родитель', timer: 'по таймеру', ok: 'верно сразу', retry: 'верно не сразу',
    nocamera: 'камера не включилась', 'camera-noface': 'камера без распознавания', info: ''};
  const itemName = it => { const [a, b] = String(it.id).split(':'); return b ? `${{wort: 'слово', tier: 'звукоподражание', vokal: 'гласная', spiel: 'игра', wer: 'кто так говорит', gleich: 'одинаковые/разные'}[a] || a}: ${b}` : (ITEM_RU[a] || a); };

  SA.openParent = () => {
    const box = SA.$('#parent'); box.hidden = false; SA.$('#home').hidden = true;
    render();
  };
  function close(){ SA.$('#parent').hidden = true; SA.$('#home').hidden = false; SA.renderHome(); }

  function render(){
    const d = P.load(), st = d.settings, box = SA.$('#parent');
    const sess = d.sessions.slice().reverse();
    const rows = sess.map((s, i) => {
      const marks = s.items.filter(x => x.mark), ok = marks.filter(x => x.mark === 'ok').length, hard = marks.length - ok;
      const taps = s.items.filter(x => x.kind === 'tap'), tapOk = taps.filter(x => x.result === 'ok').length;
      const det = s.items.filter(x => x.kind !== 'info' && x.kind !== 'dance').map(x => `<tr><td>${esc(itemName(x))}</td><td>${esc(RES_RU[x.result] ?? x.result ?? '')}${x.reps ? ' (' + x.reps.map(r => RES_RU[r] || r).join(', ') + ')' : ''}</td><td>${x.mark === 'ok' ? '✓ получилось' : x.mark === 'hard' ? '~ пока трудно' : ''}</td></tr>`).join('');
      return `<details class="box"><summary><b>Занятие ${s.n}</b> · ${new Date(s.date).toLocaleString('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})} · ${fmtDur(s.durSec)}
        · ${s.completed ? 'до конца' : s.early ? 'закончили раньше' : 'прервано'}${s.egg ? ' · 🥚 засчитано' : ''}
        · отметки: ✓ ${ok} / ~ ${hard} · слушание: верно сразу ${tapOk} из ${taps.length}</summary>
        <table><tr><th>Задание</th><th>Что было</th><th>Отметка родителя</th></tr>${det}</table></details>`;
    }).join('') || '<p class="muted">Занятий пока не было.</p>';

    const sprites = [1, 2, 3].map(n => {
      const all = [...T.NEED[n].must.map(x => [x, true]), ...T.NEED[n].later.map(x => [x, false])];
      const have = all.filter(([x]) => T.real[`${n}_${x}`]).length;
      return `<div class="box"><b>${esc(T.name(n))}</b> — ${esc(T.cfg.teachers[n].role)} · подключено ${have} из ${all.length}
        <button class="btn light" data-mouth="${n}">проверить рот</button> <img data-prev="${n}" style="width:72px;height:72px;vertical-align:middle;object-fit:contain" src="${T.src(n, 'face_neutral')}" alt="">
        <p class="muted">Папка: ${esc(T.cfg.teachers[n].folder)}/ · ✅ — картинка подхватилась, ⬜ — пока заглушка. Рамка «обязательно» — нужно для занятия 1.</p>
        <div class="grid">${all.map(([x, must]) => { const ok = !!T.real[`${n}_${x}`];
          return `<div class="spr ${ok ? 'ok' : ''}"><img src="${T.src(n, x)}" alt="">${ok ? '✅' : '⬜'} teacher${n}_${x}.png${must ? '<br><b>обязательно</b>' : '<br>позже'}</div>`; }).join('')}</div></div>`;
    }).join('');

    box.innerHTML = `<h1>Speech Academy — для родителей <button class="close" id="pclose" aria-label="Закрыть">✕</button></h1>
      <div class="box">
        <label>Длительность занятия: <input type="range" id="sMin" min="10" max="30" step="5" value="${st.minutes}"> <b id="sMinV">${st.minutes} мин</b></label>
        <p class="muted">Для 5 лет лучше 10–15 минут каждый день, чем одно длинное занятие. Задания подстраиваются под время сами.</p>
      </div>
      <h2>Награда</h2>
      <div class="box">
        <label>Занятий на одно яйцо: <input type="number" id="sEgg" min="1" max="10" value="${st.eggTarget}" style="width:70px"></label>
        <label>Награда: <input type="text" id="sName" value="${esc(st.rewardName)}" style="flex:1 1 220px"></label>
        <label>Картинка награды: <input type="file" id="sImg" accept="image/*"> ${st.rewardImg ? `<img src="${st.rewardImg}" style="height:48px;border-radius:8px"> <button class="btn light" id="sImgDel">убрать</button>` : '<span class="muted">(без картинки — рисованное яйцо)</span>'}</label>
        <p>Сейчас в яйце: <b>${d.egg.filled} из ${st.eggTarget}</b> · всего наград заработано: <b>${d.egg.earned}</b></p>
        <p class="muted">Яйцо заполняется за каждое законченное занятие (и за законченное раньше, если прошло больше половины). Когда оно полное, учительницы говорят, что Эмили заработала настоящую награду — её выдаёте вы. Название награды в озвучке не звучит, поэтому его можно менять.</p>
      </div>
      <h2>Пройденные занятия</h2>
      <p class="muted">✓ / ~ — ваши отметки во время «говорим» и игры (кнопки внизу справа). Если Эмили просто не знает слово, ничего не нажимайте — это не ошибка произношения. Слушание отмечается само: по нажатиям картинок.</p>
      ${rows}
      <h2>Картинки учительниц</h2>
      <p class="muted">Имена учительниц и папки меняются в файле config/teachers.json. Картинки выравниваются сами при загрузке. Если картинка не появилась — проверьте имя файла и обновите страницу.</p>
      ${sprites}
      <h2>Озвучка</h2>
      <details class="box"><summary>Все реплики занятия (${Object.keys(SA.A.LINES).length}) — прослушать</summary>
        <p class="muted">Если какая-то реплика звучит неправильно (обрывается, лишние звуки, неверное слово) — напишите мне её номер или текст, я переозвучу.</p>
        <table>${Object.entries(SA.A.LINES).map(([k, v], i) => `<tr><td>${i + 1}</td><td><button class="btn light" data-line="${k}">▶</button></td><td>${esc(T.name(v.t))}</td><td>${esc(v.text)}</td></tr>`).join('')}</table></details>
      <h2>Данные</h2>
      <div class="box"><p class="muted">Всё хранится только на этом устройстве (телефон и планшет — отдельно). Камера работает только в «зеркале», видео никуда не отправляется и не записывается. Записи «послушай себя» живут в памяти до конца занятия и потом стираются.</p>
        <button class="btn warn" id="sReset">Сбросить весь прогресс</button></div>`;

    SA.$('#pclose').onclick = close;
    const m = SA.$('#sMin'); m.oninput = () => { SA.$('#sMinV').textContent = m.value + ' мин'; }; m.onchange = () => P.setSetting('minutes', +m.value);
    SA.$('#sEgg').onchange = e => { const v = SA.clamp(Math.round(+e.target.value || 2), 1, 10); e.target.value = v; P.setSetting('eggTarget', v); render(); };
    SA.$('#sName').onchange = e => P.setSetting('rewardName', e.target.value.trim());
    SA.$('#sImg').onchange = e => { const f = e.target.files[0]; if (f) shrink(f).then(u => { if (!P.setSetting('rewardImg', u)) alert('Картинка слишком большая'); render(); }); };
    const del = SA.$('#sImgDel'); if (del) del.onclick = () => { P.setSetting('rewardImg', null); render(); };
    SA.$('#sReset').onclick = () => { if (confirm('Удалить все занятия, отметки и яйцо на этом устройстве?')){ P.reset(); render(); } };
    box.querySelectorAll('[data-mouth]').forEach(b => b.onclick = () => testMouth(+b.dataset.mouth));
    box.querySelectorAll('[data-line]').forEach(b => b.onclick = async () => { if (!SA.A.ctx) SA.A.unlock(); await SA.A.loadSounds([b.dataset.line]); SA.A.say(b.dataset.line, {always: true}).catch(() => {}); });
  }
  /* картинка награды: уменьшаем до 480 px, чтобы поместилась в память браузера */
  function shrink(file){
    return new Promise(res => { const im = new Image(); im.onload = () => { const s = Math.min(1, 480/Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width*s); c.height = Math.round(im.height*s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); URL.revokeObjectURL(im.src); };
      im.src = URL.createObjectURL(file); });
  }
  /* «проверить рот»: учительница говорит реплику, видно, не прыгает ли лицо между кадрами */
  async function testMouth(n){
    if (!SA.A.ctx) SA.A.unlock();
    const key = {1: 't1_hallo', 2: 't2_hallo', 3: 't3_ritual_hallo'}[n];
    await SA.A.loadSounds([key]);
    const img = SA.$(`[data-prev="${n}"]`); let on = true;
    const loop = () => { if (!on) return; requestAnimationFrame(loop); const l = SA.A.level;
      img.src = T.src(n, 'face_' + (l < 0.06 ? 'neutral' : l < 0.22 ? 'talk_half' : 'talk_open')); };
    loop();
    try { await SA.A.say(key, {always: true}); } catch(e){}
    on = false; img.src = T.src(n, 'face_neutral');
  }
})();
