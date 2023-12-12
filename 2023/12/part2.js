const fs = require("fs");

const nullrow = row => row.every(v => v === 'n');
const expansionAmount = 1000000

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  let rowIndex = 0;
  let universe = []
  let galaxies = []
  let galrows  = []
  let galcols  = []
  
  lines = data.split("\r\n")
  lines.forEach(line => {
    row = line.split("");
    let colIndex = 0
    let cols = []
    row.forEach(col => {
      symbol = col
      if ( symbol == "#" ) {
        let loc = [rowIndex, colIndex]
        galrows.push(rowIndex)
        galcols.push(colIndex)
      }
      cols.push(symbol)
      colIndex++;
    });
    universe.push(cols)
    rowIndex++
  });

  galaxies.push(galrows)
  galaxies.push(galcols)

  universe = cosmicExpansion(universe, galaxies)
  console.table(universe)
  galaxies = mapGalaxies(universe)

  console.log(galaxies)

  let galaxyPairs = galaxies.flatMap(
    (v, i) => galaxies.slice(i+1).map( w => [v.id,w.id] )
  );
  
  let distance = galaxyDistances(galaxies, galaxyPairs)
  console.log(distance)

});
