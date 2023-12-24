const fs = require("fs");

// y,x
const directions = [
  [-1, 0], //up
  [1, 0], //down
  [0, -1], //left
  [0, 1], //right
];

fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  const garden = new Graph();

  let grid = [];
  lines.forEach((line) => {
    grid.push(line.split(""));
  });

  garden.parse(grid);
});

function findPos(array, symbol) {
  const string = array.toString().replace(/,/g, "");
  const pos = string.indexOf(symbol);

  const d = (array[0] || []).length;

  const x = pos % d;
  const y = Math.floor(pos / d);

  return [y, x];
}

class Graph {
  #adjacencyList;

  constructor() {
    this.#adjacencyList = {};
  }

  parse(grid) {
    const seen = new Set();
    const startPos = findPos(grid, "S");

    seen.add(startPos.toString());
    this.addVertex(startPos.toString());
    let currPos = [...startPos];

    while (true) {
      // go in every direction from the starting position
      directions.forEach((dir) => {
        // for every new position go in the same direction until we hit a wall, then try another direction
        let new_y = currPos[0] + dir[0];
        let new_x = currPos[1] + dir[1];
        currPos = [new_y, new_x];
        let obj = grid[new_y][new_x];
        if (obj != "#") {
          if (!seen.has(currPos)) {
            seen.add(currPos.toString());
            this.addVertex(currPos.toString());
          }
        }
      });
    }
  }

  addVertex(vertex) {
    if (!this.#adjacencyList[vertex]) this.#adjacencyList[vertex] = [];
  }

  addEdge(vertex1, vertex2) {
    if (this.#adjacencyList[vertex1] && this.#adjacencyList[vertex2]) {
      this.#adjacencyList[vertex1].push(vertex2);
      this.#adjacencyList[vertex2].push(vertex1);
    }
  }

  removeEdge(vertex1, vertex2) {
    if (this.#adjacencyList[vertex1] && this.#adjacencyList[vertex2]) {
      this.#adjacencyList[vertex1] = this.#adjacencyList[vertex1].filter(
        (vertex) => vertex !== vertex2
      );
      this.#adjacencyList[vertex2] = this.#adjacencyList[vertex2].filter(
        (vertex) => vertex !== vertex1
      );
    }
  }

  removeVertex(vertex) {
    if (this.#adjacencyList[vertex]) {
      this.#adjacencyList[vertex].forEach((v) => this.removeEdge(vertex, v));
      delete this.#adjacencyList[vertex];
    }
  }
}
