const fs = require("fs");

const directions = ["north", "south", "east", "west"];
const adjacent = {
  north: [-1, 0],
  south: [1, 0],
  east: [0, 1],
  west: [0, -1],
};

fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let grid = [];
  lines.forEach((line) => {
    grid.push(line.split("").map(Number));
  });

  let graph = new Graph(3);

  // first add all of the vertices to the graph
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      let vertex = i.toString() + j.toString();
      graph.addVertex(vertex);
    }
  }

  // next add all of the edges
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      let vertex = i.toString() + j.toString();
      directions.forEach((dir) => {
        let edgeY = i + adjacent[dir][0];
        let edgeX = j + adjacent[dir][1];
        if (
          edgeY >= 0 &&
          edgeX >= 0 &&
          edgeY < grid.length &&
          edgeX < grid.length
        ) {
          let weight = grid[edgeY][edgeX];
          let neighbor = edgeY.toString() + edgeX.toString();
          graph.addEdge(vertex, neighbor, weight, dir);
        }
      });
    }
  }

  let paths = graph.dijkstra("00");
  console.log(paths["1212"]);
});

class Graph {
  constructor(max) {
    this.vertices = [];
    this.adjacencyList = {};
    this.distances = {};
    this.prevDirection = "";
    this.moveCount = 0;
    this.maxStraight = max;
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
    this.adjacencyList[vertex] = {};
  }

  addEdge(vertex1, vertex2, weight, dir) {
    this.adjacencyList[vertex1][vertex2] = { weight: weight, direction: dir };
  }

  changeWeight(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1][vertex2].weight = weight;
  }

  dijkstra(source) {
    let parents = {},
      visited = new Set();
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i] === source) {
        this.distances[source] = 0;
      } else {
        this.distances[this.vertices[i]] = Infinity;
      }
      parents[this.vertices[i]] = null;
    }

    let currVertex = this.vertexWithMinDistance(this.distances, visited);

    while (currVertex !== null) {
      let distance = this.distances[currVertex],
        neighbors = this.adjacencyList[currVertex],
        nextDirection = "",
        count = 0;
      for (let neighbor in neighbors) {
        let newDirection = neighbors[neighbor].direction;
        count = newDirection == this.prevDirection ? this.moveCount + 1 : 1;
        if (count >= this.maxStraight) {
          continue;
        }
        let newDistance = distance + neighbors[neighbor].weight;
        if (this.distances[neighbor] > newDistance) {
          this.distances[neighbor] = newDistance;
          nextDirection = newDirection;
          parents[neighbor] = currVertex;
        }
      }
      this.prevDirection = nextDirection;
      this.moveCount = count;

      visited.add(currVertex);
      currVertex = this.vertexWithMinDistance(this.distances, visited);
    }
    return this.distances;
  }

  vertexWithMinDistance(distances, visited) {
    let minDistance = Infinity,
      minVertex = null;
    for (let vertex in distances) {
      let distance = distances[vertex];
      if (distance < minDistance && !visited.has(vertex)) {
        minDistance = distance;
        minVertex = vertex;
      }
    }
    return minVertex;
  }

  pathCost(dest) {
    return this.distances[dest];
  }

  printAdjacency() {
    console.log(this.adjacencyList);
  }
}
