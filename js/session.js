/* Занятие: блоки по порядку, у каждого своя доля времени. Длительность из настроек (10–30 мин, по умолчанию 15):
   доли растягиваются, в блок набирается столько заданий, сколько влезает. Активность меняется каждые 2–4 минуты.
   Структура (15 мин): ритуал 0:45 · дыхание 2:00 · зеркало 2:00 · танец 0:20 · слушаем 3:00 · говорим 4:00 · танец 0:20 · игра 2:00 · итог 0:45.
   Гимнастика — разминка; больше всего времени — слушание и произнесение настоящих звуков и слов. */
(function(){
  const X = SA.X, P = SA.P;

  /* Занятие 1 «Hallo, Speech Academy!»: знакомство, ритуал, все форматы; гласные и звукоподражания (доступно без знания немецкого) */
  function plan1(min){
    const k = min/15;
    const B = (id, sec, run, fixed) => ({id, sec: fixed ? sec : Math.round(sec*k), run});
    const blocks = [
      B('ritual', 45, () => X.ritual(), true),
      B('breath', 120, async b => {
        await X.breathHello();
        const seq = [X.dandelion, X.candles]; let i = 0;
        do { await seq[i % 2]({level: i >= 2 ? 1 : 0}); i++; } while (i < 2 || b.left() > 35);
      }),
      B('mirror', 120, async b => {
        await X.mirrorStart();
        try {
          const ex = ['frosch', 'kuss', 'loewe', 'hamster']; let i = 0;
          do { await X.exercise(ex[i % 4], {level: i >= 4 ? 1 : 0}); i++; } while (i < 2 || (i < 4 ? b.left() > 15 : b.left() > 30));
        } finally { await X.mirrorStop(); }
      }),
      B('dance1', 20, () => X.dance(1, 20), true),
      B('listen', 180, async b => {
        await X.listenHello();
        await X.animalsIntro();
        let r = 0; while (r < 2 || (b.left() > b.sec*0.5 && r < 8)){ await X.whoRound({level: r >= 4 ? 1 : 0}); r++; }
        await X.sameIntro();
        const pairs = SA.shuffle([true, false, true, false, false, true, true, false]);
        let j = 0; while (j < 2 || (b.left() > 20 && j < pairs.length)){ await X.sameRound(pairs[j]); j++; }
        await X.listenBye();
      })
    ];
    if (min >= 20) blocks.push(B('dance3', 20, () => X.dance(3, 20), true));
    blocks.push(
      B('speak', 240, async b => {
        await X.speakIntro();
        const big = b.sec >= 200;
        /* если Эмили молчит и всё идёт медленно — время блока соблюдаем: гласные ≤ 40 %, звери ≤ 25 %, слова — главное */
        for (const v of (big ? ['a', 'o', 'i', 'u'] : ['a', 'i', 'u'])){ if (b.left() < b.sec*0.6 && v !== 'a') break; await X.vowel(v); }
        await X.tiereIntro();
        const tiere = big ? ['muh', 'maeh', 'wau', 'miau'] : ['muh', 'wau'];
        for (let i = 0; i < tiere.length; i++){ if (b.left() < b.sec*0.35 && i > 0) break; await X.tier(tiere[i], i === 1); }   /* «послушай себя» — один раз сам */
        await X.wordsIntro();
        const ws = X.WORDS;
        for (let i = 0; i < ws.length; i++){ if (b.left() < -45 && i >= 3) break; await X.word(ws[i], i === 2); }
        /* время осталось — ещё круг слов вперемешку */
        let extra = SA.shuffle(ws), e = 0;
        while (b.left() > 25 && e < extra.length){ await X.word(extra[e], false); e++; }
      }),
      B('dance2', 20, () => X.dance(3, 20), true),
      B('game', 120, async b => {
        await X.game(SA.shuffle(X.WORDS));
        if (b.left() > 70) await X.game(SA.shuffle(X.WORDS));
      })
    );
    return blocks;
  }
  SA.PLANS = {1: plan1};

  SA.runSession = async () => {
    const st = P.settings(), min = SA.clamp(+st.minutes || 15, 10, 30);
    const num = 1;                          /* этап 2: готово занятие 1; программа по звукам — этап 3 */
    const plan = SA.PLANS[num](min);
    SA.stopped = false;
    P.begin(num, min*60);
    let early = false;
    try {
      for (const b of plan){
        const t0 = SA.now();
        b.left = () => b.sec - (SA.now() - t0)/1000*SA.SPEED;
        SA.timeLeft = b.left;
        SA.curBlock = b.id;
        await b.run(b);
        X.marks(null); X.earOff();
      }
    } catch(e){
      if (!(e instanceof SA.Stop)) console.error(e);
      early = true;
    }
    SA.stopped = false; SA.timeLeft = null;
    try { SA.C.stop(); } catch(e){}
    X.marks(null); X.earOff(); SA.$('#micring').hidden = true;
    const res = P.finish(early);
    try { await X.finale(res, early); } catch(e){ console.error(e); }
    SA.M.clearRecordings();
    return res;
  };
})();
