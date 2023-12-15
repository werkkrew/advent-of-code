// bad mostly brute force solution
const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
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
    //console.log("Processing: " + group.string + " / " + group.target);
    let count = combinatron(group);
    //console.log("Possible Combinations: " + count);
    console.log(count);
    combos += count;
  });
  console.log("Total possible combinations: " + combos);
});

// count possible combinations
function combinatron(group) {
  let target = group.target;
  let string = group.string.replace(/(\.+)/g, ".").split("");
  let branches = [""];
  let done = false;
  let steps = 0;

  if (singleSolution(group.string, target)) return 1;

  while (!done) {
    // iterate through our list of valid branches
    for (let i = 0; i < branches.length; i++) {
      steps++;
      let index = branches[i].length ? branches[i].length : 0;
      // if current branch is max length, skip it
      if (index >= string.length) {
        continue;
      }

      let restOfString = string.join("").substr(index);

      // if the rest of the string does not contain any ?'s append and check if valid
      if (!restOfString.includes("?")) {
        branches[i] += restOfString;
        if (!isPossible(string, branches[i], target)) {
          branches.splice(i, 1);
        }
        continue;
      }

      let char = string[index];

      // non branching, add to string and move on
      if (char != "?") {
        branches[i] += char;
        // test new string for validity
        if (!isPossible(string, branches[i], target)) branches.splice(i, 1);
        continue;
      }

      // create new branch
      if (char == "?") {
        let branch = branches[i] + "#";
        branches[i] += ".";
        // test new strings for validity, push onto list if valid
        if (isPossible(string, branch, target)) {
          if (!branches.includes(branch)) {
            branches.push(branch);
          }
        }
        if (!isPossible(string, branches[i], target)) branches.splice(i, 1);
      }
    }
    branches = [...new Set(branches)];
    done = branches.every((str) => str.length == string.length);
  }
  return branches.length;
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
  if (!check) return true;
  return check.every((s, i) => s.length <= target[i]);
}

function singleSolution(string, target) {
  let nonDots = (string.match(/[?#]/g) || []).length;
  let sum = target.reduce((sum, num) => sum + num);

  // sum of target values is same as non dots in string, 1 solution
  if (sum == nonDots) return true;

  let dots = string.length - nonDots;
  let dotsNeeded = target.length - 1;
  nonDots = nonDots - (dotsNeeded - dots);

  // with the requisite # of ?'s replaced with dots, if sum is same as remaining non dots, 1 solution
  if (sum == nonDots) return true;

  return false;
}
