// Fixups for module-resolution quirks that npm workspaces hoisting causes
// in this monorepo. Both are safe to re-run on every `npm install` and are
// no-ops once the expected state already exists.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function ensureSymlink(target, linkPath) {
  if (!fs.existsSync(target)) return false;
  if (fs.existsSync(linkPath)) return false;
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.symlinkSync(path.relative(path.dirname(linkPath), target), linkPath, "dir");
  return true;
}

// 1) @expo/cli resolves the mobile entry point as a literal filesystem path
// (`<projectRoot>/node_modules/expo-router/entry`, see
// @expo/cli/build/src/start/server/metro/router.js) instead of through normal
// module resolution. With npm workspaces, expo-router sometimes hoists to the
// repo root with no local copy inside apps/mobile, so `expo start` fails to
// resolve the entry file.
if (
  ensureSymlink(
    path.join(root, "node_modules", "expo-router"),
    path.join(root, "apps", "mobile", "node_modules", "expo-router")
  )
) {
  console.log("Verlinkt expo-router in apps/mobile/node_modules (Metro-Monorepo-Fix).");
}

// 2) apps/web pins an exact react/react-dom version different from the one
// apps/mobile needs, so npm nests a matching pair under apps/web/node_modules
// while the rest of the tree (including styled-jsx, a transitive dependency
// of Next.js) stays hoisted to the repo root and resolves the WRONG react
// copy at runtime (crashes Next's SSR with "Cannot read properties of null
// (reading 'useContext')"). Pointing styled-jsx's own node_modules at the
// nested web copies forces it to pick those up instead.
const webReact = path.join(root, "apps", "web", "node_modules", "react");
const webReactDom = path.join(root, "apps", "web", "node_modules", "react-dom");
const styledJsxModules = path.join(root, "node_modules", "styled-jsx", "node_modules");

let fixedStyledJsx = false;
if (ensureSymlink(webReact, path.join(styledJsxModules, "react"))) fixedStyledJsx = true;
if (ensureSymlink(webReactDom, path.join(styledJsxModules, "react-dom"))) fixedStyledJsx = true;
if (fixedStyledJsx) {
  console.log("Verlinkt styled-jsx auf die React-Kopie von apps/web (Next-SSR-Fix).");
}
