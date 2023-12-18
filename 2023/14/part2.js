const fs = require("fs");

const directions = ["north", "west", "south", "east"];
const cycles = 1000000000;

fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let stones = [];
  lines.forEach((line) => {
    stones.push(line.split(""));
  });

  for (let i = 0; i < cycles; i++) {
    console.log(i);
    stones = shiftStones(stones);
  }
  
  stones.reverse();

  const weight = stones.reduce((acc, curr, idx) => {
    let c = 0;
    curr.forEach((s) => {
      if (s == "O") c++
    });
    acc += c * (idx+1);
    return acc;
  }, 0);
  
  console.log("weight: " + weight);
});

function shiftStones(stones) {
  let done = false;

  directions.forEach(dir => {
    done = false;
    while(!done) {
      let rolled = 0;
      for (let row = 0; row < stones.length; row++ ) {
        for (let col = 0; col < stones[0].length; col++ ) {
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
            if (c < 0 || r < 0 || r >= stones.length || c >= stones[0].length) break;
            if (stones[r][c] == ".") {
              stones[r][c] = "O"
              stones[row][col] = "."
              rolled++
            }
          }
        }
      }
      if (rolled == 0) done = true;
    }
  });
  return stones;
}