import { pdf } from "pdf-to-img";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const standardFontDataUrl =
  path
    .join(
      path.dirname(require.resolve("pdfjs-dist/package.json")),
      "standard_fonts",
    )
    .replaceAll("\\", "/") + "/";

const folderPath = "./pdfs";
const files = await fs.readdir(folderPath, { withFileTypes: true });
const pdfNames = files
  .filter((file) => file.isFile() && file.name.toLowerCase().endsWith(".pdf"))
  .map((file) => file.name);

console.log(pdfNames);

async function run(fileNames = []) {
  try {
    if (fileNames.length <= 0) {
      throw new Error("no files found");
    }

    for (const name of fileNames) {
      let counter = 1;
      const outputPath = path.join("images", name);
      await fs.mkdir(outputPath, { recursive: true });
      const document = await pdf(`${folderPath}/${name}`, {
        scale: 2,
        docInitParams: { standardFontDataUrl },
      });
      try {
        for await (const image of document) {
          await fs.writeFile(
            path.join(outputPath, `page_${counter++}.png`),
            image,
          );
        }
      } finally {
        await document.destroy();
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
await run(pdfNames);
