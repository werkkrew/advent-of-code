const fs = require("fs");

const transpose = (matrix) => {
  let [row] = matrix;
  return row.map((value, column) => matrix.map((row) => row[column]));
};

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const mirrors = data.split("\r\n\r\n").map((block) => block.split("\r\n"));

  const patterns = [];
  mirrors.forEach((pattern) => {
    let p = [];
    pattern.forEach((row) => {
      row = row.split("");
      p.push(row);
    });
    patterns.push(p);
  });

  let sum = 0;
  patterns.forEach((pattern) => {
    sum += process(pattern);
  });
  console.log("Magic Number is: " + sum);
});

function process(pattern) {
  let index = 0;
  let orientation = "horizontal";
  index = mirroredness(pattern);
  if (index == 0){
    orientation = "vertical";
    pattern = transpose(pattern);
    index = mirroredness(pattern);
  }

  let score = (orientation == "horizontal") ? index * 100 : index; 
  return score;
}

function mirroredness(pattern) {
  let buf = [];
  let mirrored = false;
  let index = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (i == 0) {
      buf = pattern[i];
    } else {
      if (JSON.stringify(buf) === JSON.stringify(pattern[i])) {
        mirrored = reflect(pattern, i);
        if (mirrored) {
          index = i;
          break;
        }
      }
      buf = pattern[i];
    }
  }
  return index;
}

function reflect(pattern, index) {
  let top = index - 1;
  let bot = index;
  let mirrored = false;

  // this is cludge to deal with mirror being the first two 
  if (top <= 0) {
    if (JSON.stringify(pattern[0]) === JSON.stringify(pattern[1])) return true;
  }

  if (index == pattern.length - 1) {
    if (JSON.stringify(pattern[top]) === JSON.stringify(pattern[bot])) return true
  }

  for (let i = index; i < pattern.length - 1; i++) {
    top -= 1;
    bot += 1;
    if (top < 0) break;
    if (JSON.stringify(pattern[top]) != JSON.stringify(pattern[bot])) {
      return false;
    } else {
      mirrored = true;
    }
  }
  return mirrored;
}