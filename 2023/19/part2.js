const fs = require("fs");

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
