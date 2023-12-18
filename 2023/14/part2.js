const fs = require("fs");

const directions = ["north", "west", "south", "east"];
const cycles = 1000000000;

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");
  const width = lines[0].length;

  // parse the input into a 2d array
  let stones = [];
  lines.forEach((line) => {
    stones.push(line.split(""));
  });

  // create an array for the history of how the grid looks and initialize it
  let history = [stones.toString()];
  let cycleStart;
  // repeat until we identify the cycle
  while (true) {
    stones = cycleStones(stones);
    const stoneStr = stones.toString();
    cycleStart = history.indexOf(stoneStr);

    // cycle has been found
    if (cycleStart !== -1) {
      break;
    }

    history.push(stoneStr);
  }

  const cycleLength = history.length - cycleStart;
  const cycleCount = Math.floor((cycles - cycleStart) / cycleLength);
  const remainderStart = cycleStart + cycleCount * cycleLength;
  const offset = cycleStart + cycles - remainderStart;

  // rebuild grid input from history back into a usable array
  let re = new RegExp("(.{" + width + "})", "g");
  let final = history[offset]
    .replaceAll(",", "")
    .replace(re, "$1\r\n")
    .split("\r\n");

  let finalGrid = [];
  final.forEach((line) => {
    finalGrid.push(line.split(""));
  });

  // yes, im lazy
  finalGrid.pop();
  finalGrid.reverse();

  const weight = finalGrid.reduce((acc, curr, idx) => {
    let c = 0;
    curr.forEach((s) => {
      if (s == "O") c++;
    });
    acc += c * (idx + 1);
    return acc;
  }, 0);

  console.log("weight: " + weight);
});

function cycleStones(stones) {
  let done = false;

  directions.forEach((dir) => {
    done = false;
    while (!done) {
      let rolled = 0;
      for (let row = 0; row < stones.length; row++) {
        for (let col = 0; col < stones[0].length; col++) {
          // we have a rolling stone so lets roll it
          if (stones[row][col] == "O") {
            let r = row;
            let c = col;
            if (dir == "north") {
              r -= 1;
            }
            if (dir == "west") {
              c -= 1;
            }
            if (dir == "south") {
              r += 1;
            }
            if (dir == "east") {
              c += 1;
            }
            if (c < 0 || r < 0 || r >= stones.length || c >= stones[0].length)
              continue;
            if (stones[r][c] == ".") {
              stones[r][c] = "O";
              stones[row][col] = ".";
              rolled++;
            }
          }
        }
      }
      if (rolled == 0) done = true;
    }
  });
  return stones;
}
