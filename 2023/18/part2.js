const fs = require("fs");

const polygon = [];

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let plan = [];
  let perimeter = 0;
  lines.forEach((line) => {
    line = line.split(" ");
    let instruction = line[2].match(/.*\(#(.{5})([\d])/);
    if (instruction[2] == 0) instruction[2] = "R";
    if (instruction[2] == 1) instruction[2] = "D";
    if (instruction[2] == 2) instruction[2] = "L";
    if (instruction[2] == 3) instruction[2] = "U";
    let size = parseInt(instruction[1], 16);
    let data = {
      dir: instruction[2],
      size: size,
    };
    plan.push(data);
  });

  drawPolygon(plan);
  let area = polygonArea(polygon, 1);
  console.log(area);
});

function drawPolygon(plan) {
  let pos = [0, 0];
  polygon.push([0, 0]);

  plan.forEach((instruction, idx) => {
    let dir = instruction.dir;
    let size = instruction.size;
    let y = pos[0];
    let x = pos[1];

    if (dir == "R") x += size;
    if (dir == "L") x -= size;
    if (dir == "D") y += size;
    if (dir == "U") y -= size;
    pos[0] = y;
    pos[1] = x;
    if (x == 1 || x == -1) x = 0;
    if (y == 1 || y == -1) x = 0;

    polygon.push([y, x]);
  });
}

function polygonArea(vertices, width = 0) {
  let perimeter = 0;
  let area = 0;

  for (let i = 0; i < vertices.length; i++) {
    const n0 = i;
    const n1 = (i + 1) % vertices.length;
    const x0 = vertices[n0][0];
    const y0 = vertices[n0][1];
    const x1 = vertices[n1][0];
    const y1 = vertices[n1][1];
    perimeter += Math.abs(x0 - x1) + Math.abs(y0 - y1);
    area += x0 * y1 - x1 * y0;
  }

  return Math.abs(area * 0.5) + width * (perimeter / 2 + 1);
}
