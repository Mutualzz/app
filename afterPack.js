const path = require("path");
const fs = require("fs");

exports.default = async ({ appOutDir, packager }) => {
  if (packager.platform.name !== "mac") return;

  const productName = packager.appInfo.productName;
  const macosDir = path.join(
    appOutDir,
    `${productName}.app`,
    "Contents",
    "MacOS"
  );

  const electronBin = path.join(macosDir, productName);
  const renamedBin = path.join(macosDir, `${productName}App`);
  const updaterSrc = path.join(packager.projectDir, "resources", "updater");
  const updaterDest = path.join(macosDir, productName);

  if (!fs.existsSync(electronBin)) {
    throw new Error(`[afterPack] Electron binary not found: ${electronBin}`);
  }
  if (!fs.existsSync(updaterSrc)) {
    throw new Error(`[afterPack] Updater binary not found: ${updaterSrc}`);
  }

  console.log("[afterPack] Renaming Electron binary → MutualzzApp");
  fs.renameSync(electronBin, renamedBin);

  console.log("[afterPack] Copying updater binary → Mutualzz");
  fs.copyFileSync(updaterSrc, updaterDest);
  fs.chmodSync(updaterDest, 0o755);

  console.log("[afterPack] macOS entry point wiring complete");
};
