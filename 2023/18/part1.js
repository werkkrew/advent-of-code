const fs = require("fs");

const walls = new Map();
const directions = ["up", "down", "left", "right"];

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let plan = [];
  lines.forEach((line) => {
    line = line.split(" ");
    let data = {
      dir: line[0],
      size: parseInt(line[1]),
      color: line[2].match(/.*(.{6})\)$/)[1],
    };
    plan.push(data);
  });

  let grid = createGrid(plan);
  let start = grid[1];
  grid = grid[0];
  //printGrid(grid);
  grid = digTrench(grid, plan, start);
  grid = fill(grid);
  //printGrid(grid);
  let count = grid.flat().filter((e) => e === "#").length;
  console.log(count);
});

function digTrench(grid, plan, start = [0, 0]) {
  let pos = start;
  grid[pos[0]][pos[1]] = "#";

  plan.forEach((instruction) => {
    let dir = instruction.dir;
    let size = instruction.size;
    let color = instruction.color;
    let y = pos[0];
    let x = pos[1];

    for (let i = 1; i <= size; i++) {
      if (dir == "R") x += 1;
      if (dir == "L") x -= 1;
      if (dir == "D") y += 1;
      if (dir == "U") y -= 1;
      grid[y][x] = "#";
    }
    pos[0] = y;
    pos[1] = x;

    walls.set(pos.toString(), dir + "," + size + "," + color);
  });
  return grid;
}

// lets make a 2d grid like we always do
function createGrid(plan) {
  let height = 0;
  let width = 0;

  let horiz = [];
  let vert = [];
  plan.forEach((instruction) => {
    let dir = instruction.dir;
    let size = instruction.size;
    if (dir == "R") width += size;
    if (dir == "L") width -= size;
    if (dir == "D") height += size;
    if (dir == "U") height -= size;
    if (dir == "R" || dir == "L") horiz.push(width);
    if (dir == "U" || dir == "D") vert.push(height);
  });

  horiz.sort(function (a, b) {
    return a - b;
  });
  vert.sort(function (a, b) {
    return a - b;
  });
  // make the grid much larger than it needs to be
  // should maybe write some code that can dynamically expand the grid...
  width = horiz.pop() * 3;
  height = vert.pop() * 3;
  console.log("grid size is " + width + ":" + height);
  let grid = [];
  for (let i = 0; i < height + 1; i++) {
    grid[i] = Array(width + 1).fill(".");
  }
  console.log(horiz);
  return [grid, [Math.abs(vert[0]), Math.abs(horiz[0])]];
}

function printGrid(grid) {
  grid.forEach((row) => {
    console.log(row.join(""));
  });
}

// flood fill taken from my day 10 part 2 code
function fill(map) {
  // find a point inside the loop
  let point = isInside(map);
  let target = ".";
  let fill = "#";
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
  let maxY = map.length;

  // check each point on our map until we find one which exists inside the loop
  while (found < 4) {
    // iterate a row
    for (let y = 0; y < map.length; y++) {
      // iterate all the columns in a row
      let row = map[y];
      for (let x = 0; x < row.length; x++) {
        point = [y, x];
        // if current position is on the loop itself, skip
        if (map[y][x] == "#") continue;
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
              if (pipe == "#") {
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

function compass(pos, dir) {
  let next = {
    up: [pos[0] - 1, pos[1]],
    down: [pos[0] + 1, pos[1]],
    right: [pos[0], pos[1] + 1],
    left: [pos[0], pos[1] - 1],
  };
  return next[dir];
}
