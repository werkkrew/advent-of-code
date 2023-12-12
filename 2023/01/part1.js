const { open } = require('node:fs/promises');

var total = 0;

myFileReader();
async function myFileReader() {
  const file = await open('./data.txt');
  for await (const line of file.readLines()) {

    let value = [];

    // split the line using numbers as the delimiter and keep the delimeter
    let split = line.split(/([1-9])/); 

    split.forEach(segment => {
      if (!isNaN(segment)) {
        value += segment;
      }
    });

    value = value.replace(/^([0-9]{1})$/g,'$1$1'); // if line is just 1 digit, duplicate it
    value = value.replace(/^([0-9]{1}).*([0-9]{1})/g,'$1$2'); // grab first and last digit, discard the rest
    value = parseInt(value); // convert the string to an actual integer

    total += value;  // add the number to our running total
  }

  console.log("Part 1: " + total);
}