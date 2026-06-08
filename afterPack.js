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

  // Sign the updater manually since electron-builder is configured to skip it
  // Electron builder doesnt like it apparently
  console.log("[afterPack] Signing updater binary manually");
  try {
    execSync(
      `codesign --sign "${process.env.APPLE_SIGNING_IDENTITY}" \
        --options runtime \
        --timestamp \
        --entitlements "${path.join(packager.projectDir, "build/entitlements.mac.inherit.plist")}" \
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
