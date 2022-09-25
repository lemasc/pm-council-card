// @ts-check
const data = require("./data.json");

const fs = require("fs");

const maps = {};
data.map((v) => {
  if (v.role === "กรรมการ") {
    if (!maps[v.section]) {
      maps[v.section] = [];
    }
    maps[v.section].push(v);
  }
});

fs.writeFileSync(
  "data_posts.json",
  JSON.stringify(Object.values(maps), null, 2)
);
