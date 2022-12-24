import fs from "fs-extra";
import { execSync } from "child_process";

await fs.emptyDir("dist");
execSync("npm --prefix ./backend run build");
execSync("npm --prefix ./frontend run build");