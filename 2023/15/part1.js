const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const sequence = data.split(",");
  let total = 0;
  sequence.forEach((seq) => {
    total += HASH(seq);
  })

  console.log(total)
});

function HASH(str) {
  let val = 0;
  str = str.split("")
  str.forEach((char) => {
    val += char.charCodeAt(0);
    val = val * 17;
    val = val % 256;
  });

  return val;
}