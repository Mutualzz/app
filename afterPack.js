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

  console.log("[afterPack] Stripping signatures from universal updater binary");
  try {
    execSync(
      `
      lipo "${updaterSrc}" -thin x86_64 -output /tmp/updater-x64 &&
      lipo "${updaterSrc}" -thin arm64  -output /tmp/updater-arm64 &&
      codesign --remove-signature /tmp/updater-x64  2>/dev/null || true &&
      codesign --remove-signature /tmp/updater-arm64 2>/dev/null || true &&
      lipo -create /tmp/updater-x64 /tmp/updater-arm64 -output "${updaterSrc}.clean" &&
      mv "${updaterSrc}.clean" "${updaterSrc}"
    `,
      { stdio: "inherit", shell: true }
    );
    console.log("[afterPack] Signatures stripped successfully");
  } catch (e) {
    console.log("[afterPack] Strip failed, continuing anyway:", e.message);
  }

  console.log("[afterPack] Renaming Electron binary -> MutualzzApp");
  fs.renameSync(electronBin, renamedBin);

  console.log("[afterPack] Copying updater binary -> Mutualzz");
  fs.copyFileSync(updaterSrc, updaterDest);
  fs.chmodSync(updaterDest, 0o755);

  console.log("[afterPack] macOS entry point wiring complete");
};
