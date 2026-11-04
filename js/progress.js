/* Прогресс и настройки — только на этом устройстве (localStorage 'speech-academy').
   {v: 2, settings, egg: {filled, earned}, prog: {lesson, cycle, done: [5 × bool]}, sessions: [запуски упражнений]}
   Урок = 5 упражнений; каждое сделанное упражнение сохраняется сразу (можно продолжить с того же места).
   Урок сделан целиком → часть яйца, открывается следующий урок. Каждое задание внутри упражнения тоже пишется сразу. */
(function(){
  const KEY = 'speech-academy';
  const DEF = {v: 2, settings: {minutes: 15, eggTarget: 2, rewardName: 'Kinder Überraschung', rewardImg: null, breathSens: 1}, egg: {filled: 0, earned: 0},
    prog: {lesson: 1, cycle: 0, done: [false, false, false, false, false]}, sessions: []};
  const P = SA.P = {
    load(){
      let d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){}
      d = Object.assign({}, structuredClone(DEF), d || {});
      d.settings = Object.assign({}, DEF.settings, d.settings || {});
      d.egg = Object.assign({}, DEF.egg, d.egg || {});
      d.prog = Object.assign({}, structuredClone(DEF.prog), d.prog || {});
      return d;
    },
    save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch(e){ return false; } },
    settings(){ return P.load().settings; },
    setSetting(k, v){ const d = P.load(); d.settings[k] = v; return P.save(d); },
    reset(){ try { localStorage.removeItem(KEY); } catch(e){} },
    prog(){ return P.load().prog; },
    /* родитель выбирает урок (например, повторить); сделанное в нём обнуляется */
    setLesson(n){ const d = P.load(); d.prog = {lesson: n, cycle: d.prog.cycle, done: [false, false, false, false, false]}; P.save(d); },

    /* один запуск упражнения: {n: урок, ex, date, durSec, completed, items} */
    cur: null,
    begin(lesson, ex, plannedSec){
      const d = P.load();
      P.cur = {n: lesson, ex, idx: d.sessions.length, date: new Date().toISOString(), plannedSec, durSec: 0, completed: false, items: []};
      d.sessions.push(P.cur); P.save(d);
      P._t0 = SA.now();
    },
    _flush(){
      if (!P.cur) return;
      P.cur.durSec = Math.round((SA.now() - P._t0)/1000);
      const d = P.load(); d.sessions[P.cur.idx] = P.cur; P.save(d);
    },
    item(rec){ if (!P.cur) return rec; rec.t = Math.round((SA.now() - P._t0)/1000); P.cur.items.push(rec); P._flush(); return rec; },
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
      let n = d.prog.lesson + 1, cycle = d.prog.cycle;
      if (n > total){ n = 1; cycle++; }
      d.prog = {lesson: n, cycle, done: [false, false, false, false, false]};
      P.save(d);
      return {full, filled: d.egg.filled, target: d.settings.eggTarget};
    },
    emptyEgg(){ const d = P.load(); d.egg.filled = 0; P.save(d); }
  };
})();
