const path = require("path");
const fs = require("fs");

exports.default = async ({ appOutDir, packager }) => {
  const platform = packager.platform.name;

  if (platform === "mac") {
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

  // ─── Linux ────────────────────────────────────────────────────────────────
  // The AppImage/deb entry point is always the executableName binary (mutualzz).
  // We rename it to mutualzz-bin and replace it with a tiny shell script that
  // execs the Rust bootstrapper (updater), which then execs mutualzz-bin after
  // the update check. This mirrors exactly what macOS does above.
  if (platform === "linux") {
    const electronBin = path.join(appOutDir, "mutualzz");        // entry point (Electron)
    const renamedBin  = path.join(appOutDir, "mutualzz-bin");    // Electron renamed
    const updaterBin  = path.join(appOutDir, "updater");         // Rust bootstrapper

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
};
