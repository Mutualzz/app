import fs from "fs";
import path from "path";

// if (!process.env.CI) {
// 	console.log("Not running in CI, skipping. Please do not run this script manually!");
// 	process.exit(0);
// }

const pkgJsonPath = path.resolve("./package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const pkgVersion = pkgJson.version;

// const tauriJsonPath = path.resolve("./src-tauri/tauri.conf.json");
const tauriJsonPath = path.resolve("./src-tauri/version.json");
const tauriJson = {
    version: `${pkgVersion}`,
};
fs.writeFileSync(tauriJsonPath, JSON.stringify(tauriJson, null, 4));
