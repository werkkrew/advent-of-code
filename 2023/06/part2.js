const fs = require("fs");

fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;

  let lines = data.split("\r\n");
  let numbers = [];

  lines.forEach((line) => {
    line = line.split(":")[1].trim().replaceAll(" ", "");
    numbers.push(line);
  });

  let time = numbers[0];
  let dist = numbers[1];

  console.log(numbers);

  process(time, dist);
});

function process(time, dist) {
  const speeds = possibleSpeeds(dist, time);
  console.log(speeds);
}

function possibleSpeeds(goalDistance, availableTime) {
  // Coefficients of the quadratic equation: ax^2 + bx + c
  const a = 1;
  const b = -availableTime;
  const c = goalDistance;

  // Calculate the discriminant
  const discriminant = b * b - 4 * a * c;

  // Check if the discriminant is non-negative
  if (discriminant >= 0) {
    // Calculate the two possible speeds
    const speed1 = Math.abs((b + Math.sqrt(discriminant)) / (2 * a));
    const speed2 = Math.abs((b - Math.sqrt(discriminant)) / (2 * a));

    // Return the result
    console.log(speed1 + "  -  " + speed2);
    let range = Math.ceil(speed2 - 1) - Math.floor(speed1 + 1) + 1;
    return range;
  } else {
    // No real solutions, return an empty array
    return false;
  }
}
