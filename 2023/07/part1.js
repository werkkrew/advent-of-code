const fs = require("fs");

const cardList = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  let lines = data.split("\r\n");
  let hands = [];

  lines.forEach((line) => {
    line = line.split(" ");
    let hand = {
      cards: line[0],
      bet: parseInt(line[1]),
    };
    hands.push(hand);
  });

  process(hands);
});

function process(hands) {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let cards = hand.cards.split("");
    hand.score = identifyHand(cards);
    hands[i] = hand;
  }

  hands = hands.sort(compareHands);
  let winnings = calculateWinnings(hands);
  console.log(winnings);
}

function identifyHand(cards) {
  const counts = cards.reduce(count, {});
  const dupes = Object.values(counts).reduce(count, {});

  let score =
    (dupes[5] && 7) ||
    (dupes[4] && 6) ||
    (dupes[3] && dupes[2] && 5) ||
    (dupes[3] && 4) ||
    (dupes[2] > 1 && 3) ||
    (dupes[2] && 2) ||
    1;

  return score;
}

function calculateWinnings(hands) {
  let jackpot = 0;
  for (let i = 0; i < hands.length; i++) {
    jackpot += hands[i].bet * (i + 1);
  }
  return jackpot;
}

function count(c, a) {
  c[a] = (c[a] || 0) + 1;
  return c;
}

function compareHands(a, b) {
  const scoreA = a.score;
  const scoreB = b.score;
  const cardsA = a.cards.split("");
  const cardsB = b.cards.split("");

  let comparison = 0;
  if (scoreA > scoreB) {
    comparison = 1;
  } else if (scoreA < scoreB) {
    comparison = -1;
  } else if (scoreA == scoreB) {
    for (let i = 0; i < cardsA.length; i++) {
      let cardA = cardsA[i];
      let cardB = cardsB[i];

      if (cardList.indexOf(cardA) < cardList.indexOf(cardB)) {
        comparison = 1;
        break;
      } else if (cardList.indexOf(cardA) > cardList.indexOf(cardB)) {
        comparison = -1;
        break;
      }
    }
  }
  return comparison;
}
