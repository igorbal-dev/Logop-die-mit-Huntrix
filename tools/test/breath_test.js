/* Проверка распознавания выдоха (node tools/test/breath_test.js): речь не должна считаться выдохом,
   выдох (вблизи — «ветер» в микрофоне, издалека — «хххх») должен. Речь — записи приложения (assets/snd). */
const {Blow, N} = require('../../js/breath.js');
const {execFileSync} = require('child_process');
const fs = require('fs'), path = require('path');
const SR = 48000;
const dec = f => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 64 << 20}); return new Float32Array(b.buffer, b.byteOffset, b.length/4); };
const gain = (x, db) => { const g = Math.pow(10, db/20); let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); const k = g/(p || 1); return x.map(v => Math.max(-1, Math.min(1, v*k))); };
let seed = 7; const rnd = () => { seed = (seed*1103515245 + 12345) & 0x7fffffff; return seed/0x7fffffff*2 - 1; };
function room(sec, db = -66){ const n = SR*sec, x = new Float32Array(n), g = Math.pow(10, db/20); for (let i = 0; i < n; i++) x[i] = rnd()*g; return x; }
/* «ветер»: коричневый шум + розовый, неровная огибающая (турбулентность) */
function wind(sec, db){ const n = SR*sec, x = new Float32Array(n); let b = 0, p = 0;
  for (let i = 0; i < n; i++){ b = 0.995*b + rnd()*0.06; p = 0.9*p + rnd()*0.1; const t = i/SR, env = Math.min(1, t/0.15)*Math.min(1, (sec - t)/0.2)*(0.7 + 0.3*Math.sin(2*Math.PI*7*t + Math.sin(t*13)));
    x[i] = (b + 0.4*p)*env; } return gain(x, db); }
/* «хххх» издалека: дыхательный шум 300–2500 Гц (полосовой фильтр) */
function bp(x, f0, Q){ const w = 2*Math.PI*f0/SR, al = Math.sin(w)/(2*Q), a0 = 1 + al, a1 = -2*Math.cos(w), a2 = 1 - al; let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x.map(v => { const y = (al*v - al*x2 - a1*y1 - a2*y2)/a0; x2 = x1; x1 = v; y2 = y1; y1 = y; return y; }); }
function hhh(sec, db){ const n = SR*sec; let x = new Float32Array(n).map(() => rnd()); x = bp(bp(x, 1000, 0.7), 1000, 0.7);
  for (let i = 0; i < n; i++){ const t = i/SR; x[i] *= Math.min(1, t/0.1)*Math.min(1, (sec - t)/0.15); } return gain(x, db); }
/* свист (не выдох) */
function whistle(sec, db){ const n = SR*sec, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = Math.sin(2*Math.PI*1800*i/SR); return gain(x, db); }
function run(sig, sens = 1){
  const d = new Blow(SR, sens); const pre = room(1.0); let airMs = 0, voiceMs = 0;
  const all = new Float32Array(pre.length + sig.length + SR*0.3); all.set(pre); all.set(sig, pre.length);
  for (let i = 0; i < all.length; i++) all[i] += rnd()*0.0005;
  const hop = 800, dt = hop/SR*1000;                         /* ~ кадры браузера (каждые ~17 мс) */
  for (let i = 0; i + N <= all.length; i += hop){ const r = d.frame(all.subarray(i, i + N), dt); if (i >= pre.length - N){ if (r.air) airMs += dt; if (r.voice) voiceMs += dt; } }
  return {air: Math.round(airMs), voice: Math.round(voiceMs)};
}
const snd = path.join(__dirname, '../../assets/snd');
const LINES = JSON.parse(fs.readFileSync(path.join(__dirname, '../../content/de/lines.json'), 'utf8')).lines;
/* «ссс/шшш» (synth) и фразы со вставленным звуком ({sch} в say) — это и есть шум, не речь, их не считаем */
const speech = fs.readdirSync(snd).filter(f => f.endsWith('.mp3') && !f.includes('_ru_') && !(LINES[f.slice(0, -4)] || {}).synth && !((LINES[f.slice(0, -4)] || {}).say || '').includes('{')).sort()
  .filter((f, i) => process.env.FULL || i % 4 === 0);          /* быстро: каждая 4-я реплика (≈ 3 мин); FULL=1 — все (≈ 15 мин) */
let worst = [], fp = 0, tot = 0;
for (const db of [-30, -12, -3]) for (const f of speech){ const r = run(gain(dec(path.join(snd, f)), db)); tot++; if (r.air > 0){ fp++; worst.push([r.air, db, f]); } }
worst.sort((a, b) => b[0] - a[0]);
console.log(`РЕЧЬ: ${tot} проверок (${speech.length} реплик × 3 громкости), «выдох» хоть раз: ${fp}; самое большое: ${worst.slice(0, 6).map(w => `${w[2]}@${w[1]}дБ=${w[0]}мс`).join(', ')}`);
for (const db of [-45, -35, -25, -15, -6]){ const a = run(wind(1.5, db)), b = run(hhh(1.5, db)); console.log(`ВЫДОХ ${db} дБ: ветер ${a.air} мс из 1500, «хххх» ${b.air} мс из 1500`); }
console.log('ТИШИНА:', JSON.stringify(run(room(2))), 'СВИСТ -15 дБ:', JSON.stringify(run(whistle(1.5, -15))));
