const fs = require("fs");

const toKey = ({ rule, prev, run }) => `${rule},${prev},${run}`;

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  lines = data.split("\r\n");

  let springs = [];
  lines.forEach((line) => {
    row = line.split(" ");
    let spring = {
      pattern: row[0],
      rules: row[1].split(",").map(Number),
    };
    springs.push(spring);
  });
});
