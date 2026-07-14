const path = require("path");
const fs = require("fs");

function writeVersionFiles(resourcesDir, packager) {
  fs.mkdirSync(resourcesDir, { recursive: true });

  const appVersion = packager.appInfo.version;
  fs.writeFileSync(path.join(resourcesDir, "app-version.txt"), appVersion);

  let electronVersion = "";
  try {
    electronVersion = require(
      path.join(packager.projectDir, "node_modules", "electron", "package.json")
    ).version;
  } catch {
    try {
      electronVersion = require("electron/package.json").version;
    } catch {
      electronVersion = "";
    }
  }

  if (electronVersion) {
    fs.writeFileSync(
      path.join(resourcesDir, "electron-runtime-version.txt"),
      electronVersion
    );
  }

  const updaterVersionPath = path.join(
    packager.projectDir,
    "resources",
    "updater-version.txt"
  );
  if (fs.existsSync(updaterVersionPath)) {
    fs.copyFileSync(
      updaterVersionPath,
      path.join(resourcesDir, "updater-runtime-version.txt")
    );
  }
}

exports.default = async ({ appOutDir, packager }) => {
  const platform = packager.platform.name;
  const productName = packager.appInfo.productName;

  if (platform === "mac") {
    const resourcesDir = path.join(
      appOutDir,
      `${productName}.app`,
      "Contents",
      "Resources"
    );
    writeVersionFiles(resourcesDir, packager);

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

    if (fs.existsSync(renamedBin) && fs.existsSync(updaterDest)) {
      console.log("[afterPack] macOS: already wired, skipping");
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

    console.log("[afterPack] macOS: renaming Electron binary -> MutualzzApp");
    fs.renameSync(electronBin, renamedBin);

    console.log("[afterPack] macOS: copying updater binary -> Mutualzz");
    fs.copyFileSync(updaterSrc, updaterDest);
    fs.chmodSync(updaterDest, 0o755);

    console.log("[afterPack] macOS: entry point wiring complete");
    return;
  }

  if (platform === "linux") {
    writeVersionFiles(path.join(appOutDir, "resources"), packager);

    const electronBin = path.join(appOutDir, "mutualzz");
    const renamedBin = path.join(appOutDir, "mutualzz-bin");
    const updaterBin = path.join(appOutDir, "updater");

    if (!fs.existsSync(electronBin)) {
      throw new Error(`[afterPack] Linux: Electron binary not found: ${electronBin}`);
    }
    if (!fs.existsSync(updaterBin)) {
      throw new Error(
        `[afterPack] Linux: updater binary not found: ${updaterBin}\n` +
          `Make sure the CI step placed it in apps/app/resources/updater before electron-builder runs.`
      );
    }

    console.log("[afterPack] Linux: renaming Electron binary -> mutualzz-bin");
    fs.renameSync(electronBin, renamedBin);

    const wrapper = [
      "#!/bin/sh",
      'DIR="$(dirname "$(readlink -f "$0")")"',
      'exec "$DIR/updater" "$@"',
      "",
    ].join("\n");

    console.log("[afterPack] Linux: writing updater wrapper -> mutualzz");
    fs.writeFileSync(electronBin, wrapper, { mode: 0o755 });

    console.log("[afterPack] Linux: entry point wiring complete");
    return;
  }

  if (platform === "windows") {
    writeVersionFiles(path.join(appOutDir, "resources"), packager);
  }
};
