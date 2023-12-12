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

  // expand the map to make it more easily fillable
  map = expand(map);

  // traverse the map and mark our path
  map = navigate(map);

  // traverse the map and change everything that isnt on our path to some unified character
  map = clean(map);

  // fill every "x" on the expanded map from a point inside the loop
  map = fill(map);

  // reduce the map back down to the original size by removing all of the added elements in our expand
  map = unexpand(map);

  // count the "i's"
  map = map.flat();

  let trapped = map.filter((e) => e === "i").length;
  console.log(trapped);
});

function navigate(map) {
  let mapped = false;
  let steps = 0;
  let start = startPos(map);
  let position = start;
  let next = [];

  map[position[0]][position[1]] = "*";

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
      map[coords[0]][coords[1]] = "*";
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
      map[position[0]][position[1]] = "*";
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

function expand(map) {
  let expanded = [];
  for (let y = 0; y < map.length; y++) {
    let row = map[y];
    let exprow = [];
    let newrow = [];
    // add a new column to every other row
    for (let x = 0; x < row.length; x++) {
      pipe = map[y][x];
      exprow.push(map[y][x]);
      if (pipe == "." || pipe == "7" || pipe == "J" || pipe == "|")
        exprow.push(".");
      if (pipe == "F" || pipe == "-" || pipe == "L" || pipe == "S")
        exprow.push("-");
    }
    // add the expanded existing row to the new map
    expanded.push(exprow);

    for (let x = 0; x < exprow.length; x++) {
      pipe = exprow[x];
      if (pipe == "." || pipe == "-" || pipe == "J" || pipe == "L")
        newrow.push(".");
      if (pipe == "7" || pipe == "F" || pipe == "|" || pipe == "S")
        newrow.push("|");
    }
    expanded.push(newrow);
  }
  return expanded;
}

function clean(map) {
  let newmap = [];
  for (let y = 0; y < map.length; y++) {
    let newrow = [];
    let row = map[y];
    for (let x = 0; x < row.length; x++) {
      pipe = map[y][x];
      if (pipe != "*") {
        newrow.push("x");
      } else {
        newrow.push("*");
      }
    }
    newmap.push(newrow);
  }
  return newmap;
}

function fill(map) {
  // find a point inside the loop
  let point = isInside(map);
  let target = "x";
  let fill = "i";
  let x = point[0];
  let y = point[1];

  if (!isValidSquare(map, x, y, target)) {
    return;
  }

  let stack = [{ x, y }];
  while (stack.length > 0) {
    const { x, y } = stack.pop();

    if (isValidSquare(map, x, y, target)) {
      map[x][y] = fill;

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }
  return map;
}

function isInside(map) {
  let point = [];
  let found = 0;
  let maxX = map[0].length;
  let maxY = map[1].length;

  // check each point on our map until we find one which exists inside the loop
  while (found < 4) {
    // iterate a row
    for (let y = 0; y < map.length; y++) {
      // iterate all the columns in a row
      for (let x = 0; x < row.length; x++) {
        point = [y, x];
        // if current position is on the loop itself, skip
        if (map[y][x] == "*") continue;
        found = 0;
        // from this point try to move in every direction until we hit our loop
        for (let i = 0; i < directions.length; i++) {
          let dir = directions[i];
          let pipe = "";
          let pos = point;
          let next = false;
          while (!next) {
            let coords = compass(pos, dir);
            if (
              coords[0] < 0 ||
              coords[0] >= maxY ||
              coords[1] < 0 ||
              coords[1] >= maxX
            ) {
              next = true;
            } else {
              pipe = map[coords[0]][coords[1]];
              pos = [coords[0], coords[1]];
              if (pipe == "*") {
                next = true;
                found++;
              }
            }
          }
        }
        if (found == 4) break;
      }
      if (found == 4) break;
    }
  }
  return point;
}

function isValidSquare(map, x, y, target) {
  return (
    x >= 0 &&
    x < map.length &&
    y >= 0 &&
    y < map[0].length &&
    map[x][y] === target
  );
}

function unexpand(map) {
  // remove the odd rows
  let newmap = [];
  let row = [];

  for (let y = 0; y < map.length; y++) {
    if (y % 2 == 0) {
      row = map[y];
    } else {
      continue;
    }
    // iterate all the columns in a row
    let newrow = [];
    for (let x = 0; x < row.length; x++) {
      if (x % 2 == 0) {
        newrow.push(row[x]);
      }
    }
    newmap.push(newrow);
  }
  return newmap;
}
