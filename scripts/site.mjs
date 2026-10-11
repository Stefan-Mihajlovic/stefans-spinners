import { build } from "esbuild";
import { mkdir, cp, copyFile } from "node:fs/promises";
import { spinners } from "../dist/catalog.js";
await mkdir("site-dist", { recursive: true });
await cp("site", "site-dist", { recursive: true });
await build({
  entryPoints: ["site/app.js"],
  bundle: true,
  outfile: "site-dist/app.js",
  minify: true,
  target: "es2020",
});
await copyFile("src/styles.css", "site-dist/spinners.css");
for (const name of ["llms.txt", "llms-full.txt"])
  await copyFile(name, `site-dist/${name}`);
for (const spinner of spinners) {
  const path = `site-dist/spinners/${spinner.id}`;
  await mkdir(path, { recursive: true });
  await copyFile("site/index.html", `${path}/index.html`);
}
console.log("Site ready in site-dist/");
