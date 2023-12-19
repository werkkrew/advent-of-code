const fs = require("fs");

const move = {
  right: [0, 1],
  left: [0, -1],
  up: [-1, 0],
  down: [1, 0],
};

// how will the beam direction change if it hits a \
const backslash = {
  right: "down",
  left: "up",
  up: "left",
  down: "right",
};

// how will the beam direction change if it hits a /
const forwardslash = {
  right: "up",
  left: "down",
  up: "right",
  down: "left",
};

const dash = {
  right: "right",
  left: "left",
  up: "split",
  down: "split",
};

const pipe = {
  right: "split",
  left: "split",
  up: "up",
  down: "down",
};

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let grid = [];
  lines.forEach((line) => {
    grid.push(line.split(""));
  });

  let laser = pewpew(grid);
  console.log(laser.size);
});

function pewpew(grid) {
  let energized = new Set();
  let splitters = new Set();
  let beams = [
    {
      direction: "right",
      location: [0, 0],
    },
  ];

  function moveBeam(beam, tile) {
    let dir = beam.direction;

    if (tile == ".") {
      beam.location[0] += move[dir][0];
      beam.location[1] += move[dir][1];
      return beam;
    }

    if (tile == "\\") {
      beam.direction = backslash[dir];
      dir = beam.direction;
      beam.location[0] += move[dir][0];
      beam.location[1] += move[dir][1];
      return beam;
    }

    if (tile == "/") {
      beam.direction = forwardslash[dir];
      dir = beam.direction;
      beam.location[0] += move[dir][0];
      beam.location[1] += move[dir][1];
      return beam;
    }

    if (tile == "-") {
      beam.direction = dash[dir];
      if (splitters.has(beam.location.toString())) {
        beam.done = true;
        return beam;
      }
      splitters.add(beam.location.toString());
      if (beam.direction == "split") {
        splitters.add(beam.location.toString());
        let newx = beam.location[0] + move.right[0];
        let newy = beam.location[1] + move.right[1];
        let newbeam = {
          direction: "right",
          location: [newx, newy],
        };
        beam.direction = "left";
        beam.location[0] += move.left[0];
        beam.location[1] += move.left[1];
        if (newx >= 0 && newy >= 0) beams.push(newbeam);
      } else {
        beam.location[0] += move[dir][0];
        beam.location[1] += move[dir][1];
      }
      return beam;
    }

    if (tile == "|") {
      beam.direction = pipe[dir];
      if (splitters.has(beam.location.toString())) {
        beam.done = true;
        return beam;
      }
      splitters.add(beam.location.toString());
      if (beam.direction == "split") {
        let newx = beam.location[0] + move.up[0];
        let newy = beam.location[1] + move.up[1];
        let newbeam = {
          direction: "up",
          location: [newx, newy],
        };
        beam.direction = "down";
        beam.location[0] += move.down[0];
        beam.location[1] += move.down[1];
        if (newx >= 0 && newy >= 0) beams.push(newbeam);
      } else {
        beam.location[0] += move[dir][0];
        beam.location[1] += move[dir][1];
      }
      return beam;
    }
  }

  while (true) {
    // iterate through all of the beams
    for (let i = 0; i < beams.length; i++) {
      let beam = beams[i];
      energized.add(beam.location.toString());

      if (beam.hasOwnProperty("done")) break;

      // let the beam travel around until it either leaves the grid or repeats its path
      while (true) {
        const y = beam.location[0];
        const x = beam.location[1];
        const tile = grid[y][x];
        beam = moveBeam(beam, tile);
        if (beam.hasOwnProperty("done")) break;
        if (
          beam.location[0] < 0 ||
          beam.location[1] < 0 ||
          beam.location[0] >= grid[0].length ||
          beam.location[1] >= grid[1].length
        ) {
          beam.done = true;
          break;
        }
        energized.add(beam.location.toString());
      }
    }
    if (beams.every((x) => x.done === true)) break;
  }
  return energized;
}
