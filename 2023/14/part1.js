const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let stones = [];
  lines.forEach((line) => {
    stones.push(line.split(""));
  });

  stones = shiftStones(stones);
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

  while(!done) {
    let rolled = 0;

    for (let row = 1; row < stones.length; row++ ) {
      for (let col = 0; col < stones[0].length; col++ ) {
        // we have a rolling stone so lets roll it
        if (stones[row][col] == "O") {
          if (stones[row-1][col] == ".") {
            let r = row - 1; // why do I need to do this?
            stones[r][col] = "O"
            stones[row][col] = "."
            rolled++
          }
        }
      }
    }
    if (rolled == 0) done = true;
  }
  return stones;
}