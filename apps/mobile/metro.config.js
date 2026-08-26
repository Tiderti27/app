// Monorepo-Setup fuer Metro (npm workspaces): node_modules liegen groesstenteils
// im Repo-Root, @spot/shared ist ein Symlink von packages/shared. Ohne das hier
// findet Metro weder expo-router/entry noch die Workspace-Pakete.
// https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
