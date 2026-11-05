/* Проверка щелчков языком (node tools/test/click_test.js): щелчки считаются, речь, выдох и тишина — нет. */
const {Click, N} = require('../../js/breath.js');
const {execFileSync} = require('child_process');
const fs = require('fs'), path = require('path');
const SR = 48000;
const dec = f => { const b = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {maxBuffer: 64 << 20}); return new Float32Array(b.buffer, b.byteOffset, b.length/4); };
let seed = 7; const rnd = () => { seed = (seed*1103515245 + 12345) & 0x7fffffff; return seed/0x7fffffff*2 - 1; };
const gain = (x, db) => { const g = Math.pow(10, db/20); let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); const k = g/(p || 1); return x.map(v => v*k); };
const room = (sec, db = -62) => { const g = Math.pow(10, db/20); return new Float32Array(SR*sec).map(() => rnd()*g); };
/* щелчок: затухающий звон 1–2 кГц + шумовой удар, 5–15 мс */
function clicks(n, gapS, db){ const x = room(n*gapS + 0.5); for (let c = 0; c < n; c++){ const s0 = Math.round((0.3 + c*gapS)*SR), f = 1200 + 600*Math.random(), tau = 0.002 + 0.003*Math.random();
  for (let i = 0; i < SR*0.03; i++){ const t = i/SR; x[s0 + i] += Math.pow(10, db/20)*Math.exp(-t/tau)*(Math.sin(2*Math.PI*f*t) + 0.5*rnd()); } } return x; }
function wind(sec, db){ const x = new Float32Array(SR*sec); let b = 0; for (let i = 0; i < x.length; i++){ b = 0.995*b + rnd()*0.06; const t = i/SR; x[i] = b*Math.min(1, t/0.15)*Math.min(1, (sec - t)/0.2); } return gain(x, db); }
function run(sig){ const d = new Click(SR), all = new Float32Array(SR + sig.length); all.set(room(1)); all.set(sig, SR); for (let i = 0; i < all.length; i++) all[i] += rnd()*0.0008;
  let n = 0; const hop = 1440; for (let i = 0; i + N <= all.length; i += hop){ const ev = d.frame(all.subarray(i, i + N), (i + N)/SR*1000); if (i >= SR - N) n += ev.length; } return n; }
for (const db of [-40, -25, -10]) console.log(`ЩЕЛЧКИ ${db} дБ: найдено ${run(clicks(10, 0.4, db))} из 10; быстрые (0,2 с): ${run(clicks(10, 0.2, db))} из 10`);
const snd = path.join(__dirname, '../../assets/snd');
const speech = fs.readdirSync(snd).filter(f => f.endsWith('.mp3')).sort();
let fp = 0, files = 0, bad = [];
for (const f of speech){ const k = run(gain(dec(path.join(snd, f)), -12)); files++; if (k){ fp += k; bad.push(f + '=' + k); } }
console.log(`РЕЧЬ: ${files} записей, ложных щелчков всего ${fp} (${bad.length} записей): ${bad.slice(0, 12).join(', ')}`);
console.log('ВЫДОХ:', [-30, -15, -6].map(db => run(wind(1.5, db))).join(' '), ' ТИШИНА:', run(room(3)));
