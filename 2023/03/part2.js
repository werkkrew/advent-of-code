const { open } = require("node:fs/promises");

var matrix = [];
var symbols = "";
var numMap = [];
var partMap = [];
var total = 0;
var gearMap = [];
var gearTotal = 0;

// remove duplicate items from a string
const remDup = (e) => [...new Set(e)].sort().join("");

function findPartNums(arr, sym, map) {
  map.forEach((number) => {
    var x = number.coord[0];
    var y = number.coord[1];
    var len = number.coord[2];

    for (var i = 0; i < len; i++) {
      var dx = x + i;
      var adj = getAdjacent(arr, dx, y);

      var validPart = sym.some((v) => adj.includes(v));
      if (validPart) {
        total = total + parseInt(number.val);
        var coord = [x, y, len];
        var part = { val: number.val, coord: coord };
        partMap.push(part);
        break;
      }
    }
  });
}

function findGearRatio(arr, g, p) {
  g.forEach((gear) => {
    var x = gear[0];
    var y = gear[1];

    var adj = getAdjacentNums(arr, x, y, p);

    if (adj.length == 2) {
      var ratio = adj.reduce((acc, curr) => acc * curr, 1);
      gearTotal += ratio;
      //console.log("this is a gear: " + adj + " its ratio is " + ratio + " running total is " + gearTotal)
    }
  });
}

function getAdjacentNums(arr, i, j, nums) {
  let n = arr.length;
  let m = arr[0].length;

  let v = [];

  for (var dx = i > 0 ? -1 : 0; dx <= (i < n ? 1 : 0); ++dx) {
    for (var dy = j > 0 ? -1 : 0; dy <= (j < m ? 1 : 0); ++dy) {
      if (dx != 0 || dy != 0) {
        x = dx + i;
        y = dy + j;
        if (x < m && y < n) {
          nums.forEach((num) => {
            for (var i = 0; i < num.coord[2]; i++) {
              if (num.coord[0] + i == x && num.coord[1] == y) {
                // number adjacent to a gear
                v.indexOf(num.val) === -1 ? v.push(num.val) : false;
              }
            }
          });
        }
      }
    }
  }
  return v;
}

// returns an array of items adjacent to coordinate i, j
function getAdjacent(arr, i, j) {
  let n = arr.length;
  let m = arr[0].length;

  let v = [];

  for (var dx = i > 0 ? -1 : 0; dx <= (i < n ? 1 : 0); ++dx) {
    for (var dy = j > 0 ? -1 : 0; dy <= (j < m ? 1 : 0); ++dy) {
      if (dx != 0 || dy != 0) {
        x = dx + i;
        y = dy + j;
        if (x < m && y < n) {
          v.push(arr[y][x]);
        }
      }
    }
  }
  return v;
}

myFileReader();
async function myFileReader() {
  const file = await open("./data.txt");
  for await (const line of file.readLines()) {
    // add the line as an array to the matrix
    let row = Array.from(line);
    matrix.push(row);

    // remove any non-symbols
    let clean = line.replaceAll(".", "");
    clean = clean.replaceAll(/\d/g, "");

    // create a string of all symbols found
    symbols += clean;

    // find numeric values in the line and get their index
    let numbers = line.matchAll(/\d+/g);

    for (let number of numbers) {
      let x = number.index;
      let y = matrix.length - 1;
      let len = number[0].length;
      let coord = [x, y, len];
      let map = { val: number[0], coord: coord };
      numMap.push(map);
    }

    let gears = line.matchAll(/\*/g);

    for (let gear of gears) {
      let x = gear.index;
      let y = matrix.length - 1;
      let coord = [x, y];
      gearMap.push(coord);
    }
  }

  symbols = remDup(symbols.trim());
  symbols = Array.from(symbols);

  findPartNums(matrix, symbols, numMap);
  findGearRatio(matrix, gearMap, partMap);

  console.log("Part 1: " + total);
  console.log("Part 2: " + gearTotal);
}
