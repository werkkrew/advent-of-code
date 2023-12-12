const { open } = require('node:fs/promises');

var power = 0;
const max = {
  red: 12,
  green: 13,
  blue: 14
}

function arr2obj(arr) {
  return arr.reduce((acc,cur) => {
    let key = cur[1].trim();
    let value = cur[0];

    acc[key] = value;

    return acc;
  },{});
}

myFileReader();
async function myFileReader() {
  const file = await open('./data.txt');
  for await (const line of file.readLines()) {

    let sets = line.split(':')[1].split(';');
    let game = [];

    sets.forEach(set => {
      let group = Array.from(set.matchAll(/((\d+) (red|green|blue))/g), (match) => match[1]
        .split(/(\d+)/)
        .filter(item => item));

      let obj = arr2obj(group);
      game.push(obj);
    });

    let result = game.reduce((r, o) => {
      if(!typeof(o) === 'object' || o === null) {
        return r;
      }
      
      Object.keys(o) // iterate the keys
        .forEach((key) => r[key] = r[key] !== undefined ? Math.max(r[key], o[key]) : o[key]); // get the greatest value
      
      return r;
    }, {});

    power += result.red * result.green * result.blue;
  }
  console.log("Part 2: " + power);
}