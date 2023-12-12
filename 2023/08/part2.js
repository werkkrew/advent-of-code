const fs = require('fs')

const gcd = (a, b) => a ? gcd(b % a, a) : b;
const lcm = (a, b) => a * b / gcd(a, b);

fs.readFile('./data.txt', 'utf-8', (err, data) => {
  if (err) throw err;

  let lines = data.split("\r\n\r\n");
  let instructions = lines[0].split("");
  let route = lines[1].split("\r\n");
  let network = []

  route.forEach(node => {
    node = node.replaceAll(" ","").split("=");
    node[1] = node[1].replaceAll(/[()]/g,"").split(",")
    
    let steps = {
      'node': node[0],
      'root': node[0].split("")[2],
      'left': node[1][0],
      'right': node[1][1]
    }
    network.push(steps);
  });
  
  let map = {
    'instructions': instructions,
    'network': network
  }

  // LCM based solution
  let steps = navigateSerial(map);
  console.log("LCM Solution: " + steps.reduce(lcm))


});

// essentially brute force traverse the map for a single start and end point at a time like in part 1
function navigateSerial(map) {
  let count = 0;
  let counts = []
  let found = false;
  const instructions = map.instructions
  const network = map.network

  // find array of all starting nodes
  const start = network.filter(o => o.root === 'A').map(a => a.node).sort();
  let next = ""

  for ( let i = 0; i < start.length; i++ ){
    next = start[i]
    found = false
    count = 0
    while (!found) {
      for ( let j = 0; j < instructions.length; j++ ) {
        count++;
        let direction = ( instructions[j] == 'R' ) ? 'right' : 'left';
        next = network.filter(o => o.node === next)[0][direction];

        if ( next.endsWith("Z") ) {
          found = true;
          break;
        }
      }
    }
    counts.push(count)
  }
  return(counts)
}