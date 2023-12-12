const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  lines = data.split("\r\n");
  lines.forEach((line) => {
    row = line.split("");
    let colIndex = 0;
    let cols = [];
    row.forEach((col) => {
      symbol = col;
      if (symbol == "#") {
        let loc = [rowIndex, colIndex];
        galrows.push(rowIndex);
        galcols.push(colIndex);
      }
      cols.push(symbol);
      colIndex++;
    });
    universe.push(cols);
    rowIndex++;
  });
});
