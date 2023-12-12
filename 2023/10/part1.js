const fs = require("fs");

const directions = ["north", "south", "east", "west"];

// traveling in a direction into a pipe leads where?
const plumbing = {
  north: {
    valid: ["|", "7", "F"],
    "|": "north",
    7: "west",
    F: "east",
  },
  south: {
    valid: ["|", "J", "L"],
    "|": "south",
    J: "west",
    L: "east",
  },
  east: {
    valid: ["-", "7", "J"],
    "-": "east",
    J: "north",
    7: "south",
  },
  west: {
    valid: ["-", "F", "L"],
    "-": "west",
    F: "south",
    L: "north",
  },
};

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  let rowIndex = 0;
  let map = [];

  lines = data.split("\r\n");
  lines.forEach((line) => {
    row = line.split("");
    let colIndex = 0;
    let cols = [];
    row.forEach((col) => {
      symbol = col;
      cols.push(symbol);
      colIndex++;
    });
    map.push(cols);
    rowIndex++;
  });

  //console.log(map)
  map = navigate(map);
});

function navigate(map) {
  let mapped = false;
  let steps = 0;
  let start = startPos(map);
  let position = start;
  let next = [];

  // try to move in every compass direction from the start to see which way we can go
  for (let i = 0; i < directions.length; i++) {
    let dir = directions[i];
    let coords = compass(position, dir);
    let pipe = map[coords[0]][coords[1]];

    // if the direction we are going leads into a valid pipe
    if (plumbing[dir].valid.includes(pipe)) {
      // update our current position
      position = coords;
      // figure out where the pipe leads
      next = plumbing[dir][pipe];
      steps++;
      break;
    }
  }

  // loop until we get back to startpos and traverse the loop in two directions
  while (!mapped) {
    position = compass(position, next);
    if (JSON.stringify(position) == JSON.stringify(start)) {
      mapped = true;
      steps++;
      console.log(
        "Steps around loop is " + steps + " steps to midpoint is " + steps / 2
      );
    } else {
      steps++;
      let pipe = map[position[0]][position[1]];
      next = plumbing[next][pipe];
    }
  }
  return map;
}

function compass(pos, dir) {
  let next = {
    north: [pos[0] - 1, pos[1]],
    south: [pos[0] + 1, pos[1]],
    east: [pos[0], pos[1] + 1],
    west: [pos[0], pos[1] - 1],
  };
  return next[dir];
}

function startPos(map) {
  for (let i = 0; i < map.length; i++) {
    const i2 = map[i].indexOf("S");
    if (i2 !== -1) return [i, i2];
  }
  return undefined;
}
