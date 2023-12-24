const fs = require("fs");

fs.readFile("./test.txt", "utf-8", (err, data) => {
  if (err) throw err;

  const matches = [...data.matchAll(regexp)];

  const modules = [];
  matches.forEach((module) => {
    modules.push({
      type: module.groups.type,
      id: module.groups.id,
      outputs: module.groups.outputs,
    });
  });
});
