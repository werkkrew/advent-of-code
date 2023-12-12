const { open } = require("node:fs/promises");

const count = (game) => {
  c = game.winning.reduce(
    (acc, cur) =>
      game.mynums.includes(cur)
        ? Object.assign(acc, { n: acc.n + 1 })
        : Object.assign(acc, { res: acc.res.concat(cur) }),
    { n: 0, res: [] }
  );
  return c;
};

var stack = [];

function card(id, qty, win, my, m) {
  this.id = id;
  this.quantity = qty;
  this.winning = win;
  this.mynums = my;
  this.matches = m;
}

function totalPoints(g) {
  let points = 0;
  let index = 0;
  g.forEach((game) => {
    let c = count(game);
    g[index].matches = c.n;
    let qty = game.quantity;
    if (c.n > 0) {
      points += 2 ** (c.n - 1) * qty;
    }
    index++;
  });
  return points;
}

myFileReader();
async function myFileReader() {
  const file = await open("./data.txt");
  for await (const line of file.readLines()) {
    let id = parseInt(/^Card\ *(\d+):/.exec(line)[1]);

    let numbers = line.split(":")[1].split("|");

    let win = Array.from(
      numbers[0].trim().matchAll(/(\d+)/g),
      (match) => match[1]
    );
    let my = Array.from(
      numbers[1].trim().matchAll(/(\d+)/g),
      (match) => match[1]
    );
    let game = new card(id, 1, win, my, 0);

    stack.push(game);
  }

  console.log("Part 1: " + totalPoints(stack));
}
