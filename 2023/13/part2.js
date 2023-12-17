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

  let binary = toBinary(pattern);

  let orientation = "horizontal";
  index = mirroredness(binary);
  if (index == 0){
    orientation = "vertical";
    pattern = transpose(pattern);
    binary = toBinary(pattern);
    index = mirroredness(binary);
  }

  let score = (orientation == "horizontal") ? index * 100 : index; 
  return score;
}

function mirroredness(pattern) {
  let buf = [];
  let index = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (i == 0) {
      buf = pattern[i];
    } else {
      let flipped = flippedBits(buf, pattern[i])
      if (flipped == 0) {
        flipped = reflect(pattern, i);
        if (flipped == 1) {
          index = i;
          break;
        }
      }
      if (flipped == 1) {
        flipped = reflect(pattern, i);
        if (flipped == 0) {
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
  let flipped = 0;

  // this is cludge to deal with mirror being the first two 
  if (top <= 0) return flippedBits(pattern[0], pattern[1]) - 1;

  if (index == pattern.length - 1) return flippedBits(pattern[top], pattern[bot]) - 1;

  for (let i = index; i < pattern.length - 1; i++) {
    top -= 1;
    bot += 1;
    if (top < 0) break;
    flipped += flippedBits(pattern[top],pattern[bot])
    if (flipped > 1) {
      return flipped;
    } 
  }
  return flipped;
}

function toBinary(pattern) {
  let binary = []
  pattern.forEach((row) => {
    row = row.join("")
    row = row.replaceAll("#",1)
    row = row.replaceAll(".",0)
    binary.push(parseInt(row,2))
  });
  return binary;
}

function flippedBits(x, y) {
  let bitCount = 0;
  let z = x ^ y;  
  while (z !== 0) { 
      bitCount += z & 1; 
      z = z >> 1;  
  }
  return bitCount;
}