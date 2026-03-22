/**
 * GitHub Pages：直接開 /repoName/someRoute 會 404，需把 index.html 複製成 404.html
 * 見 https://create-react-app.dev/docs/deployment/#github-pages
 */
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "..", "build");
const indexHtml = path.join(buildDir, "index.html");
const notFoundHtml = path.join(buildDir, "404.html");

if (!fs.existsSync(indexHtml)) {
  console.warn("[spa-github-pages] build/index.html 不存在，略過 404.html");
  process.exit(0);
}
fs.copyFileSync(indexHtml, notFoundHtml);
console.log("[spa-github-pages] 已複製 index.html -> 404.html");
