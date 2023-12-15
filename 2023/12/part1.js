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

  let combos = 0;
  springs.forEach((spring) => {
    console.log("Processing: " + spring.pattern + " / " + spring.rules);
    let count = combinatron(spring);
    console.log("Possible Combinations: " + count);
    combos += count;
  });
  console.log("Total possible combinations: " + combos);
});

function combinatron(spring) {
  let rules = spring.rules;
  let pattern = spring.pattern.replace(/(\.+)/g, ".").split("");
  
  // some strings only have 1 possible solution, try to identify those
  if (singleSolution(spring.pattern, rules)) return 1;

  const Handlers = {
    '.': branch => {
      if (branch.rule === -1 || branch.run === rules[branch.rule]) {
        return [ { rule: branch.rule, run: branch.run, prev: '.' } ];
      }

      return [];
    },
    '#': branch => {
      if (branch.prev === '#') {
        if (branch.run !== rules[branch.rule]) {
          return [ { rule: branch.rule, run: branch.run + 1, prev: '#' } ];
        }
      } else {
        let rule = branch.rule + 1;
        if (rule !== rules.length) {
          return [ { rule, run: 1, prev: '#' } ];
        }
      }

      return [];
    },
    '?': branch => {
      const nextBranches = [];

      if (branch.prev === '#') {
        const prev = branch.run === rules[branch.rule] ? '.' : '#';
        const run = branch.run + (prev === '#' ? 1 : 0);
        nextBranches.push({ rule: branch.rule, run, prev });
      } else {
        // Not currently on a run
        nextBranches.push({ rule: branch.rule, run: branch.run, prev: '.' });
        const rule = branch.rule + 1;

        if (rule !== rules.length) {
          // There are more runs, so add a branch that starts a new one
          nextBranches.push({ rule, run: 1, prev: '#' });
        }
      }
      return nextBranches;
    },
  };

  const toKey = ({ rule, run, prev }) => `${rule},${run},${prev}`;
  const startBranch = { rule: -1, run: 0, prev: '.' };
  let branches = new Map();
  branches.set(toKey(startBranch), { branch: startBranch, count: 1 });

  for (let i = 0; i < pattern.length; i++) {
    const nextBranches = new Map();
    const handler = Handlers[pattern[i]];
    [ ...branches.values() ].forEach(({ branch, count }) => {
      handler(branch).forEach(b => {
        const key = toKey(b);
        const nextCount = (nextBranches.get(key)?.count ?? 0) + count;
        nextBranches.set(key, { branch: b, count: nextCount });
      });
    });
    branches = nextBranches;
  }

  // Prune any branches that haven't fulfilled all runs; then sum the counts of the remaining
  // branches
  return [ ...branches.values() ].reduce(
    (acc, { branch, count }) => {
      const { rule, run } = branch;
      return acc + (rule === rules.length - 1 && run === rules[rule] ? count : 0);
    }, 0
  );
};

// todo: try to identify more cases where thereis a single solution
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