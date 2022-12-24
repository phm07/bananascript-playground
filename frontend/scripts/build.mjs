import esbuild from "esbuild";
import buildOptions from "./buildOptions.mjs";
import fs from "fs-extra";

await esbuild.build(buildOptions);
await fs.copy("public/index.html", "../dist/public/index.html");