const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

exports.default = async ({ appOutDir, packager }) => {
  if (packager.platform.name !== "mac") return;

  const productName = packager.appInfo.productName;
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

  // Already wired — happens on 2nd/3rd afterPack calls during universal build
  if (fs.existsSync(renamedBin) && fs.existsSync(updaterDest)) {
    console.log("[afterPack] Already wired, skipping");
    return;
  }

  if (!fs.existsSync(electronBin)) {
    throw new Error(`[afterPack] Electron binary not found: ${electronBin}`);
  }
  if (!fs.existsSync(updaterSrc)) {
    throw new Error(
      `[afterPack] Updater binary not found: ${updaterSrc}\n` +
        `Make sure the CI step placed it in apps/app/resources/updater before electron-builder runs.`
    );
  }

  console.log("[afterPack] Renaming Electron binary → MutualzzApp");
  fs.renameSync(electronBin, renamedBin);

  console.log("[afterPack] Copying updater binary → Mutualzz");
  fs.copyFileSync(updaterSrc, updaterDest);
  fs.chmodSync(updaterDest, 0o755);

  const entitlements = path.join(
    packager.projectDir,
    "build/entitlements.mac.inherit.plist"
  );
  const identity = process.env.APPLE_SIGNING_IDENTITY;

  console.log("[afterPack] Signing Electron binary (MutualzzApp)");
  try {
    execSync(
      `codesign --sign "${identity}" \
        --options runtime \
        --timestamp \
        --entitlements "${entitlements}" \
        --force \
        "${renamedBin}"`,
      { stdio: "inherit", shell: true }
    );
    console.log("[afterPack] MutualzzApp signed successfully");
  } catch (e) {
    console.error("[afterPack] Failed to sign MutualzzApp:", e.message);
    throw e;
  }

  // Sign updater binary (Mutualzz) after Electron binary is signed
  console.log("[afterPack] Signing updater binary (Mutualzz)");
  try {
    execSync(
      `codesign --sign "${identity}" \
        --options runtime \
        --timestamp \
        --entitlements "${entitlements}" \
        --force \
        "${updaterDest}"`,
      { stdio: "inherit", shell: true }
    );
    console.log("[afterPack] Updater signed successfully");
  } catch (e) {
    console.error("[afterPack] Failed to sign updater:", e.message);
    throw e;
  }

  console.log("[afterPack] macOS entry point wiring complete");
};
