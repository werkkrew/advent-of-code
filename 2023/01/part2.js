const { open } = require('node:fs/promises');

const mapObj = {
  one:"1",
  two:"2",
  three:"3",
  four:"4",
  five:"5",
  six:"6",
  seven:"7",
  eight:"8",
  nine:"9"
};

var total = 0;

myFileReader();
async function myFileReader() {
  const file = await open('./data.txt');
  for await (const line of file.readLines()) {

    let value = [];

    // split the line using numbers as the delimiter and keep the delimeter
    let split = line.split(/([1-9])/); 

    split.forEach(segment => {
      if (isNaN(segment)) {   // if current segment isnt a number, parse it
        // parse the string with a lookahead
        var numbers = Array.from(segment.matchAll(/(?=(one|two|three|four|five|six|seven|eight|nine))/g), (match) => match[1]);

        numbers.forEach(number => {
          // for each number word found, replace it with the corresponding digit and append to the number
          value += number.replace(/one|two|three|four|five|six|seven|eight|nine/gi, function(matched){
            return mapObj[matched];
          });
        });
      } else {
        // if current segment is a number, append it to the number
        value += segment;
      }
    });

    value = value.replace(/^([0-9]{1})$/g,'$1$1'); // if line is just 1 digit, duplicate it
    value = value.replace(/^([0-9]{1}).*([0-9]{1})/g,'$1$2'); // grab first and last digit, discard the rest
    value = parseInt(value); // convert the string to an actual integer

    total += value;  // add the number to our running total
  }

  console.log("Part 2: " + total);
}