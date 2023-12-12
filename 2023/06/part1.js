const fs = require('fs')


fs.readFile('./data.txt', 'utf-8', (err, data) => {
  if (err) throw err;

  let lines = data.split("\r\n");
  let numbers = [];

  lines.forEach(line => {
    line = Array.from(line.split(':')[1].trim().matchAll(/(\d+)/g), match => match[1]);
    numbers.push(line);
  });

  let times = numbers[0];
  let dists = numbers[1];

  console.log(numbers)

  process(times, dists);
});

function process(times, dists) {

  let winningWays = waysToBeatRecord(times, dists);
  console.log(winningWays);
  console.log(product(winningWays));
}

function waysToBeatRecord(times, distances) {
  let ways = [];

  for ( let i = 0; i < times.length; i++ ) {
    let count = 0;
    let record = distances[i];
    let time = times[i];

    for ( let j = 0; j <= time; j++ ) {
      speed = j;
      timeLeft = time - j;
      dist = speed * timeLeft;

      if (dist > record) count++;
    }
    ways.push(count);
  }
  return ways;
}

function product(ways) {
  const p = ways.reduce((p, n) => p * n, 1);
  return p;
}