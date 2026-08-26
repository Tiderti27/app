// @expo/cli resolves the web/native entry point as a literal filesystem path
// (`<projectRoot>/node_modules/expo-router/entry`, see
// @expo/cli/build/src/start/server/metro/router.js) instead of through normal
// module resolution. With npm workspaces, expo-router is hoisted to the repo
// root and no such path exists inside apps/mobile, so `expo start` fails to
// resolve the entry file. This creates the missing local symlink after every
// `npm install`. Safe to skip silently if the layout ever changes.
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..", "apps", "mobile");
const target = path.join(__dirname, "..", "node_modules", "expo-router");
const linkDir = path.join(projectRoot, "node_modules");
const linkPath = path.join(linkDir, "expo-router");

if (!fs.existsSync(target)) {
  process.exit(0);
}

fs.mkdirSync(linkDir, { recursive: true });

if (fs.existsSync(linkPath)) {
  process.exit(0);
}

fs.symlinkSync(path.relative(linkDir, target), linkPath, "dir");
console.log("Verlinkt expo-router in apps/mobile/node_modules (Metro-Monorepo-Fix).");
