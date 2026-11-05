/* Прогресс и настройки — только на этом устройстве (localStorage 'speech-academy').
   {v: 2, settings, egg: {filled, earned}, prog: {lesson, cycle, done: [5 × bool]}, sessions: [запуски упражнений]}
   Урок = 5 упражнений; каждое сделанное упражнение сохраняется сразу (можно продолжить с того же места).
   Урок сделан целиком → часть яйца, открывается следующий урок. Каждое задание внутри упражнения тоже пишется сразу. */
(function(){
  const KEY = 'speech-academy';
  const DEF = {v: 2, settings: {minutes: 15, eggTarget: 2, rewardName: 'Kinder Überraschung', rewardImg: null, breathSens: 1}, egg: {filled: 0, earned: 0},
    prog: {lesson: 1, cycle: 0, done: [false, false, false, false, false], k: 0, kind: 'general', snd: null},
    /* программа по звукам: list — трудные звуки (родитель), st[код] = {stage, log: [{stage, date}]}, next — чей черёд */
    snd: {list: [], st: {}, next: 0}, sessions: []};
  const P = SA.P = {
    load(){
      let d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){}
      d = Object.assign({}, structuredClone(DEF), d || {});
      d.settings = Object.assign({}, DEF.settings, d.settings || {});
      d.egg = Object.assign({}, DEF.egg, d.egg || {});
      d.prog = Object.assign({}, structuredClone(DEF.prog), d.prog || {});
      d.snd = Object.assign({}, structuredClone(DEF.snd), d.snd || {});
      return d;
    },
    save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch(e){ return false; } },
    settings(){ return P.load().settings; },
    setSetting(k, v){ const d = P.load(); d.settings[k] = v; return P.save(d); },
    reset(){ try { localStorage.removeItem(KEY); } catch(e){} },
    prog(){ return P.load().prog; },
    /* родитель выбирает урок (например, повторить); сделанное в нём обнуляется */
    setLesson(n){ const d = P.load(); d.prog = Object.assign(d.prog, {lesson: n, done: [false, false, false, false, false], kind: 'general', snd: null}); P.save(d); },
    /* ---------- программа по звукам ---------- */
    sndStage(code){ const d = P.load(), S = SA.SOUNDS[code], st = d.snd.st[code]; return st && S.stages.includes(st.stage) ? st.stage : S.stages[0]; },
    /* родитель выбрал трудные звуки. Если текущий урок ещё не начат — он сразу становится уроком нужного звука */
    setSounds(list){
      const d = P.load(); d.snd.list = list.filter(c => SA.SOUNDS[c]);
      for (const c of d.snd.list) if (!d.snd.st[c]) d.snd.st[c] = {stage: SA.SOUNDS[c].stages[0], log: [{stage: SA.SOUNDS[c].stages[0], date: new Date().toISOString()}]};
      if (!d.prog.done.some(Boolean)){ P._plan(d, true); }
      else if (d.prog.kind === 'sound' && !d.snd.list.includes(d.prog.snd)) d.prog.done = [false, false, false, false, false], P._plan(d, true);
      P.save(d);
    },
    setStage(code, stage){ const d = P.load(); const st = d.snd.st[code] = d.snd.st[code] || {log: []}; st.stage = stage; st.log.push({stage, date: new Date().toISOString(), by: 'parent'}); P.save(d); },
    /* какой урок следующий: если есть трудные звуки — два урока звуков, потом один общий (для разнообразия) */
    _plan(d, now){
      const L = d.snd.list;
      if (L.length && (now || d.prog.k % 3 !== 2)){ d.prog.kind = 'sound'; d.prog.snd = L[d.snd.next % L.length]; d.snd.next++; }
      else { d.prog.kind = 'general'; d.prog.snd = null; }
    },
    /* итог звука по урокам: [{lid, stage, ok, hard, tapOk, taps, date}] — по отметкам родителя (в том числе поставленным потом) */
    sndLessons(code){
      const d = P.load(), by = {};
      d.sessions.forEach(s => { if (s.snd !== code) return; const r = by[s.lid] = by[s.lid] || {lid: s.lid, stage: s.stage, ok: 0, hard: 0, tapOk: 0, taps: 0, date: s.date};
        for (const it of s.items){ if (it.snd !== code || it.stage !== s.stage) continue;
          if (it.kind === 'tap'){ r.taps++; if (it.result === 'ok') r.tapOk++; }
          else if (it.mark === 'ok') r.ok++; else if (it.mark === 'hard') r.hard++; } });
      return Object.values(by).sort((a, b) => a.lid - b.lid);
    },
    /* переход на следующий этап: два урока подряд (с данными) ≥ 80 % (≥ 4 отметок / ≥ 5 ответов на слух) */
    sndEval(code){
      const d = P.load(), S = SA.SOUNDS[code], cur = P.sndStage(code);
      const pass = r => r.stage === 'hoeren' ? r.taps >= 5 && r.tapOk/r.taps >= 0.8 : r.ok + r.hard >= 4 && r.ok/(r.ok + r.hard) >= 0.8;
      const has = r => r.stage === 'hoeren' ? r.taps >= 5 : r.ok + r.hard >= 4;
      const since = (d.snd.st[code] && d.snd.st[code].log || []).filter(x => x.stage === cur).slice(-1)[0];
      const rs = P.sndLessons(code).filter(r => r.stage === cur && has(r) && (!since || r.date >= since.date));
      const last2 = rs.slice(-2);
      if (last2.length === 2 && last2.every(pass)){
        const i = S.stages.indexOf(cur);
        if (i < S.stages.length - 1){ const st = d.snd.st[code]; st.stage = S.stages[i + 1]; st.log.push({stage: st.stage, date: new Date().toISOString()}); P.save(d); return st.stage; }
      }
      return null;
    },
    /* отметка родителя «потом» (по записи в родительском разделе) */
    markAt(si, ii, m){ const d = P.load(), it = d.sessions[si] && d.sessions[si].items[ii]; if (!it) return; it.mark = m; P.save(d); const s = d.sessions[si]; if (s.snd) P.sndEval(s.snd); },

    /* один запуск упражнения: {n: урок, ex, date, durSec, completed, items} */
    cur: null,
    begin(lesson, ex, plannedSec){
      const d = P.load();
      P.cur = {n: lesson, ex, idx: d.sessions.length, date: new Date().toISOString(), plannedSec, durSec: 0, completed: false, items: [], lid: d.prog.k};
      if (d.prog.kind === 'sound' && d.prog.snd){ P.cur.snd = d.prog.snd; P.cur.stage = P.sndStage(d.prog.snd); }
      d.sessions.push(P.cur); P.save(d);
      P._t0 = SA.now();
    },
    _flush(){
      if (!P.cur) return;
      P.cur.durSec = Math.round((SA.now() - P._t0)/1000);
      const d = P.load(); d.sessions[P.cur.idx] = P.cur; P.save(d);
    },
    item(rec){ if (!P.cur) return rec; rec.t = Math.round((SA.now() - P._t0)/1000); rec.at = [P.cur.idx, P.cur.items.length]; P.cur.items.push(rec); P._flush(); return rec; },
    mark(rec, m){ if (!rec) return; rec.mark = m; P._flush(); },
    /* упражнение закончено (completed) или прервано */
    end(completed, exIndex){
      if (!P.cur) return;
      P.cur.durSec = Math.round((SA.now() - P._t0)/1000); P.cur.completed = !!completed;
      const d = P.load(); d.sessions[P.cur.idx] = P.cur;
      if (completed) d.prog.done[exIndex] = true;
      P.save(d); P.cur = null;
    },
    /* все 5 упражнений урока сделаны → часть яйца и следующий урок (после последнего — снова 1-й, «сложнее») */
    lessonDone(total){
      const d = P.load();
      d.egg.filled += 1; let full = false;
      if (d.egg.filled >= d.settings.eggTarget){ full = true; d.egg.earned += 1; }
      const was = d.prog, up = was.kind === 'sound' && was.snd ? was.snd : null;
      let n = was.lesson, cycle = was.cycle;
      if (was.kind !== 'sound'){ n++; if (n > total){ n = 1; cycle++; } }
      d.prog = Object.assign(was, {lesson: n, cycle, done: [false, false, false, false, false], k: (was.k || 0) + 1});
      P._plan(d);
      P.save(d);
      const stageUp = up ? P.sndEval(up) : null;
      return {full, filled: d.egg.filled, target: d.settings.eggTarget, stageUp};
    },
    emptyEgg(){ const d = P.load(); d.egg.filled = 0; P.save(d); }
  };
  /* Записи попыток Эмили — только на этом устройстве (IndexedDB), чтобы родитель мог послушать и отметить потом.
     Хранятся последние 120; ключ — «номер запуска:номер задания». */
  const DB = () => new Promise((res, rej) => { const r = indexedDB.open('sa-rec', 1); r.onupgradeneeded = () => r.result.createObjectStore('rec'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const tx = async (mode, fn) => { const db = await DB(); return new Promise((res, rej) => { const t = db.transaction('rec', mode), st = t.objectStore('rec'); const out = fn(st); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }); };
  SA.Rec = {
    async put(key, blob){ try { await tx('readwrite', st => st.put(blob, key)); const keys = await tx('readonly', st => st.getAllKeys());
      const sorted = keys.sort((a, b) => { const [a1, a2] = a.split(':').map(Number), [b1, b2] = b.split(':').map(Number); return a1 - b1 || a2 - b2; });
      if (sorted.length > 120) await tx('readwrite', st => { sorted.slice(0, sorted.length - 120).forEach(k => st.delete(k)); }); } catch(e){} },
    async get(key){ try { return await tx('readonly', st => st.get(key)); } catch(e){ return null; } },
    async keys(){ try { return await tx('readonly', st => st.getAllKeys()); } catch(e){ return []; } },
    async clear(){ try { await tx('readwrite', st => st.clear()); } catch(e){} }
  };
})();
