import * as fs from "node:fs/promises";
import * as swc from "@swc/core";
import { dirname, join } from "node:path";

const [_, binPath, debug] = process.argv;
const relPath = join(dirname(binPath), "../dist-dev");

async function getFiles(path: string = ".") {
  const files = await fs.readdir(join(relPath, path));
  let result: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(path, file);
      const stats = await fs.stat(join(relPath, filePath));

      if (stats.isDirectory()) {
        result.push(...(await getFiles(filePath)));
      } else {
        if (!file.endsWith(".js")) return;
        result.push(filePath);
      }
    })
  );

  return result;
}

async function parseFile(file: string) {
  console.log(`\x1b[33mTransforming ${file}...\x1b[0m`);
  const result = await swc.transformFile(join(relPath, file), {
    jsc: {
      parser: {
        syntax: "ecmascript",
      },
    },
  });

  console.log(`\x1b[34mWriting ${file}...\x1b[0m`);
  await fs.writeFile(join(relPath, file), result.code);

  console.log(`\x1b[32mDone ${file}\x1b[0m`);
}

async function main() {
  console.log("Generating swc files...");
  const files = await getFiles();

  await Promise.all(
    files.map(async (file) => {
      await parseFile(file);
    })
  );

  console.log("\x1b[31m --- Done All ---\x1b[0m");
}

main();
