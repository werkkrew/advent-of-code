const { open } = require("node:fs/promises");

const mapNames = [
  "seeds",
  "seed-to-soil",
  "soil-to-fertilizer",
  "fertilizer-to-water",
  "water-to-light",
  "light-to-temperature",
  "temperature-to-humidity",
  "humidity-to-location",
];

function seed(id, length, soil, fert, water, light, temp, hum, loc) {
  this.id = id;
  this.length = length;
  this.soil = soil;
  this.fertilizer = fert;
  this.water = water;
  this.light = light;
  this.temperature = temp;
  this.humidity = hum;
  this.location = loc;
}

var maps = {};
var dataNext = false;
var seedList = [];

function dstVal(map, src) {
  let val = src;
  for (let i = 0; i < map.length; i++) {
    let dstMin = map[i][0];
    let srcMin = map[i][1];
    let len = map[i][2];
    let srcMax = srcMin + (len - 1);
    if (src >= srcMin && src <= srcMax) {
      offset = src - srcMin;
      val = dstMin + offset;
      break;
    }
  }
  return val;
}

function lowestLoc(s) {
  let val;
  s.forEach((x) => {
    if (!val) {
      val = x.location;
    } else if (x.location < val) {
      val = x.location;
    }
  });
  return val;
}

function mapSeeds(m, s) {
  let list = [];
  s.forEach((x) => {
    mapNames.forEach((y) => {
      if (m[y]) {
        let src = y.split("-to-")[0];
        let dst = y.split("-to-")[1];

        if (src == "seed") src = "id";

        srcVal = x[src];
        if (!x[dst]) x[dst] = dstVal(m[y], srcVal);
      }
    });
    list.push(x);
  });
  return list;
}

myFileReader();
async function myFileReader() {
  const file = await open("./data.txt");
  for await (const line of file.readLines()) {
    if (line.length == 0) {
      dataNext = false;
      continue;
    }
    if (dataNext) {
      let data = line.split(" ");
      data = data.map(Number);
      maps[dataNext].push(data);
    } else {
      let isMap = mapNames.some((i) => line.includes(i));
      if (isMap) {
        let mapName = line.match(/^(.*):/)[1];

        if (mapName == "seeds") {
          let seeds = line.replace("seeds: ", "").split(" ");
          seeds.forEach((s) => {
            seedList.push(new seed(parseInt(s)));
          });
        } else {
          mapName = mapName.split(" ")[0];
          maps.name = mapName;
          maps[mapName] = [];
          dataNext = mapName;
        }
        isMap = false;
      }
    }
  }

  seedList = mapSeeds(maps, seedList);
  console.log("Part One: " + lowestLoc(seedList));
}
