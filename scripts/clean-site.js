const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "_site");

fs.rmSync(outputDir, { recursive: true, force: true });
console.log("Removed _site/");
