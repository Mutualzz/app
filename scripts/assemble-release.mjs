import { createHash } from "crypto";
import { createRequire } from "module";
import { execSync } from "child_process";
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "fs";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const appDir = resolve(__dirname, "..");
const distDir = join(appDir, "dist");
const releaseDir = join(appDir, "release");

function sha256(filePath) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolvePromise(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function toMsysPath(filePath) {
  const abs = resolve(filePath);
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(abs);
  if (!match) return abs.replace(/\\/g, "/");
  return `/${match[1].toLowerCase()}/${match[2].replace(/\\/g, "/")}`;
}

function zipDirectory(sourceDir, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  const absOut = resolve(outPath);
  const absSrc = resolve(sourceDir);

  if (process.platform === "win32") {
    execSync(
      `tar -a --force-local -cf "${basename(absOut)}" -C "${toMsysPath(absSrc)}" .`,
      {
        stdio: "inherit",
        cwd: dirname(absOut),
        shell: true
      }
    );
    return;
  }

  execSync(`tar -a -cf "${absOut}" -C "${absSrc}" .`, {
    stdio: "inherit"
  });
}

function zipMacApp(appPath, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  execSync(`ditto -c -k --keepParent "${appPath}" "${outPath}"`, {
    stdio: "inherit"
  });
}

function readVersion() {
  return JSON.parse(readFileSync(join(appDir, "package.json"), "utf8")).version;
}

function readElectronVersion() {
  try {
    return JSON.parse(
      readFileSync(join(appDir, "node_modules", "electron", "package.json"), "utf8")
    ).version;
  } catch {
    return "";
  }
}

function readUpdaterVersion() {
  const path = join(appDir, "resources", "updater-version.txt");
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8").trim();
}

function findUnpackedDir(platform) {
  if (!existsSync(distDir)) {
    throw new Error(`Dist directory missing: ${distDir}`);
  }

  const byPlatform = {
    mac: [
      "mac-universal",
      "mac-unpacked",
      "mac-universal-unpacked",
      "mac-arm64-unpacked",
      "mac-x64-unpacked",
      "mac"
    ],
    win: ["win-unpacked", "win-arm64-unpacked", "win-ia32-unpacked"],
    linux: ["linux-unpacked", "linux-arm64-unpacked"]
  };

  for (const name of byPlatform[platform] ?? []) {
    const dir = join(distDir, name);
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      return dir;
    }
  }

  for (const name of readdirSync(distDir)) {
    const dir = join(distDir, name);
    if (!statSync(dir).isDirectory()) continue;
    if (name.endsWith("-unpacked")) return dir;
    if (platform === "mac" && (name === "mac" || name.startsWith("mac-"))) {
      return dir;
    }
  }

  if (platform === "mac") {
    for (const name of readdirSync(distDir)) {
      if (name.endsWith(".app")) return distDir;
    }
  }

  throw new Error(
    `No unpacked build found under ${distDir}. Contents: ${readdirSync(distDir).join(", ")}`
  );
}

function findMacApp(unpackedDir) {
  const direct = join(unpackedDir, "Mutualzz.app");
  if (existsSync(direct)) return direct;

  for (const name of readdirSync(unpackedDir)) {
    if (name.endsWith(".app")) return join(unpackedDir, name);
  }

  throw new Error(`No .app bundle found under ${unpackedDir}`);
}

async function assembleWindows(version, unpackedDir) {
  const packageZip = join(releaseDir, `Mutualzz-win-x64-${version}.zip`);
  zipDirectory(unpackedDir, packageZip);

  const updateExeSrc = join(appDir, "resources", "Update.exe");
  if (!existsSync(updateExeSrc)) {
    throw new Error("Update.exe missing from resources/");
  }

  cpSync(updateExeSrc, join(releaseDir, "updater-win.exe"));
  cpSync(updateExeSrc, join(releaseDir, "MutualzzSetup.exe"));
  cpSync(packageZip, join(releaseDir, "Mutualzz-win.zip"));
  writeFileSync(join(releaseDir, "app-version.txt"), version);
  writeFileSync(
    join(releaseDir, "electron-runtime-version.txt"),
    readElectronVersion()
  );
  writeFileSync(
    join(releaseDir, "updater-runtime-version.txt"),
    readUpdaterVersion()
  );

  const asar = join(unpackedDir, "resources", "app.asar");
  if (existsSync(asar)) {
    cpSync(asar, join(releaseDir, "Mutualzz-win.asar"));
  }

  return {
    setupPath: join(releaseDir, "MutualzzSetup.exe"),
    packagePath: packageZip,
    asarPath: existsSync(asar) ? join(releaseDir, "Mutualzz-win.asar") : null
  };
}

async function assembleMac(version, unpackedDir) {
  const appPath = findMacApp(unpackedDir);

  const afterSign = require(join(appDir, "afterSign.js"));
  await afterSign.default({
    appOutDir: unpackedDir,
    packager: {
      platform: { name: "mac" },
      appInfo: { productName: "Mutualzz", version },
      projectDir: appDir
    }
  });

  const packageZip = join(releaseDir, `Mutualzz-mac-universal-${version}.zip`);
  zipMacApp(appPath, packageZip);

  const updaterSrc = join(appDir, "resources", "updater");
  if (existsSync(updaterSrc)) {
    cpSync(updaterSrc, join(releaseDir, "updater-mac"));
  }

  const asar = join(appPath, "Contents", "Resources", "app.asar");
  if (existsSync(asar)) {
    cpSync(asar, join(releaseDir, "Mutualzz-mac.asar"));
  }

  const dmgPath = join(releaseDir, "Mutualzz.dmg");
  execSync(
    `hdiutil create -volname Mutualzz -srcfolder "${appPath}" -ov -format UDZO "${dmgPath}"`,
    { stdio: "inherit" }
  );

  return {
    setupPath: dmgPath,
    packagePath: packageZip,
    asarPath: existsSync(asar) ? join(releaseDir, "Mutualzz-mac.asar") : null
  };
}

async function assembleLinux(version, unpackedDir) {
  const packageZip = join(releaseDir, `Mutualzz-linux-x64-${version}.zip`);
  zipDirectory(unpackedDir, packageZip);

  const updaterSrc = join(appDir, "resources", "updater");
  if (existsSync(updaterSrc)) {
    cpSync(updaterSrc, join(releaseDir, "updater-linux"));
  }

  const asar = join(unpackedDir, "resources", "app.asar");
  if (existsSync(asar)) {
    cpSync(asar, join(releaseDir, "Mutualzz-linux.asar"));
  }

  for (const name of readdirSync(distDir)) {
    const full = join(distDir, name);
    if (name.endsWith(".AppImage")) cpSync(full, join(releaseDir, "Mutualzz.AppImage"));
    if (name.endsWith(".deb")) cpSync(full, join(releaseDir, "Mutualzz.deb"));
    if (name.endsWith(".rpm")) cpSync(full, join(releaseDir, "Mutualzz.rpm"));
    if (name.endsWith(".pacman") || name.includes(".pkg.tar.")) {
      cpSync(full, join(releaseDir, "Mutualzz.pacman"));
    }
  }

  return {
    packagePath: packageZip,
    asarPath: existsSync(asar) ? join(releaseDir, "Mutualzz-linux.asar") : null
  };
}

async function main() {
  const platform = process.argv[2];
  if (!platform) {
    console.error("Usage: node assemble-release.mjs <win|mac|linux>");
    process.exit(1);
  }

  rmSync(releaseDir, { recursive: true, force: true });
  mkdirSync(releaseDir, { recursive: true });

  const version = readVersion();
  const unpackedDir = findUnpackedDir(platform);
  let artifacts;

  if (platform === "win") {
    artifacts = await assembleWindows(version, unpackedDir);
  } else if (platform === "mac") {
    artifacts = await assembleMac(version, unpackedDir);
  } else if (platform === "linux") {
    artifacts = await assembleLinux(version, unpackedDir);
  } else {
    throw new Error(`Unknown platform: ${platform}`);
  }

  writeFileSync(join(releaseDir, "electron-version.txt"), readElectronVersion());
  writeFileSync(join(releaseDir, "updater-version.txt"), readUpdaterVersion());

  const checksums = {};
  for (const [key, filePath] of Object.entries(artifacts)) {
    if (filePath && existsSync(filePath)) {
      checksums[key] = await sha256(filePath);
    }
  }

  writeFileSync(
    join(releaseDir, "manifest.json"),
    JSON.stringify({ version, platform, artifacts, checksums }, null, 2)
  );

  console.log("Assembled release for", platform, version);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
