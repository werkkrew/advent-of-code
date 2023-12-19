const fs = require("fs");

let boxes = new Map();

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const sequence = data.split(",");

  sequence.forEach((seq) => {
    let label = seq.match(/^([\w]+)/)[0];
    let focal;
    let box = HASH(label);
    let action = seq.match(/([-=])/)[0];
    let contents = [];

    if (action == "-") {
      if (boxes.has(box)) {
        contents = boxes.get(box);
        let lens = contents.find((x) => x.label === label);
        if (lens) {
          let index = contents.indexOf(lens);
          contents = contents.splice(index, 1);
        }
      }
    } else {
      focal = seq.match(/([\d]+)$/)[0];
      let newlens = {
        label: label,
        focal: focal,
      };
      // box is not empty
      if (boxes.has(box)) {
        contents = boxes.get(box);
        // if box does not already contain this lens
        if (!contents.find((x) => x.label === label)) {
          contents.push(newlens);
        } else {
          let lens = contents.find((x) => x.label === label);
          let index = contents.indexOf(lens);
          contents[index] = newlens;
        }
        // box is currently empty
      } else {
        contents = [newlens];
      }
      boxes.set(box, contents);
    }
  });
  let fp = focusingPower(boxes);
  console.log(fp);
});

function HASH(str) {
  let val = 0;
  str = str.split("");
  str.forEach((char) => {
    val += char.charCodeAt(0);
    val = val * 17;
    val = val % 256;
  });

  return val;
}

function focusingPower(boxes) {
  let power = 0;
  boxes.forEach((box, bdx) => {
    box.forEach((lens, ldx) => {
      power += (bdx + 1) * (ldx + 1) * lens.focal;
    });
  });
  return power;
}
