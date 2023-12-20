const fs = require("fs");

fs.readFile("./test.txt", "utf-8", (err, data) => {
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
});
