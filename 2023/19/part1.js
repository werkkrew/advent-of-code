const fs = require("fs");

const operators = {
  ">": function (a, b) {
    return a > b;
  },
  "<": function (a, b) {
    return a < b;
  },
};

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const blocks = data.split("\r\n\r\n").map((block) => block.split("\r\n"));

  const workflows = [];
  blocks[0].forEach((workflow) => {
    let arr = [...workflow.matchAll(/^([a-z]+)\{(.*)\}$/g)];
    let name = arr[0][1];
    let inst = arr[0][2];

    inst = parseInstruction(inst);
    workflow = {
      name: name,
      inst: inst,
    };
    workflows.push(workflow);
  });

  const parts = [];
  blocks[1].forEach((part) => {
    part = part.match(/([\d]+)/g);
    part = {
      x: parseInt(part[0]),
      m: parseInt(part[1]),
      a: parseInt(part[2]),
      s: parseInt(part[3]),
    };
    parts.push(part);
  });

  let results = [];
  parts.forEach((p) => {
    let test = processPart(p, workflows);
    if (test == "A") results.push(p);
  });

  console.log(results);
  console.log(sumResult(results));
});

function processPart(part, workflows) {
  let curr = "in";

  while (true) {
    let workflow = workflows.find((o) => o.name === curr);
    curr = false;
    let steps = workflow.inst.steps;
    let final = workflow.inst.final;

    for (i = 0; i < steps.length; i++) {
      let step = steps[i];
      if (operators[step.oper](part[step.cat], step.val)) {
        curr = step.dest;
        break;
      }
    }
    if (!curr) curr = final;
    if (curr == "A" || curr == "R") break;
  }
  return curr;
}

function parseInstruction(inst) {
  inst = inst.split(",");

  // pop off the final instruction
  let final = inst.pop();
  let steps = [];
  inst.forEach((s) => {
    s = s.split(":");
    let i = s[0];
    i = s[0].match(/([xmas])([<>])([\d]+)/);
    let d = s[1];
    let step = { cat: i[1], oper: i[2], val: parseInt(i[3]), dest: d };
    steps.push(step);
  });

  inst = {
    steps: steps,
    final: final,
  };
  return inst;
}

function sumResult(results) {
  let sum = 0;
  results.forEach((s) => {
    sum += s.x + s.m + s.a + s.s;
  });
  return sum;
}
