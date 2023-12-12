const fs = require('fs')

fs.readFile('./data.txt', 'utf-8', (err, data) => {
  if (err) throw err;

  let sequneces = []

  lines = data.split("\r\n")
  lines.forEach(line => {
    sequneces.push(line.split(" ").map(Number))
  })

  let numbers = process(sequneces)
  console.log(numbers)
  let result = numbers.reduce((sum, num) => sum + num);
  console.log(result)
});

function process(sequneces) {
  let numbers = []

  for ( let i = 0; i < sequneces.length; i++ ) {
    let curr = sequneces[i];
    let tree = []
    let done = false
    tree.push(curr)

    while (!done) {
      let next = []
      for ( let j = 1; j < curr.length; j++ ) {
        let value = curr[j] - curr[j-1];
        next.push(value)
      }
      tree.push(next)
      curr = next
      done = curr.every(item => item === 0);
    }

    // flip it and reverse it?
    tree = tree.reverse()
    tree[0].push(0)
    curr = tree[0]
    let value = 0
    for ( let j = 1; j < tree.length; j++ ) {
      let next = tree[j].reverse()
      value = parseInt(next.slice(-1)) - parseInt(curr.slice(-1))
      next.push(value)
      curr = next
    }
    numbers.push(value)
  }
  return numbers
}