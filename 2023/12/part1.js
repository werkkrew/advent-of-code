const fs = require("fs");

let cache = new Map();

fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) throw err;

  lines = data.split("\r\n");

  let springs = [];
  lines.forEach((line) => {
    row = line.split(" ");
    let group = {
      string: row[0],
      target: row[1].split(",").map(Number),
    };
    springs.push(group);
  });

  let combos = 0;
  springs.forEach((group) => {
    console.log("Processing: " + group.string + " / " + group.target);
    let count = combinatron(group);
    console.log("Possible Combinations: " + count);
    combos += count;
  });
  console.log("Total possible combinations: " + combos);
});

function combinatron(group) {
  let target = group.target;
  let string = group.string.replace(/(\.+)/g, ".");
  let count = 0;

  // some strings only have 1 possible solution, try to identify those
  if (singleSolution(string, target)) return 1;

  let sets = Array.from(string.matchAll(/([#?]+)/g), (m) => m[0]);
  console.log(sets);
  console.log(target);

  if (sets.length == target.length) {
    // iterate through the sets
    let p = 0;
    let foo = sets.length;
    for (let i = 0; i < foo; i++) {
      console.log(sets);
      console.log(target);
      console.log("index: " + i + " pruned: " + p + " actual: " + (i - p));
      let s = sets[i - p];
      let t = target[i - p];

      console.log(" set: " + s + " length: " + s.length + " target: " + t);
      // if the length of the set is equal to the target #, there is only 1 way it can be filled
      if (s.length == t) {
        console.log("purge 1");
        sets.splice(i - p, 1);
        target.splice(i - p, 1);
        p++;
        continue;
      }

      // if the set already contains the needed number of #'s
      if ((s.match(/[#]/g) || []).length == t) {
        console.log("purge 2");
        sets.splice(i - p, 1);
        target.splice(i - p, 1);
        p++;
        continue;
      }

      // if the target value is 1, the answer is the length of the set
      if (t == 1) {
        count += s.length;
        console.log("length of s " + s + " is same as t " + t + " pruning");
        sets.splice(i - p, 1);
        target.splice(i - p, 1);
        p++;
        continue;
      }
    }
  }
  console.log(sets);
  if (sets.length == 0) return count;

  string = sets.join(".");

  let branches = [
    {
      br: "",
      str: string.split(""),
      prev: "",
      idx: 0,
    },
  ];

  let done = false;
  let steps = 0;

  console.log(branches);
  /*
  ????.######..#####.  1,6,5




  */

  while (!done) {
    // iterate through our list of valid branches
    for (let i = 0; i < branches.length; i++) {
      steps++;
      let b = branches[i];
      let br = b.br;
      let prevChar = b.prev;
      let str = b.str;
      let index = b.idx;
      let hashes = (br.match(/[#]/g) || []).length;
      // if current branch is max length, skip it
      console.log(str);
      if (index >= str.length) {
        continue;
      }

      let restOfString = str.join("").substr(index);

      // if the rest of the string does not contain any ?'s append and check if valid
      if (!restOfString.includes("?")) {
        branches[i].br += restOfString;
        if (!isPossible(str, branches[i].br, target)) {
          branches.splice(i, 1);
        }
        continue;
      }

      let char = str[index];

      // non branching, add to string and move on
      if (char != "?") {
        branches[i].br += char;
        // test new string for validity
        if (!isPossible(str, branches[i].br, target)) branches.splice(i, 1);
        continue;
      }

      // create new branch
      if (char == "?") {
        let branch = branches[i].br + "#";
        if (isPossible(str, branch, target)) {
          if (!branches.br.includes(branch)) {
            branches.br.push(branch);
          }
        }
        branches[i].br += ".";
        if (!isPossible(str, branches[i].br, target)) branches.splice(i, 1);
      }
    }
    //branches = [...new Set(branches)];
    done = branches.br.every((str) => str.length == string.length);
  }
  // build a cache
  console.log(branches);
  console.log("Solution steps: " + steps);
  //branches.forEach(b => {});

  return count + branches.length;
}

function singleSolution(string, target) {
  let sum = target.reduce((sum, num) => sum + num);

  // sum of target values is same as non dots in string, 1 solution
  let nonDots = (string.match(/[?#]/g) || []).length;
  if (sum == nonDots) return true;

  // with the requisite # of ?'s replaced with dots, if sum is same as remaining non dots, 1 solution
  let dots = string.length - nonDots;
  let dotsNeeded = target.length - 1;
  nonDots = nonDots - (dotsNeeded - dots);
  if (sum == nonDots) return true;

  return false;
}

// check if current string is still a potential solution
// todo: try to exhaust more cases of definite failure
function isPossible(str, br, target) {
  let strlen = str.length;
  let brlen = br.length;
  let left = strlen - brlen;
  let hashes = (br.match(/[#]/g) || []).length;
  let needed = target.reduce((sum, num) => sum + num);

  // if remaining possible spots for non dots + nondots < sum
  if (left + hashes < needed) return false;

  let check = Array.from(br.matchAll(/([#]+)/g), (m) => m[0]);
  if (check.length > target.length) return false;
  if (!check) return true;
  return check.every((s, i) => s.length <= target[i]);
}
