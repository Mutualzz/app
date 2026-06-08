const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.default = async ({ appOutDir, packager }) => {
  if (packager.platform.name !== "mac") return;

  const productName = packager.appInfo.productName;
  const appPath = path.join(appOutDir, `${productName}.app`);
  const updaterDest = path.join(appPath, "Contents", "MacOS", productName);

  const entitlements = path.join(
    packager.projectDir,
    "build/entitlements.mac.inherit.plist"
  );
  const identity = process.env.APPLE_SIGNING_IDENTITY;
  const appleId = process.env.APPLE_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  console.log("[afterSign] Re-signing updater binary");
  execSync(
    `codesign --sign "${identity}" \
      --options runtime \
      --timestamp \
      --entitlements "${entitlements}" \
      --force \
      "${updaterDest}"`,
    { stdio: "inherit", shell: true }
  );
  console.log("[afterSign] Updater signed");

  console.log("[afterSign] Re-signing app bundle");
  execSync(
    `codesign --sign "${identity}" \
      --options runtime \
      --timestamp \
      --entitlements "${path.join(packager.projectDir, "build/entitlements.mac.plist")}" \
      --force \
      --deep \
      "${appPath}"`,
    { stdio: "inherit", shell: true }
  );
  console.log("[afterSign] App bundle re-signed");

  const zipPath = path.join(appOutDir, `${productName}.zip`);
  console.log("[afterSign] Zipping app for notarization");
  execSync(`ditto -c -k --keepParent "${appPath}" "${zipPath}"`, {
    stdio: "inherit",
    shell: true
  });

  console.log("[afterSign] Submitting for notarization...");
  execSync(
    `xcrun notarytool submit "${zipPath}" \
      --apple-id "${appleId}" \
      --password "${applePassword}" \
      --team-id "${teamId}" \
      --wait`,
    { stdio: "inherit", shell: true }
  );

  console.log("[afterSign] Stapling notarization ticket");
  execSync(`xcrun stapler staple "${appPath}"`, {
    stdio: "inherit",
    shell: true
  });

  fs.unlinkSync(zipPath);

  console.log("[afterSign] Done — app re-signed and re-notarized");
};
