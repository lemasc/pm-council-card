import { join } from "path";
import rimraf from "rimraf";
import { existsSync, mkdirSync } from "fs";
import { mkdir } from "fs/promises";

const removeDir = (dir) =>
  new Promise<void>((resolve, reject) =>
    rimraf(dir, (err) => {
      if (err) reject(err);
      else resolve();
    })
  );

export const createOrOverWriteFolder = async (...dir: string[]) => {
  const target = join(process.cwd(), ...dir);
  if (existsSync(target)) {
    await removeDir(target);
  }
  await mkdir(target);
};

export const createIfNotExist = (...dir: string[]) => {
  const target = join(process.cwd(), ...dir);
  if (!existsSync(target)) {
    mkdirSync(target);
  }
};
