// カードのSVGアート生成
const PIP_LAYOUTS = {
  1: [[50,50]],
  2: [[50,26],[50,74]],
  3: [[50,20],[50,50],[50,80]],
  4: [[31,26],[69,26],[31,74],[69,74]],
  5: [[31,26],[69,26],[50,50],[31,74],[69,74]],
  6: [[31,22],[69,22],[31,50],[69,50],[31,78],[69,78]],
  7: [[31,22],[69,22],[50,36],[31,50],[69,50],[31,78],[69,78]],
  8: [[31,20],[69,20],[31,40],[69,40],[31,60],[69,60],[31,80],[69,80]],
  9: [[31,20],[69,20],[31,40],[69,40],[50,50],[31,60],[69,60],[31,80],[69,80]],
  10:[[31,20],[69,20],[50,30],[31,40],[69,40],[31,60],[69,60],[50,70],[31,80],[69,80]]
};
const COURT_EMOJI = { 11:"🪶", 12:"🐎", 13:"👸", 14:"🤴" };
const MINOR_NUMERALS = {1:"ACE",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",10:"X",11:"PAGE",12:"KNIGHT",13:"QUEEN",14:"KING"};

// 裏面
function cardBackSVG() {
  return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-back" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#2d2760"/><stop offset="100%" stop-color="#171334"/>
    </radialGradient>
  </defs>
  <rect width="120" height="200" rx="9" fill="url(#bg-back)"/>
  <rect x="5" y="5" width="110" height="190" rx="6" fill="none" stroke="#d9b45b" stroke-width="1.4"/>
  <rect x="10" y="10" width="100" height="180" rx="4" fill="none" stroke="#d9b45b66" stroke-width="0.8"/>
  <circle cx="60" cy="100" r="34" fill="none" stroke="#d9b45b" stroke-width="1"/>
  <circle cx="60" cy="100" r="26" fill="none" stroke="#d9b45b88" stroke-width="0.7"/>
  <text x="60" y="112" font-size="34" text-anchor="middle">🌙</text>
  <text x="60" y="42" font-size="13" text-anchor="middle">✦</text>
  <text x="60" y="172" font-size="13" text-anchor="middle">✦</text>
  <text x="26" y="105" font-size="10" text-anchor="middle" fill="#d9b45b">✧</text>
  <text x="94" y="105" font-size="10" text-anchor="middle" fill="#d9b45b">✧</text>
</svg>`;
}

// 表面
function cardFaceSVG(card) {
  const isMajor = card.arcana === "major";
  const frameColor = "#b8923f";
  let inner = "";
  let numeral = "";
  let nameJa = card.name;

  if (isMajor) {
    numeral = card.numeral;
    inner = `
      <circle cx="60" cy="88" r="33" fill="#b8923f14" stroke="#b8923f55" stroke-width="0.8"/>
      <text x="60" y="103" font-size="42" text-anchor="middle">${card.emoji}</text>
      <text x="21" y="88" font-size="9" text-anchor="middle" fill="#b8923f99">✦</text>
      <text x="99" y="88" font-size="9" text-anchor="middle" fill="#b8923f99">✦</text>`;
  } else {
    numeral = MINOR_NUMERALS[card.rank];
    const glyph = SUITS[card.suit].glyph;
    if (card.rank === 1) {
      inner = `
        <circle cx="60" cy="88" r="33" fill="#b8923f14" stroke="#b8923f55" stroke-width="0.8"/>
        <text x="60" y="102" font-size="40" text-anchor="middle">${glyph}</text>`;
    } else if (card.rank <= 10) {
      inner = PIP_LAYOUTS[card.rank].map(([px, py]) => {
        const x = 18 + (px / 100) * 84;
        const y = 34 + (py / 100) * 106;
        return `<text x="${x}" y="${y + 6}" font-size="17" text-anchor="middle">${glyph}</text>`;
      }).join("");
    } else {
      inner = `
        <text x="60" y="86" font-size="36" text-anchor="middle">${COURT_EMOJI[card.rank]}</text>
        <text x="60" y="122" font-size="22" text-anchor="middle">${glyph}</text>`;
    }
  }

  const suitBar = isMajor ? "" :
    `<text x="14" y="24" font-size="11">${SUITS[card.suit].glyph}</text>
     <text x="106" y="192" font-size="11" text-anchor="end">${SUITS[card.suit].glyph}</text>`;

  // 和名は下部に(長い名前は縮小)
  const nameSize = nameJa.length > 7 ? 9.5 : 11;

  return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${card.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdf8"/><stop offset="55%" stop-color="#faf4e8"/><stop offset="100%" stop-color="#f6efdf"/>
    </linearGradient>
  </defs>
  <rect width="120" height="200" rx="9" fill="url(#bg-${card.id})"/>
  <rect x="4" y="4" width="112" height="192" rx="6" fill="none" stroke="${frameColor}" stroke-width="1.3"/>
  <line x1="10" y1="30" x2="110" y2="30" stroke="#b8923f55" stroke-width="0.7"/>
  <line x1="10" y1="164" x2="110" y2="164" stroke="#b8923f55" stroke-width="0.7"/>
  <text x="60" y="22" font-size="12" text-anchor="middle" fill="#a07f35" font-family="Georgia, serif" letter-spacing="1">${numeral}</text>
  ${suitBar}
  ${inner}
  <text x="60" y="181" font-size="${nameSize}" text-anchor="middle" fill="#3c3552" font-weight="bold">${nameJa}</text>
  <text x="60" y="192" font-size="5.5" text-anchor="middle" fill="#8d84a3" letter-spacing="0.5">${card.en}</text>
</svg>`;
}
