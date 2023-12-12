const fs = require('fs')

fs.readFile('./data.txt', 'utf-8', (err, data) => {
  if (err) throw err;

  let lines = data.split("\r\n\r\n").map(block => block.split("\r\n"));
  let maps = []

  for ( let i = 0; i < lines.length; i += 2) {
    let instructions = lines[i][0].split("");
    let route = lines[i+1];
    let network = []

    route.forEach(node => {
      node = node.replaceAll(" ","").split("=");
      node[1] = node[1].replaceAll(/[()]/g,"").split(",")
      
      let steps = {
        'node': node[0],
        'left': node[1][0],
        'right': node[1][1]
      }

      network.push(steps);
    });
    
    let map = {
      'instructions': instructions,
      'network': network
    }

    maps.push(map)
  }
  process(maps);
});

function process(maps) {
  let steps = []

  for ( let i = 0; i < maps.length; i++ ) {
    steps.push(navigate(maps[i]))
  }

  console.log(steps)
}

function navigate(map) {
  let count = 0
  let done = false;
  let start = "AAA"
  let end = "ZZZ"
  let next = start
  let instructions = map.instructions
  let network = map.network

  while (!done) {
    for ( let i = 0; i < instructions.length; i++ ) {
      count++;
      let direction = ( instructions[i] == 'R' ) ? 'right' : 'left';
      next = network.filter(o => o.node === next)[0][direction];
      if ( next == end ) {
        done = true;
        break;
      }
    }
  }
  return count;
}

