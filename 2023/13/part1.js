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
  let nus = 0;
  patterns.forEach((pattern) => {
    nus++;
    console.log("processing pattern " + nus);
    sum += process(pattern);
  });
  console.log("Magic Number is: " + sum);
});

function process(pattern) {
  let result = 0;
  let orientation = "horizontal";
  let index = mirroredness(pattern);
  if (!index) {
    orientation = "vertical";
    pattern = transpose(pattern);
    index = mirroredness(pattern);
  }

  if (!index) {
    orientation = "none";
    console.log("unable to find any mirroredednewsss");
  } else {
    console.log(orientation + " mirroredness found at index " + index);
  }

  if (orientation == "vertical") {
    return index;
  }

  if (orientation == "horizontal") {
    return index * 100;
  }
  return 0;
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
        index = i;
        mirrored = reflect(pattern, i);
        break;
      }
      buf = pattern[i];
    }
  }
  if (mirrored) return index;
  return false;
}

function reflect(pattern, index) {
  let top = index - 1;
  let bot = index;
  let mirrored = false;

  for (let i = index; i < pattern.length - 1; i++) {
    top -= 1;
    bot += 1;
    if (JSON.stringify(pattern[top]) === JSON.stringify(pattern[bot])) {
      mirrored = true;
    } else {
      mirrored = false;
    }
  }
  return mirrored;
}

/*

0 #...##..#
1 #....#..#
2 ..##..###
3 #####.##.
4 #####.##.
5 ..##..###
6 #....#..#

found index = 4
increment from 4
decrement from index - 1 = 3
test 5 vs 2
test 6 vs 1
max length reached
passed
*/
