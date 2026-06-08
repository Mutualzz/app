const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

/**
 * afterPack hook — macOS only
 *
 * electron-builder names the Electron entry binary after your productName.
 * We need to:
 *   1. Rename that binary to MutualzzApp (the real Electron process)
 *   2. Copy the updater binary in as "Mutualzz" (the new entry point)
 *
 * Result inside Mutualzz.app/Contents/MacOS/:
 *   Mutualzz      ← updater binary (what macOS launches)
 *   MutualzzApp   ← real Electron binary (what updater launches)
 */
exports.default = async ({ appOutDir, packager }) => {
  // Only run on macOS
  if (packager.platform.name !== "mac") return;

  const productName = packager.appInfo.productName; // "Mutualzz"
  const macosDir = path.join(
    appOutDir,
    `${productName}.app`,
    "Contents",
    "MacOS"
  );

  const electronBin = path.join(macosDir, productName); // Mutualzz (Electron)
  const renamedBin = path.join(macosDir, `${productName}App`); // MutualzzApp
  const updaterSrc = path.join(packager.projectDir, "resources", "updater");
  const updaterDest = path.join(macosDir, productName); // Mutualzz (updater)

  // Sanity checks
  if (!fs.existsSync(electronBin)) {
    throw new Error(`[afterPack] Electron binary not found: ${electronBin}`);
  }
  if (!fs.existsSync(updaterSrc)) {
    throw new Error(
      `[afterPack] Updater binary not found: ${updaterSrc}\n` +
        `Make sure the CI step has placed it in apps/app/resources/updater before electron-builder runs.`
    );
  }

  console.log("[afterPack] Renaming Electron binary → MutualzzApp");
  fs.renameSync(electronBin, renamedBin);

  console.log("[afterPack] Copying updater binary → Mutualzz");
  fs.copyFileSync(updaterSrc, updaterDest);
  fs.chmodSync(updaterDest, 0o755);

  console.log("[afterPack] macOS entry point wiring complete");
};
