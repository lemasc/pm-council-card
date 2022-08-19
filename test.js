// @ts-check
const fs = require("fs/promises");
const path = require("path");
const sizeOf = require("image-size").default;

const publicImagesPath = path.join(process.cwd(), "public", "sources");

const readRecursive = (folder) => {
  return fs
    .readdir(folder, { withFileTypes: true })
    .then((list) =>
      Promise.all(
        list.map(async (dir) => {
          if (dir.isDirectory()) {
            return readRecursive(path.join(folder, dir.name));
          }
          return path.join(folder, dir.name);
        })
      )
    )
    .then((list) => list.flat().filter((v) => !v.endsWith(".ini")));
};
async function run() {
  console.clear();
  console.log("");
  const dirs = (
    await fs.readdir(publicImagesPath, { withFileTypes: true })
  ).filter((v) => v.isDirectory());
  for (let folder of dirs) {
    const dir = path.join(publicImagesPath, folder.name);
    const images = await readRecursive(dir);
    console.log("processing folder:", folder.name);
    images.map((f) => {
      const size = sizeOf(f);
      if (!size.width) return;
      const inch = size.width / 300;
      if (inch < 3.5) {
        console.warn(
          "-- inch",
          inch.toFixed(2),
          "-- width",
          size.width,
          inch < 3 ? "[critical]" : "[warn]",
          "file:",
          f
        );
      }
    });
    console.log("");
  }
}

run().catch(console.error);
