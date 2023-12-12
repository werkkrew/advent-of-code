const fs = require("fs");

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
  galaxies = mapGalaxies(universe)

  let galaxyPairs = galaxies.flatMap(
    (v, i) => galaxies.slice(i+1).map( w => [v.id,w.id] )
  );
  console.log(galaxyPairs)

  let distance = galaxyDistances(galaxies, galaxyPairs)
  console.log(distance)

});

function cosmicExpansion(universe, galaxies) {
  let expanded = []
  let rows = galaxies[0]
  let cols = galaxies[1]
  for (let y = 0; y < universe.length; y++) {
    let row = universe[y]
    let newrow = []
    for (let x = 0; x < row.length; x++ ) {
      if ( cols.includes(x) ) {
        newrow.push(row[x])
      } else {
        newrow.push(row[x])
        newrow.push(".")
      }
    }
    expanded.push(newrow)
    if ( rows.includes(y) ) continue
    expanded.push(newrow)
  }
  return expanded
}

function mapGalaxies(universe) {
  let galaxies = []
  let galaxy = {}
  let count = 1

  for (let y = 0; y < universe.length; y++) {
    let row = universe[y]
    for (let x = 0; x < row.length; x++ ) {
      let col = row[x]
      if ( col == "#") {
        galaxy = {
          id: count,
          pos: [y,x]
        }
        count++
        galaxies.push(galaxy)
      }
    }
  }
  return galaxies
}

function galaxyDistances(galaxies, galaxyPairs) {
  let total = 0

  galaxyPairs.forEach(pair => {
    let a = galaxies[pair[0]-1].pos
    let b = galaxies[pair[1]-1].pos

    // Manhattan distance = |X1 – X2| + |Y1 – Y2|.
    total += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
  });
  return total
}