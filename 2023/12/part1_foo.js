const fs = require("fs");

let cache = new Map();

fs.readFile("./data2.txt", "utf-8", (err, data) => {
  if (err) throw err;

  lines = data.split("\r\n");

  let springs = [];
  lines.forEach((line) => {
    row = line.split(" ");
    let group = {
      answer: row[0],
      string: row[1],
      target: row[2].split(",").map(Number),
    };
    springs.push(group);
  });

  let combos = 0;
  springs.forEach((group) => {
    console.log("Processing: " + group.string + " / " + group.target);
    let count = combinatron(group);
    if (count != group.answer)
      console.log(
        "Answer " + count + " is WRONG. Correct Answer is: " + group.answer
      );
    //console.log("Possible Combinations: " + count);
    combos += count;
  });
  console.log("Total possible combinations: " + combos);
});

function combinatron(group) {
  let string = group.string;
  let target = group.target;
  let count = 0;

  // some strings only have 1 possible solution, try to identify those
  if (singleSolution(string, target)) return 1;

  // extract distinct sets from the string and discard any .'s
  let sets = Array.from(string.matchAll(/([#?]+)/g), (m) => m[0]);
  //console.log(sets);

  // # of sets is same as # of target values
  // low-ish hanging fruit
  if (sets.length == target.length) {
    // iterate through the sets
    for (let i = 0; i < sets.length; i++) {
      let s = sets[i];
      let t = target[i];

      // if the length of the set is equal to the target #, there is only 1 way it can be filled
      if (s.length == t) continue;

      // if the set already contains the needed number of #'s
      if ((s.match(/[#]/g) || []).length == t) continue;

      // if the target value is 1, the answer is the length of the set
      if (t == 1) {
        count += s.length;
        continue;
      }
      // if we need to solve for combinations, solve them
      if (s.length > t) count += solver(s, t);
    }
    return count;
  }

  // iterate through the remaining sets
  //console.log("All low hanging fruit evaluated, down to iterating.");
  // re-assemble the string from the sets with minimum number of .'s
  string = sets.join("");
  let done = false;
  while (!done) {
    // make the current set into an array of characters
    // let str = string.split("");

    /*
    ?###???????? 3,2,1

    first target value
    current block ###
    minimum space taken by remaining blocks .##.#
    string to look at ?###???
    how can ### fit into ?###???
    second target value
    minimum size of previous blocks
    .###.
    string to look at ???????
    minimum space taken by remaining blocks .#
    string to look at ?????
    how can ## fit into ?????
    minimum size of previous blocks
    .###.##.
    string to look at 
    ????
    minimum space taken by remaining blocks ""
    how can # fit into ????
    */

    // iterate through the targets
    for (let j = 0; j < target.length; j++) {
      let t = target[j];
      /*
      string = ????????????????????????
      target = 1,2,3,4,5
      j = 0, val = 1
      slice str at index 1
      before = false because we are at index 0
      after = 2,3,4,5 - sum = 14, elements = 4 so minimum of 14 hashes and 4 dots, length 18
      after string = .##.###.####.#####
      cut off last 18 characters from string
      string to search = ??????
      1 into

      j = 2, val = 3
      before = 1,2
      after = 4,5
      minstring before = 3 hashes and 2 dots = #.##. = length = 5
      minstring after = 9 hashes and 2 dots = .####.##### = length = 11
      slice off front of string from 0 length 5, (index 4) - remaining = ???????????????????
      slice off last 11 elements of the string - remaining =  ????????
      string to search = ????????
      3 into ????????
      */

      // get values for the minimum number of elements before and after our current target
      let presize = j == 0 ? 0 : target.slice(0, j);
      let postsize = j + 1 == target.length ? 0 : target.slice(j + 1);
      presize =
        j == 0 ? 0 : presize.length + presize.reduce((sum, num) => sum + num);
      postsize =
        j + 1 == target.length
          ? 0
          : postsize.length + postsize.reduce((sum, num) => sum + num);

      //console.log("target index: " + j);
      //console.log("elements before index: " + presize);
      //console.log("elements after index: " + postsize);

      // slice off the beginning and end of the string based on the above values
      // index start = presize
      // index end = string length - postsize?

      let s = string.substring(presize, string.length - postsize);
      //console.log("Resulting string to test: " + s);

      // use the 1:1 solver to get a value
      count += solver(s, t);

      //let before = (j==0) ? false : str.slice(0,idx)
      //let after = lenAfter(str, target, i)
      // what is the minimum size of the string for the target values after this one?
      //let search =
    }
    done = true;
  }
  return count;
}

// solve a single pair of string and known target value
function solver(s, t) {
  //console.log("In the single pair solver with " + s + " and " + t);
  let key = s + t;
  let spaces = s.length;

  // if the current pattern is in the cache, return that.
  //console.log("Cache Key: " + key);
  if (cache.has(key)) return cache.get(key);

  // if there is just 1 more space than the target value, the answer is 2
  if (spaces == t + 1) return 2;

  // if the string already has the needed number of #'s
  if ((s.match(/[#]/g) || []).length == t) return 0;

  let branches = [""];
  let done = false;
  let count = 0;
  s = s.split("");
  //console.log("Iterating string.");
  //console.log(s);
  while (!done) {
    for (let i = 0; i < branches.length; i++) {
      let index = branches[i].length ? branches[i].length : 0;
      // if current branch is max length, skip it
      if (index >= s.length) {
        continue;
      }

      let restOfString = s.join("").substr(index);
      //console.log("Rest of String: " + restOfString);

      // if the rest of the string does not contain any ?'s append and check if valid
      if (!restOfString.includes("?")) {
        branches[i] += restOfString;
        if (!isPossible(s, branches[i], t)) {
          branches.splice(i, 1);
        }
        continue;
      }

      let char = s[index];
      // let prevChar = index > 0 ? s[index - 1] : "";
      // this might need to be removed? skip the loop if the character to add is another .
      // if (prevChar == "." && char == ".") continue;

      //console.log("Current Index String: " + index + " character: " + char);
      //console.log("Branches:");
      //console.log(branches);

      // non branching, add to string and move on
      if (char != "?") {
        branches[i] += char;
        // test new string for validity
        if (!isPossible(s, branches[i], t)) branches.splice(i, 1);
        continue;
      }

      // create new branch
      if (char == "?") {
        let branch = branches[i] + "#";
        // if adding another # breaks the rules, dont even branch
        // if ((branch.match(/[#]/g) || []).length > t) continue;
        // dont add another dot?
        branches[i] += ".";
        // test new strings for validity, push onto list if valid
        //console.log("testing if branch " + branch + " is possible");
        if (isPossible(s, branch, t)) {
          //console.log("seems to be possible");
          if (!branches.includes(branch)) {
            branches.push(branch);
          }
        }
        if (!isPossible(s, branches[i], t)) branches.splice(i, 1);
      }
    }
    branches = [...new Set(branches)];
    done = branches.every((str) => str.length == s.length);
  }
  count = branches.length;
  // add item to the cache
  cache.set(key, count);
  return count;
}

function singleSolution(string, target) {
  let sum = target.reduce((sum, num) => sum + num);

  // length of string - length of set == sum of set answer is 1?
  if (string.length - target.length == sum) return true;

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
  let hashes = (br.match(/[#]/g) || []).length;

  //console.log("checking branch: " + br);
  if (str.length - br.length + hashes < target) return false;
  if (hashes > target) return false;
  check = Array.from(br.matchAll(/([#]+)/g), (m) => m[0]).length;
  if (check > 1) return false;

  return true;
}
