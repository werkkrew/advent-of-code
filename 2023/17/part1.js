const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const lines = data.split("\r\n");

  let grid = [];
  lines.forEach((line) => {
    grid.push(line.split("").map(Number));
  });

  let cost = navigate(grid, 1, 3);
  console.log(cost);
});

function navigate(grid, min = 1, max = 3) {
  const queue = new PriorityQueue();
  let max_x = grid[0].length - 1;
  let max_y = grid.length - 1;
  let goal = [max_y, max_x];
  let seen = new Set();
  let cost = 0;
  // [y, x, direction], cost
  queue.enqueue([0, 0, 0], 0);
  queue.enqueue([0, 0, 1], 0);

  while (queue) {
    let item = queue.dequeue();
    cost = item.priority;
    let y = item.val[0];
    let x = item.val[1];
    let direction = item.val[2];
    if (goal[0] == y && goal[1] == x) break;
    if (seen.has(item.val.toString())) continue;
    seen.add(item.val.toString());
    let original_cost = cost;
    [-1, 1].forEach((s) => {
      cost = original_cost;
      let new_x = x;
      let new_y = y;
      for (let i = 1; i <= max; i++) {
        if (direction == 1) {
          new_x = x + i * s;
        } else {
          new_y = y + i * s;
        }
        if (new_x < 0 || new_y < 0 || new_x > max_x || new_y > max_y) {
          break;
        }
        cost += grid[new_y][new_x];
        if (seen.has([new_y, new_x, 1 - direction].toString())) continue;
        if (i >= min) queue.enqueue([new_y, new_x, 1 - direction], cost);
      }
    });
  }
  return cost;
}

// based on: https://www.digitalocean.com/community/tutorials/js-binary-heaps
class Node {
  constructor(val, priority) {
    this.val = val;
    this.priority = priority;
  }
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    let newNode = new Node(val, priority);
    this.values.push(newNode);
    let index = this.values.length - 1;
    const current = this.values[index];

    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.values[parentIndex];

      if (parent.priority >= current.priority) {
        this.values[parentIndex] = current;
        this.values[index] = parent;
        index = parentIndex;
      } else break;
    }
  }
  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    this.values[0] = end;

    let index = 0;
    const length = this.values.length;
    const current = this.values[0];
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.values[leftChildIndex];
        if (leftChild.priority < current.priority) swap = leftChildIndex;
      }
      if (rightChildIndex < length) {
        rightChild = this.values[rightChildIndex];
        if (
          (swap === null && rightChild.priority < current.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        )
          swap = rightChildIndex;
      }

      if (swap === null) break;
      this.values[index] = this.values[swap];
      this.values[swap] = current;
      index = swap;
    }

    return min;
  }
}
