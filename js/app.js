// ===== Mystic Tarot app =====
(() => {
"use strict";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// ---- 状態 ----
let currentSpread = null;
let drawn = [];        // [{card, reversed, flipped}]
let useReversed = true;

// ---- 画面遷移 ----
function showScreen(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#screen-" + id).classList.add("active");
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.screen === id));
  window.scrollTo(0, 0);
}
$$(".tab").forEach(t => t.addEventListener("click", () => showScreen(t.dataset.screen)));
$$(".back-btn").forEach(b => b.addEventListener("click", () => showScreen(b.dataset.back)));

// ---- スプレッド一覧 ----
const spreadList = $("#spread-list");
SPREADS.forEach(sp => {
  const div = document.createElement("div");
  div.className = "spread-card";
  div.innerHTML = `
    <div class="spread-icon">${sp.icon}</div>
    <div class="spread-info">
      <h3>${sp.short}<span class="cards-n">${sp.n}枚</span></h3>
      <p>${sp.desc}</p>
    </div>`;
  div.addEventListener("click", () => {
    currentSpread = sp;
    $("#q-spread-name").textContent = sp.name;
    $("#q-spread-desc").textContent = sp.desc;
    $("#question-input").value = "";
    showScreen("question");
  });
  spreadList.appendChild(div);
});

// ---- シャッフル開始 ----
$("#start-shuffle").addEventListener("click", () => {
  useReversed = $("#reversed-toggle").checked;
  showScreen("shuffle");
  const deck = $("#shuffle-deck");
  deck.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const d = document.createElement("div");
    d.className = "s-card";
    d.innerHTML = cardBackSVG();
    deck.appendChild(d);
  }
  const msgs = ["心の中で質問を思い浮かべてください…", "カードを混ぜています…", "あなたのカードを選んでいます…"];
  let mi = 0;
  $("#shuffle-msg").textContent = msgs[0];
  const timer = setInterval(() => {
    mi++;
    if (mi < msgs.length) { $("#shuffle-msg").textContent = msgs[mi]; }
    else { clearInterval(timer); dealCards(); }
  }, 1300);
});

// ---- ドロー ----
function dealCards() {
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {   // Fisher–Yates
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  drawn = deck.slice(0, currentSpread.n).map(card => ({
    card,
    reversed: useReversed && Math.random() < 0.5,
    flipped: false
  }));
  renderBoard();
  showScreen("reading");
}

// ---- 盤面描画 ----
function renderBoard() {
  $("#r-spread-name").textContent = currentSpread.name;
  const q = $("#question-input").value.trim();
  const qEl = $("#r-question");
  qEl.textContent = q ? "問い:" + q : "";
  qEl.classList.toggle("hidden", !q);
  $("#r-hint").textContent = "カードをタップしてめくってください";
  $("#summary").classList.add("hidden");

  const board = $("#board");
  board.innerHTML = "";
  board.className = "board";

  const makeSlot = (i, extraClass = "") => {
    const d = drawn[i];
    const pos = currentSpread.positions[i];
    const slot = document.createElement("div");
    slot.className = "slot " + extraClass;
    slot.innerHTML = `
      <div class="card-flip" data-i="${i}">
        <div class="card-inner">
          <div class="card-face card-back">${cardBackSVG()}</div>
          <div class="card-face card-front ${d.reversed ? "rev" : ""}">${cardFaceSVG(d.card)}</div>
        </div>
      </div>
      <div class="slot-label"><b>${i + 1}. ${pos.key}</b><span class="slot-name"></span></div>`;
    slot.querySelector(".card-flip").addEventListener("click", () => onCardTap(i, slot));
    return slot;
  };

  if (currentSpread.layout === "celtic") {
    board.classList.add("celtic-board");
    drawn.forEach((d, i) => {
      const c = CELTIC_COORDS[i];
      const slot = makeSlot(i, c.cross ? "cross-slot" : "");
      slot.style.left = c.x + "%";
      slot.style.top = c.y + "%";
      if (c.cross) slot.style.zIndex = 2;
      board.appendChild(slot);
    });
  } else if (currentSpread.layout === "choice") {
    board.classList.add("flex-board");
    // 上段: Aの結果・Bの結果 / 下段: Aの状況・現在・Bの状況
    const order = [[3, 4], [1, 0, 2]];
    order.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.style.cssText = "display:flex;justify-content:center;gap:4%;width:100%;margin-bottom:14px;";
      row.forEach(i => {
        const s = makeSlot(i);
        s.style.width = "27%"; s.style.maxWidth = "130px";
        rowDiv.appendChild(s);
      });
      board.appendChild(rowDiv);
    });
  } else {
    board.classList.add("flex-board");
    if (currentSpread.n === 1) board.classList.add("single");
    drawn.forEach((d, i) => board.appendChild(makeSlot(i)));
  }
}

// ---- カードタップ ----
function onCardTap(i, slot) {
  const d = drawn[i];
  if (!d.flipped) {
    d.flipped = true;
    slot.querySelector(".card-flip").classList.add("flipped");
    const label = slot.querySelector(".slot-name");
    label.textContent = d.card.name;
    if (d.reversed) {
      const mark = document.createElement("span");
      mark.className = "rev-mark";
      mark.textContent = "逆位置";
      slot.querySelector(".slot-label").appendChild(mark);
    }
    setTimeout(() => openCardModal(d, currentSpread.positions[i], i), 750);
    if (drawn.every(x => x.flipped)) {
      $("#r-hint").textContent = "カードを再タップすると解説をもう一度読めます";
      setTimeout(renderSummary, 1200);
    }
  } else {
    openCardModal(d, currentSpread.positions[i], i);
  }
}

// ---- カード解説モーダル ----
function openCardModal(d, pos, index) {
  const c = d.card;
  const rev = d.reversed;
  const kws = rev ? c.kwR : c.kw;
  const isMajor = c.arcana === "major";
  const meaning = rev ? c.rev : c.up;

  let loveWork = "";
  if (isMajor) {
    loveWork = `
      <p class="sub">💘 <b>恋愛:</b>${rev ? c.revLove : c.upLove}</p>
      <p class="sub">💼 <b>仕事:</b>${rev ? c.revWork : c.upWork}</p>`;
  }

  const storyHtml = isMajor
    ? `<div class="m-section"><h4>カードの物語と象徴</h4><p>${c.story}</p></div>`
    : `<div class="m-section"><h4>カードについて</h4>
        <p>${SUITS[c.suit].desc}</p>
        <p class="sub">🔢 <b>数の意味:</b>${RANK_MEANINGS[c.rank]}</p></div>`;

  const posHtml = pos
    ? `<div class="m-posguide">📍 <b>「${pos.key}」の位置:</b>${pos.guide}</div>`
    : "";

  $("#modal-body").innerHTML = `
    ${pos ? `<span class="m-position">${index + 1}. ${pos.key}</span>` : ""}
    <div class="m-head">
      <svg-wrap></svg-wrap>
      <div class="m-title">
        <h2>${c.name}</h2>
        <div class="en">${c.en}</div>
        <span class="orient ${rev ? "rev" : "up"}">${rev ? "逆位置(リバース)" : "正位置"}</span>
        <div class="m-kw">${kws.map(k => `<span>${k}</span>`).join("")}</div>
      </div>
    </div>
    ${storyHtml}
    <div class="m-section">
      <h4>${rev ? "逆位置の意味" : "正位置の意味"}</h4>
      <p>${meaning}</p>
      ${loveWork}
    </div>
    <div class="m-section">
      <h4>${rev ? "参考:正位置の意味" : "参考:逆位置の意味"}</h4>
      <p class="sub">${rev ? c.up : c.rev}</p>
    </div>
    ${posHtml}
    <div class="m-advice">🕯️ <b>アドバイス:</b>${c.advice}</div>`;

  // SVG挿入(rotate用クラス付き)
  const wrap = $("#modal-body svg-wrap");
  const span = document.createElement("span");
  span.innerHTML = cardFaceSVG(c);
  const svg = span.firstElementChild;
  if (rev) svg.classList.add("rev");
  wrap.replaceWith(svg);

  $("#modal").classList.remove("hidden");
  $(".modal-sheet").scrollTop = 0;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#modal").classList.add("hidden");
  document.body.style.overflow = "";
}
$(".modal-close").addEventListener("click", closeModal);
$(".modal-backdrop").addEventListener("click", closeModal);

// ---- 総合リーディング ----
function renderSummary() {
  const sum = $("#summary");
  const majors = drawn.filter(d => d.card.arcana === "major").length;
  const revs = drawn.filter(d => d.reversed).length;
  const n = drawn.length;
  const suitCount = {};
  drawn.forEach(d => { if (d.card.suit) suitCount[d.card.suit] = (suitCount[d.card.suit] || 0) + 1; });

  const lines = [];

  if (n >= 3) {
    if (majors / n >= 0.5) {
      lines.push(`大アルカナが${majors}枚と多く出ています。これは、あなたの意志を超えた<b>大きな運命の流れ</b>が動いているサイン。出来事の一つひとつに重要な意味があります。`);
    } else if (majors === 0) {
      lines.push(`今回は小アルカナのみの展開です。運命的な大事件というより、<b>日常の中の選択や行動</b>で流れを変えられる状況を示しています。`);
    }
    const domSuit = Object.entries(suitCount).sort((a, b) => b[1] - a[1])[0];
    if (domSuit && domSuit[1] >= Math.max(2, Math.ceil(n * 0.4))) {
      const s = SUITS[domSuit[0]];
      lines.push(`${s.name}(${s.element}のスート)が${domSuit[1]}枚。この問題の中心テーマは<b>「${s.theme}」</b>にありそうです。`);
    }
    if (revs / n >= 0.6) {
      lines.push(`逆位置が${revs}枚と多めです。エネルギーが内側にこもり、<b>見直し・調整の時期</b>であることを示しています。焦って動くより、態勢を整えることが吉。`);
    } else if (revs === 0 && useReversed) {
      lines.push(`全て正位置で出ました。カードのエネルギーが素直に流れており、<b>物事がスムーズに動きやすい</b>状態です。`);
    }
  }

  const listItems = drawn.map((d, i) =>
    `<li><b>${i + 1}. ${currentSpread.positions[i].key}</b> — ${d.card.name}${d.reversed ? "(逆)" : ""}:${(d.reversed ? d.card.kwR : d.card.kw).slice(0, 2).join("・")}</li>`
  ).join("");

  const readingTip = n === 1
    ? "1枚引きは「今のあなたに一番必要なメッセージ」。キーワードを今日一日、心のどこかに置いてみてください。"
    : "複数のカードは1枚ずつ読んだあと、物語として繋げるのがコツです。位置の意味(下の一覧)に沿って、「過去がこうだから、今こうなっていて…」と声に出してみましょう。";

  sum.innerHTML = `
    <h3>✦ 総合リーディング ✦</h3>
    ${lines.map(l => `<p>${l}</p>`).join("")}
    <ul class="sum-list">${listItems}</ul>
    <p style="font-size:12.5px;color:var(--text-dim)">${readingTip}</p>
    <button class="primary-btn" id="again-btn">もう一度占う</button>
    <button class="ghost-btn" id="home-btn">スプレッド選択に戻る</button>`;
  sum.classList.remove("hidden");
  $("#again-btn").addEventListener("click", () => { showScreen("shuffle"); $("#start-shuffle").click(); });
  $("#home-btn").addEventListener("click", () => showScreen("home"));
}

// ---- 図鑑 ----
const dictGrid = $("#dict-grid");
function renderDict(filter) {
  dictGrid.innerHTML = "";
  ALL_CARDS.filter(c => {
    if (filter === "all") return true;
    if (filter === "major") return c.arcana === "major";
    return c.suit === filter;
  }).forEach(c => {
    const d = document.createElement("div");
    d.className = "dict-item";
    d.innerHTML = cardFaceSVG(c) + `<div class="d-name">${c.name}</div>`;
    d.addEventListener("click", () => openCardModal({ card: c, reversed: false }, null, 0));
    dictGrid.appendChild(d);
  });
}
renderDict("all");
$$("#dict-filters .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $$("#dict-filters .chip").forEach(x => x.classList.remove("active"));
    chip.classList.add("active");
    renderDict(chip.dataset.filter);
  });
});

// ---- 学ぶ ----
$("#learn-content").innerHTML = `
<div class="learn-block">
  <h3>🃏 タロットカードとは</h3>
  <p>タロットは78枚のカードで構成される、数百年の歴史を持つ占いの道具です。カードの絵柄に込められた象徴を通して、今の状況を整理し、気づきを得るための「心の鏡」と考えると分かりやすいでしょう。</p>
  <p class="dim">未来を100%言い当てる魔法ではなく、「このままの流れだとこうなりやすい。ではどうする?」を考えるためのヒント集です。だからこそ、厳しいカードが出ても怖がる必要はありません。</p>
</div>
<div class="learn-block">
  <h3>✨ 大アルカナと小アルカナ</h3>
  <p><b>大アルカナ(22枚)</b>は「愚者」から「世界」まで、人生の大きなテーマや運命的な出来事を表す主役級のカードです。リーディングで出たら特に注目します。</p>
  <p><b>小アルカナ(56枚)</b>は日常の出来事や心の動きを描く、4つのスート(組)からなるカードです。トランプの原型とも言われます。</p>
  <ul>
    <li>🪄 <b>ワンド(火)</b> — 情熱・行動・仕事のエネルギー</li>
    <li>🏆 <b>カップ(水)</b> — 感情・愛情・人間関係</li>
    <li>🗡️ <b>ソード(風)</b> — 思考・決断・試練</li>
    <li>🪙 <b>ペンタクル(地)</b> — お金・成果・現実的な豊かさ</li>
  </ul>
</div>
<div class="learn-block">
  <h3>🔢 数札(1〜10)の読み方のコツ</h3>
  <p>小アルカナの数札は「スートのテーマ × 数の意味」で読めます。数の意味はスートをまたいで共通です。</p>
  <table class="num-table">
    <tr><td>エース</td><td>純粋なエネルギーの種。始まり</td></tr>
    <tr><td>2</td><td>バランス・選択・対話</td></tr>
    <tr><td>3</td><td>最初の成果・拡大</td></tr>
    <tr><td>4</td><td>安定(と停滞の入り口)</td></tr>
    <tr><td>5</td><td>変化・葛藤・試練</td></tr>
    <tr><td>6</td><td>調和の回復・分かち合い</td></tr>
    <tr><td>7</td><td>試行錯誤・見直し</td></tr>
    <tr><td>8</td><td>力の集中・大きな動き</td></tr>
    <tr><td>9</td><td>到達目前の充実または重圧</td></tr>
    <tr><td>10</td><td>サイクルの完成</td></tr>
  </table>
  <p class="dim" style="margin-top:8px">例:「カップ(感情)の2(対話)」=心の通い合い。「ソード(思考)の5(葛藤)」=不毛な争い。</p>
</div>
<div class="learn-block">
  <h3>👑 人物札(コートカード)</h3>
  <p>各スートには4枚の人物札があります。占いの中では「関係する人物」や「あなたに求められる姿勢」として現れます。</p>
  <ul>
    <li>🪶 <b>ペイジ</b> — 学ぶ人。始まりの知らせ、初心者の熱意</li>
    <li>🐎 <b>ナイト</b> — 動く人。行動力、スピード</li>
    <li>👸 <b>クイーン</b> — 育む人。内面の成熟、受容力</li>
    <li>🤴 <b>キング</b> — 極めた人。統率力、完成された力</li>
  </ul>
</div>
<div class="learn-block">
  <h3>🔄 正位置と逆位置</h3>
  <p>カードが正しい向きで出れば<b>正位置</b>、逆さまなら<b>逆位置</b>。逆位置は「悪い意味」ではなく、そのカードのエネルギーが<b>弱まる・過剰になる・内側にこもる・遅れる</b>と読みます。</p>
  <p class="dim">慣れないうちは設定で逆位置をオフにして、正位置だけで占うのも正式なやり方のひとつです。</p>
</div>
<div class="learn-block">
  <h3>🔮 良い質問の立て方</h3>
  <p>タロットは「YES/NOの機械」より「状況を映す鏡」が得意です。質問は少し開いた形にすると、答えが受け取りやすくなります。</p>
  <ul>
    <li>△「彼と付き合えますか?」</li>
    <li>◎「彼との関係を良くするために、私は何を知るべき?」</li>
    <li>△「転職すべきですか?」</li>
    <li>◎「転職を考えている今の状況と、進むならどんな心構えが必要?」</li>
  </ul>
</div>
<div class="learn-block">
  <h3>🌙 占うときの心構え</h3>
  <ul>
    <li>同じ質問を何度も引き直さない(最初の答えが濁ります)</li>
    <li>怖いカード(死神・塔など)は「変化のサイン」。悪い予言ではありません</li>
    <li>健康・法律・お金の重大な判断は、必ず専門家にも相談を</li>
    <li>カードの解説はヒント。最後に意味を決めるのは、あなた自身の直感です</li>
  </ul>
</div>`;

})();
