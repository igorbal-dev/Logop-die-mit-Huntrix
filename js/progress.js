/* Прогресс и настройки — только на этом устройстве (localStorage 'speech-academy').
   {v, settings: {minutes, eggTarget, rewardName, rewardImg}, egg: {filled, earned}, sessions: [...], next}
   Каждое задание сохраняется сразу, поэтому закрытое посреди занятие ничего не теряет. */
(function(){
  const KEY = 'speech-academy';
  const DEF = {v: 1, settings: {minutes: 15, eggTarget: 2, rewardName: 'Kinder Überraschung', rewardImg: null}, egg: {filled: 0, earned: 0}, sessions: [], next: 1};
  const P = SA.P = {
    load(){
      let d = null; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){}
      d = Object.assign({}, structuredClone(DEF), d || {});
      d.settings = Object.assign({}, DEF.settings, d.settings || {});
      d.egg = Object.assign({}, DEF.egg, d.egg || {});
      return d;
    },
    save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch(e){ return false; } },
    settings(){ return P.load().settings; },
    setSetting(k, v){ const d = P.load(); d.settings[k] = v; return P.save(d); },
    reset(){ try { localStorage.removeItem(KEY); } catch(e){} },

    /* текущее занятие */
    cur: null,
    begin(num, plannedSec){
      const d = P.load();
      P.cur = {n: num, idx: d.sessions.length, date: new Date().toISOString(), plannedSec, durSec: 0, completed: false, early: false, egg: false, items: []};
      d.sessions.push(P.cur); P.save(d);
      P._t0 = SA.now();
    },
    _flush(){
      if (!P.cur) return;
      P.cur.durSec = Math.round((SA.now() - P._t0)/1000);
      const d = P.load(); d.sessions[P.cur.idx] = P.cur; P.save(d);
    },
    /* одно задание: {block, id, kind, result, attempts, mark} — mark ставит родитель (ok / hard) */
    item(rec){ if (!P.cur) return null; rec.t = Math.round((SA.now() - P._t0)/1000); P.cur.items.push(rec); P._flush(); return rec; },
    mark(rec, m){ if (!rec) return; rec.mark = m; P._flush(); },
    /* конец: completed — дошли до итога; early — «закончить раньше». Яйцо — за законченное или пройденное больше чем наполовину */
    finish(early){
      if (!P.cur) return {egg: false};
      P.cur.durSec = Math.round((SA.now() - P._t0)/1000);
      P.cur.completed = !early; P.cur.early = !!early;
      const d = P.load();
      const counts = !early || P.cur.durSec >= P.cur.plannedSec*0.5;
      let full = false;
      if (counts){
        P.cur.egg = true; d.egg.filled += 1;
        if (d.egg.filled >= d.settings.eggTarget){ full = true; d.egg.earned += 1; }
        d.next = (d.next || 1) + 1;
      }
      d.sessions[P.cur.idx] = P.cur; P.save(d);
      const res = {egg: counts, full, filled: d.egg.filled, target: d.settings.eggTarget};
      P.cur = null;
      return res;
    },
    /* после показа полного яйца — начинаем новое */
    emptyEgg(){ const d = P.load(); d.egg.filled = 0; P.save(d); }
  };
})();
