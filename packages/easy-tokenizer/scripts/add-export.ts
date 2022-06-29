import * as fs from "node:fs/promises";
import { join } from "node:path";
import { join as joinPosix } from "node:path/posix";

const [_0, _1, filename, distpath, debug] = process.argv;

export async function addExport(
  basePath: string,
  filename: string,
  distpath: string,
  debug: boolean
) {
  const log: typeof console.log = debug
    ? (...args) => console.log("[Debug]", ...args)
    : () => {};

  async function writeFile(ext: string, content: string) {
    log(`Writing file (${ext})...`);
    try {
      log(filename + "." + ext);
      await fs.writeFile(join(basePath, filename + "." + ext), content);
    } catch (err) {
      console.log(
        `\x1b[31mError writing file (${ext}): ${err.name}: ${err.message}\x1b[0m`
      );
    }
    log(`File written (${ext}).`);

    console.log(`\x1b[33m - Done ${filename + "." + ext}\x1b[0m`);
  }

  const relPath = joinPosix("./dist-dev/", distpath);
  await Promise.all([
    writeFile("d.ts", `export * from "${relPath}";`),
    writeFile("js", `module.exports = require("${relPath}")`),
    writeFile("cjs", `module.exports = require("${relPath}")`),
    writeFile("mjs", `export * from "${relPath}";`),
  ]);

  console.log(`\x1b[32mDone ${filename}!\x1b[0m`);
}

if (require.main === module) {
  addExport(
    process.cwd(),
    filename,
    distpath,
    debug === "true" || Boolean(debug)
  );
}
