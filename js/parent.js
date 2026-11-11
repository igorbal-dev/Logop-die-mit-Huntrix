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
  const ITEM_RU = {pusteblume: 'одуванчик', kerzen: 'свечки', kamera: 'камера', frosch: 'лягушка (улыбка)', kuss: 'трубочка', loewe: 'лев (рот широко)', hamster: 'хомяк (щёки)', hallo: '«Hallo!» в начале', pfannkuchen: 'блинчик (лопатка)', nadel: 'иголочка', tasse: 'чашечка', zaun: 'заборчик', berg: 'горка', pilz: 'грибок', schaukel: 'качели', maler: 'маляр', zaehne: 'чистим зубки', pferd: 'лошадка (щелчки)', fussball: 'футбол языком', zunge_raus: 'язык вперёд', nase: 'язык к носу', kinn: 'язык к подбородку', uhr: 'часики', marmelade: 'вкусное варенье'};
  const RES_RU = {heard: 'сказала', none: 'промолчала', nomic: 'без микрофона', done: 'сделала', tried: 'старалась', camera: 'камера увидела', parent: 'подтвердил родитель', timer: 'по таймеру', ok: 'верно сразу', retry: 'верно не сразу',
    nocamera: 'камера не включилась', 'camera-noface': 'камера без распознавания', info: ''};
  const WRU = w => (SA.A.LINES['t3_w_' + w] || {}).text?.replace(/!$/, '') || w;
  const itemName = it => { const [a, b, c] = String(it.id).split(':');
    if (a === 'satz') return 'фраза: ' + ((SA.A.LINES[b] || {}).text || b);
    if (a === 'silbe') return 'слоги/звук: ' + ((SA.A.LINES['t3_' + b] || {}).text || b);
    if (a === 'hoer') return `слышит ${(SA.SOUNDS[b] || {}).name || b}? «${WRU(c)}»`;
    return b ? `${{wort: 'слово', tier: 'звукоподражание', vokal: 'гласная', spiel: 'игра', game: 'игра', wer: 'кто так говорит', gleich: 'одинаковые/разные'}[a] || a}: ${a === 'wort' || a === 'spiel' ? WRU(b) : b}` : (ITEM_RU[a] || a); };

  SA.openParent = () => {
    const box = SA.$('#parent'); box.hidden = false; SA.$('#home').hidden = true;
    render();
    if (T.ready) T.ready.then(() => { if (!box.hidden) render(); });
  };
  function close(){ SA.$('#parent').hidden = true; SA.$('#home').hidden = false; SA.renderHome(); }

  function render(){
    const d = P.load(), st = d.settings, box = SA.$('#parent');
    const sess = d.sessions.slice().reverse();
    const rows = sess.map((s, i) => {
      const marks = s.items.filter(x => x.mark), ok = marks.filter(x => x.mark === 'ok').length, hard = marks.length - ok;
      const taps = s.items.filter(x => x.kind === 'tap'), tapOk = taps.filter(x => x.result === 'ok').length;
      const det = s.items.filter(x => x.kind !== 'info' && x.kind !== 'dance').map(x => `<tr><td>${esc(itemName(x))}</td><td>${esc(RES_RU[x.result] ?? x.result ?? '')}${x.reps ? ' (' + x.reps.map(r => RES_RU[r] || r).join(', ') + ')' : ''}</td><td>${x.mark === 'ok' ? '✓ получилось' : x.mark === 'hard' ? '~ пока трудно' : ''}</td></tr>`).join('');
      const L = s.snd ? null : SA.LESSONS[(s.n - 1) % SA.LESSONS.length], ex = s.ex && L ? L.ex.find(e => e.id === s.ex) : null;
      const title = s.snd ? `Звук ${esc((SA.SOUNDS[s.snd] || {}).name)} (${esc(SA.STAGE_RU[s.stage] || '')}) · ${esc({warmup: 'разминка', listen: 'слушаем', sounds: 'звук', words: 'слова', game: 'игра'}[s.ex] || s.ex)}` : `Урок ${s.n}${ex ? ' · ' + esc(ex.name) : ''}`;
      return `<details class="box"><summary><b>${title}</b> · ${new Date(s.date).toLocaleString('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})} · ${fmtDur(s.durSec)}
        · ${s.completed ? 'сделано' : 'прервано'}
        · отметки: ✓ ${ok} / ~ ${hard} · слушание: верно сразу ${tapOk} из ${taps.length}</summary>
        <table><tr><th>Задание</th><th>Что было</th><th>Отметка родителя</th></tr>${det}</table></details>`;
    }).join('') || '<p class="muted">Упражнений пока не было.</p>';

    const sprites = [1, 2, 3].map(n => {
      const all = [...T.NEED[n].must.map(x => [x, true]), ...T.NEED[n].later.map(x => [x, false])];
      const have = all.filter(([x]) => T.real[`${n}_${x}`]).length;
      return `<div class="box"><b>${esc(T.name(n))}</b> — ${esc(T.cfg.teachers[n].role)} · подключено ${have} из ${all.length}
        <button class="btn light" data-mouth="${n}">проверить рот</button> <img data-prev="${n}" style="width:72px;height:72px;vertical-align:middle;object-fit:contain" src="${T.src(n, 'face_neutral')}" alt="">
        <p class="muted">Папка: ${esc(T.cfg.teachers[n].folder)}/ · ✅ — картинка подхватилась, ⬜ — пока заглушка. Рамка «обязательно» — без неё вместо картинки нарисованная заглушка.</p>
        <div class="grid">${all.map(([x, must]) => { const ok = !!T.real[`${n}_${x}`];
          return `<div class="spr ${ok ? 'ok' : ''}"><img src="${T.src(n, x)}" alt="">${ok ? '✅' : '⬜'} teacher${n}_${x}.webp${must ? '<br><b>обязательно</b>' : '<br>позже'}</div>`; }).join('')}</div></div>`;
    }).join('');

    box.innerHTML = `<h1>Speech Academy — для родителей <button class="close" id="pclose" aria-label="Закрыть">✕</button></h1>
      <div class="box">
        <label>Длительность занятия: <input type="range" id="sMin" min="10" max="30" step="5" value="${st.minutes}"> <b id="sMinV">${st.minutes} мин</b></label>
        <p class="muted">Для 5 лет лучше 10–15 минут каждый день, чем одно длинное занятие. Задания подстраиваются под время сами.</p>
      </div>
${soundsHtml(d)}
      ${reviewHtml(d)}
      <h2>Программа</h2>
      <div class="box">
        <label><input type="checkbox" id="sQuick" ${st.quick ? 'checked' : ''}> <b>⚡ Быстрый режим проверки</b></label>
        <p class="muted">Для взрослого: каждое задание звучит по одному разу, без повторов, танец 5 с, станции можно нажимать в любом порядке. Урок проходится за 3–4 минуты. На карте виден значок ⚡. Для Эмили выключите.</p>
        ${(() => { const pr = d.prog, L = SA.curLesson(pr);
          return `<p>Сейчас: <b>${pr.kind === 'sound' ? 'урок под звук' : `урок ${pr.lesson} из ${SA.LESSONS.length}`}</b> — ${esc(L.name)}${pr.cycle && pr.kind !== 'sound' ? ` (круг ${pr.cycle + 1}, задания сложнее)` : ''}</p>
          <ol>${L.ex.map((e, i) => `<li>${pr.done[i] ? '⭐' : '⬜'} ${esc(e.name)}</li>`).join('')}</ol>`; })()}
        <label>Перейти к уроку: <select id="sLesson">${SA.LESSONS.map(L => `<option value="${L.n}" ${L.n === d.prog.lesson ? 'selected' : ''}>${L.n}. ${esc(L.name)}</option>`).join('')}</select>
          <button class="btn light" id="sLessonGo">перейти</button></label>
        <p class="muted">Урок — 5 упражнений по ~${Math.round(st.minutes/5)} мин. Каждое сделанное упражнение сохраняется: можно остановиться и продолжить с того же места. Порядок упражнений — методический (слушаем → звук → слово → игра), перескакивать вперёд нельзя, повторить сделанное — можно.</p>
      </div>
      <h2>Проверка микрофона и камеры</h2>
      <div class="box">
        <label>Чувствительность выдоха: <select id="sBreath"><option value="0" ${st.breathSens == 0 ? 'selected' : ''}>строже (шумная комната)</option><option value="1" ${st.breathSens == 1 ? 'selected' : ''}>обычная</option><option value="2" ${st.breathSens == 2 ? 'selected' : ''}>чувствительнее (тихий выдох, планшет далеко)</option></select></label>
        <button class="btn light" id="tBreath">проверить дыхание</button> <button class="btn light" id="tCam">проверить камеру</button>
        <div id="tOut" class="muted"></div>
        <p class="muted">Если выдох не ловится: нажмите «проверить дыхание», 5 секунд дуйте, нажмите «остановить» и пришлите Claude скриншот с цифрами. Дыхание: подуйте на экран с разного расстояния и скажите что-нибудь — «выдох» должен загораться только от дуновения, «голос» — от речи. Ловится лучше, если дуть в сторону микрофона (низ телефона) с 10–30 см. Камера: покажите улыбку, трубочку, широко открытый рот и надутые щёки — должны загораться соответствующие значки.</p>
      </div>
      <h2>Награда</h2>
      <div class="box">
        <label>Занятий на одно яйцо: <input type="number" id="sEgg" min="1" max="10" value="${st.eggTarget}" style="width:70px"></label>
        <label>Награда: <input type="text" id="sName" value="${esc(st.rewardName)}" style="flex:1 1 220px"></label>
        <label>Картинка награды: <input type="file" id="sImg" accept="image/*"> ${st.rewardImg ? `<img src="${st.rewardImg}" style="height:48px;border-radius:8px"> <button class="btn light" id="sImgDel">убрать</button>` : '<span class="muted">(без картинки — рисованное яйцо)</span>'}</label>
        <p>Сейчас в яйце: <b>${d.egg.filled} из ${st.eggTarget}</b> · всего наград заработано: <b>${d.egg.earned}</b></p>
        <p class="muted">Яйцо заполняется за каждый законченный урок (все 5 станций; можно за несколько дней). Когда оно полное, учительницы говорят, что Эмили заработала настоящую награду — её выдаёте вы. Название награды в озвучке не звучит, поэтому его можно менять.</p>
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
      <div class="box"><p class="muted">Всё хранится только на этом устройстве (телефон и планшет — отдельно). Камера работает только в «зеркале», видео никуда не отправляется и не записывается. Записи попыток Эмили хранятся только здесь (последние 120), чтобы вы могли послушать и отметить потом.</p>
        <label><input type="checkbox" id="sKeep" ${st.keepRec !== false ? 'checked' : ''}> хранить записи попыток на этом устройстве</label>
        <button class="btn warn" id="sReset">Сбросить весь прогресс</button></div>`;

    SA.$('#pclose').onclick = close;
    const m = SA.$('#sMin'); m.oninput = () => { SA.$('#sMinV').textContent = m.value + ' мин'; }; m.onchange = () => P.setSetting('minutes', +m.value);
    SA.$('#sEgg').onchange = e => { const v = SA.clamp(Math.round(+e.target.value || 2), 1, 10); e.target.value = v; P.setSetting('eggTarget', v); render(); };
    SA.$('#sName').onchange = e => P.setSetting('rewardName', e.target.value.trim());
    SA.$('#sImg').onchange = e => { const f = e.target.files[0]; if (f) shrink(f).then(u => { if (!P.setSetting('rewardImg', u)) alert('Картинка слишком большая'); render(); }); };
    const del = SA.$('#sImgDel'); if (del) del.onclick = () => { P.setSetting('rewardImg', null); render(); };
    SA.$('#sReset').onclick = () => { if (confirm('Удалить все занятия, отметки и яйцо на этом устройстве?')){ P.reset(); SA.Rec.clear(); render(); } };
    SA.$('#sKeep').onchange = e => { P.setSetting('keepRec', e.target.checked); if (!e.target.checked) SA.Rec.clear(); };
    const sv = SA.$('#sSndSave'); if (sv) sv.onclick = () => { P.setSounds([...box.querySelectorAll('[data-snd]:checked')].map(c => c.dataset.snd)); render(); };
    box.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => { const [c, dir] = b.dataset.stage.split(':'), S = SA.SOUNDS[c], i = S.stages.indexOf(P.sndStage(c)) + (+dir);
      if (i >= 0 && i < S.stages.length){ P.setStage(c, S.stages[i]); render(); } });
    box.querySelectorAll('[data-model]').forEach(b => b.onclick = async () => { if (!SA.A.ctx) SA.A.unlock(); await SA.A.loadSounds([b.dataset.model]); SA.A.say(b.dataset.model, {always: true}).catch(() => {}); });
    box.querySelectorAll('[data-rec]').forEach(b => b.onclick = async () => { const blob = await SA.Rec.get(b.dataset.rec); if (!blob){ b.textContent = 'нет записи'; return; } const u = URL.createObjectURL(blob), au = new Audio(u); au.onended = () => URL.revokeObjectURL(u); au.play().catch(() => {}); });
    box.querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { const [si, ii, m] = b.dataset.mk.split(':'); P.markAt(+si, +ii, m);
      b.parentElement.querySelectorAll('[data-mk]').forEach(x => x.classList.toggle('sel', x === b)); });
    box.querySelectorAll('[data-mouth]').forEach(b => b.onclick = () => testMouth(+b.dataset.mouth));
    SA.$('#sLessonGo').onclick = () => { const n = +SA.$('#sLesson').value; if (confirm(`Перейти к уроку ${n}? Звёзды текущего урока обнулятся.`)){ P.setLesson(n); render(); } };
    SA.$('#sBreath').onchange = e => P.setSetting('breathSens', +e.target.value);
    SA.$('#sQuick').onchange = e => P.setSetting('quick', e.target.checked);
    SA.$('#tBreath').onclick = () => testBreath();
    SA.$('#tCam').onclick = () => testCam();
    box.querySelectorAll('[data-line]').forEach(b => b.onclick = async () => { if (!SA.A.ctx) SA.A.unlock(); await SA.A.loadSounds([b.dataset.line]); SA.A.say(b.dataset.line, {always: true}).catch(() => {}); });
  }
  /* ---------- трудные звуки и паспорт звука ---------- */
  function soundsHtml(d){
    const SS = SA.SOUNDS, list = d.snd.list;
    const ex = {sch: 'Schaf, Fisch', s: 'Sonne, Maus', z: 'Zug, Katze', kg: 'Kuh, Gabel', l: 'Löffel, Ball', r: 'Rose, Rad', ch: 'ich, Milch', fw: 'Fisch, Wolke', td: 'Tisch, Dose'};
    const pass = c => { const S = SS[c], cur = P.sndStage(c), ci = S.stages.indexOf(cur), ls = P.sndLessons(c).slice(-4).reverse();
      const steps = S.stages.map((st, i) => `<span class="stp ${i < ci ? 'ok' : i === ci ? 'cur' : ''}">${i < ci ? '✅' : i === ci ? '▶' : '⬜'} ${esc(SA.STAGE_RU[st])}</span>`).join(' → ');
      const hist = ls.length ? ls.map(r => `<li>${new Date(r.date).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})} · ${esc(SA.STAGE_RU[r.stage] || '')}: ${r.stage === 'hoeren' ? `на слух верно ${r.tapOk} из ${r.taps}` : `✓ ${r.ok} / ~ ${r.hard}${r.ok + r.hard < 4 ? ' (мало отметок — послушайте записи ниже)' : ''}`}</li>`).join('') : '<li class="muted">уроков с этим звуком ещё не было</li>';
      const need = cur === 'hoeren' ? 'этап засчитывается сам: ≥ 80 % верных ответов на слух на двух уроках подряд' : 'дальше — когда на двух уроках подряд ≥ 80 % ваших ✓ (из 4+ отметок, например 4 из 5)';
      return `<div class="box"><b>Паспорт звука ${esc(S.name)}</b> (${esc(S.ru)})<p>${steps}</p><p class="muted">${need}.</p><ul>${hist}</ul>
        <p class="muted">Совет: ${esc(S.tip)}</p>
        <button class="btn light" data-stage="${c}:-1">← этап назад</button> <button class="btn light" data-stage="${c}:1">этап вперёд →</button></div>`; };
    return `<h2>Трудные звуки</h2>
      <div class="box"><p>Отметьте звуки, которые Эмили пока говорит неправильно. Уроки будут строиться под них: гимнастика для этого звука → слушаем → звук отдельно → слоги → слова → фраза. Два урока со звуком, потом один общий.</p>
        <div class="grid">${Object.entries(SS).map(([c, S]) => `<label class="spr"><input type="checkbox" data-snd="${c}" ${list.includes(c) ? 'checked' : ''}> <b>${esc(S.name)}</b> (${esc(S.ru)})<br><span class="muted">${esc(ex[c])}</span></label>`).join('')}</div>
        <button class="btn" id="sSndSave">сохранить звуки</button>
        <p class="muted">Логопед советует начинать с 1–2 звуков (обычно Sch, S, K/G, L), R — последним: у 5-летних он часто ещё не готов.</p></div>
      ${list.map(pass).join('')}`;
  }
  /* попытки, которые можно послушать и отметить потом (если вас не было рядом) */
  function reviewHtml(d){
    const out = [];
    for (let si = d.sessions.length - 1; si >= 0 && out.length < 40; si--){ const s = d.sessions[si];
      s.items.forEach((it, ii) => { if (it.audio && it.kind === 'speak') out.push({si, ii, it, date: s.date}); }); }
    if (!out.length) return '';
    const todo = out.filter(x => !x.it.mark).length;
    return `<h2>Послушать и отметить${todo ? ` (${todo} без отметки)` : ''}</h2>
      <details class="box" ${todo ? 'open' : ''}><summary>Если вас не было рядом: послушайте образец и Эмили, отметьте ✓ получилось / ~ пока трудно</summary>
      <table>${out.map(({si, ii, it, date}) => `<tr><td>${esc(itemName(it))}<br><span class="muted">${new Date(date).toLocaleString('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</span></td>
        <td>${it.model ? `<button class="btn light" data-model="${it.model}">▶ образец</button>` : ''} <button class="btn light" data-rec="${it.audio}">▶ Эмили</button></td>
        <td class="pm"><button class="btn light ${it.mark === 'ok' ? 'sel' : ''}" data-mk="${si}:${ii}:ok">✓</button> <button class="btn light ${it.mark === 'hard' ? 'sel' : ''}" data-mk="${si}:${ii}:hard">~</button></td></tr>`).join('')}</table>
      <p class="muted">Отметки отсюда так же идут в паспорт звука и в повторение трудных слов. Если Эмили просто не знает слово — не отмечайте.</p></details>`;
  }
  /* картинка награды: уменьшаем до 480 px, чтобы поместилась в память браузера */
  function shrink(file){
    return new Promise(res => { const im = new Image(); im.onload = () => { const s = Math.min(1, 480/Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width*s); c.height = Math.round(im.height*s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); URL.revokeObjectURL(im.src); };
      im.src = URL.createObjectURL(file); });
  }
  /* живая проверка выдоха: «выдох» / «голос» / громкость */
  let testOn = null;
  async function testBreath(){
    const out = SA.$('#tOut'); if (testOn){ testOn(); return; }
    if (!SA.A.ctx) SA.A.unlock();
    if (!(await SA.M.breathOpen())){ out.textContent = 'Микрофон не открылся — разрешите доступ к микрофону.'; return; }
    let air = 0, voice = 0, loudMs = 0, on = true, last = SA.now(); const sum = {n: 0, per: 0, hi: 0, low: 0, lift: 0};
    testOn = () => { on = false; testOn = null; SA.M.breathClose(); out.innerHTML = `Итог: выдох ${(air/1000).toFixed(1)} с, голос ${(voice/1000).toFixed(1)} с, громко ${(loudMs/1000).toFixed(1)} с.` + (sum.n ? `<br><span class="muted">для Claude: тон ${(sum.per/sum.n).toFixed(2)}, верх ${(sum.hi/sum.n).toFixed(2)}, низ ${(sum.low/sum.n).toFixed(2)}, над фоном ${(sum.lift/sum.n).toFixed(0)} дБ</span>` : ''); SA.$('#tBreath').textContent = 'проверить дыхание'; };
    SA.$('#tBreath').textContent = 'остановить';
    const loop = () => { if (!on) return; requestAnimationFrame(loop); const now = SA.now(), dt = now - last; last = now; const f = SA.M.breathFrame();
      if (f.air) air += dt; if (f.voice) voice += dt;
      const ff = f.f || {}; if (f.loud) loudMs += dt;
      if (f.loud && ff.per !== undefined){ sum.n++; sum.per += ff.per; sum.hi += ff.hi; sum.low += ff.low; sum.lift += f.db - f.floor; }
      out.innerHTML = `<b style="color:${f.air ? '#1f8a5a' : '#bbb'}">● выдох</b> &nbsp; <b style="color:${f.voice ? '#2f80ed' : '#bbb'}">● голос</b> &nbsp; громкость ${Math.round(f.db)} дБ (фон ${Math.round(f.floor ?? 0)})
        · всего: выдох ${(air/1000).toFixed(1)} с, голос ${(voice/1000).toFixed(1)} с, громко ${(loudMs/1000).toFixed(1)} с
        <br><span class="muted">для Claude: тон ${(ff.per ?? 0).toFixed(2)} · верх ${(ff.hi ?? 0).toFixed(2)} · низ ${(ff.low ?? 0).toFixed(2)}${sum.n ? ` · в среднем пока громко: тон ${(sum.per/sum.n).toFixed(2)}, верх ${(sum.hi/sum.n).toFixed(2)}, низ ${(sum.low/sum.n).toFixed(2)}, над фоном ${(sum.lift/sum.n).toFixed(0)} дБ` : ''}</span>`; };
    loop();
  }
  /* живая проверка камеры: какие позы видит (только для взрослого) */
  async function testCam(){
    const out = SA.$('#tOut');
    if (SA.C.on){ SA.C.stop(); out.textContent = ''; SA.$('#tCam').textContent = 'проверить камеру'; return; }
    const host = SA.el('div', ''); host.style.cssText = 'width:240px;height:180px;position:relative;border-radius:12px;overflow:hidden;margin:8px 0;transform:scaleX(-1)'; out.innerHTML = ''; out.appendChild(host);
    const info = SA.el('div', ''); out.appendChild(info);
    if (!(await SA.C.start(host))){ info.textContent = 'Камера не включилась — разрешите доступ к камере.'; return; }
    host.querySelector('video').style.cssText = 'width:100%;height:100%;object-fit:cover';
    SA.$('#tCam').textContent = 'выключить камеру';
    const names = {smile: 'улыбка', kiss: 'трубочка', open_wide: 'рот широко', cheeks: 'щёки'};
    const loop = () => { if (!SA.C.on) return; requestAnimationFrame(loop); const s = SA.C.scores || {};
      info.innerHTML = !SA.C.ready ? 'распознавание загружается…' : !SA.C.face ? 'лица не видно' :
        Object.entries(names).map(([k, n]) => `<b style="color:${SA.C.sees(k) ? '#1f8a5a' : '#bbb'}">● ${n}</b>`).join(' &nbsp; ') +
        `<br><span class="muted">щёки: ${s._ratio ? Math.round((s._ratio - 1)*100) + ' % шире спокойного лица (порог ' + Math.round(SA.C.cheekThr*100) + ' %)' : 'запоминаю спокойное лицо…'}</span>`; };
    loop();
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
