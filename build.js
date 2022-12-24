const fs = require("fs-extra");
const { execSync } = require("child_process");

fs.emptyDirSync("dist");
execSync("npm --prefix ./backend run build");
execSync("npm --prefix ./frontend run build");