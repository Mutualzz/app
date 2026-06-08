const path = require("path");
const { execSync } = require("child_process");

exports.default = async ({ appOutDir, packager }) => {
  if (packager.platform.name !== "mac") return;

  const productName = packager.appInfo.productName;
  const updaterDest = path.join(
    appOutDir,
    `${productName}.app`,
    "Contents",
    "MacOS",
    productName
  );

  const entitlements = path.join(
    packager.projectDir,
    "build/entitlements.mac.inherit.plist"
  );
  const identity = process.env.APPLE_SIGNING_IDENTITY;

  if (!identity) {
    throw new Error("[afterSign] APPLE_SIGNING_IDENTITY is not set");
  }

  console.log("[afterSign] Re-signing updater binary:", updaterDest);
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
    console.log("[afterSign] Updater signed successfully");
  } catch (e) {
    console.error("[afterSign] Failed to sign updater:", e.message);
    throw e;
  }
};
