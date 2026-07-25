import { createRequire } from "module";
import { execFileSync } from "child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "fs";
import { basename, dirname, extname, join, resolve } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, "..");
const BUCKET = "mutualzz";
const KEY_PREFIX = "releases/latest";
const WRANGLER_LIMIT = 300 * 1024 * 1024;

const MIME_TYPES = {
  ".asar": "application/octet-stream",
  ".AppImage": "application/x-executable",
  ".deb": "application/vnd.debian.binary-package",
  ".dmg": "application/x-apple-diskimage",
  ".exe": "application/vnd.microsoft.portable-executable",
  ".json": "application/json",
  ".pacman": "application/x-alpm-package",
  ".rpm": "application/x-rpm",
  ".zip": "application/zip"
};

function readVersion() {
  return JSON.parse(readFileSync(join(appDir, "package.json"), "utf8")).version;
}

function contentType(filePath) {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function createS3Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const { S3Client } = require("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
}

async function uploadWithS3(client, localPath, key) {
  const { Upload } = require("@aws-sdk/lib-storage");
  const upload = new Upload({
    client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: createReadStream(localPath),
      ContentType: contentType(localPath)
    },
    partSize: 10 * 1024 * 1024,
    queueSize: 4
  });

  upload.on("httpUploadProgress", (progress) => {
    if (!progress.loaded || !progress.total) return;
    const pct = Math.round((progress.loaded / progress.total) * 100);
    process.stdout.write(`\r${key}: ${pct}%`);
  });

  await upload.done();
  process.stdout.write("\n");
}

function uploadWithWrangler(localPath, objectName) {
  execFileSync(
    "wrangler",
    ["r2", "object", "put", `${BUCKET}/${KEY_PREFIX}/${objectName}`, "--file", localPath, "--remote"],
    { stdio: "inherit", env: process.env }
  );
}

async function uploadFile(localPath, objectName, s3Client) {
  if (!existsSync(localPath)) {
    console.log(`Skipping ${objectName} (${localPath} not found)`);
    return;
  }

  const size = statSync(localPath).size;
  const key = `${KEY_PREFIX}/${objectName}`;
  console.log(`Uploading ${localPath} -> ${BUCKET}/${key} (${size} bytes)`);

  if (size > WRANGLER_LIMIT) {
    if (!s3Client) {
      throw new Error(
        `${basename(localPath)} is ${Math.ceil(size / (1024 * 1024))} MiB. ` +
          "Wrangler supports uploads up to 300 MiB. " +
          "Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY secrets for multipart upload."
      );
    }
    await uploadWithS3(s3Client, localPath, key);
    return;
  }

  if (s3Client) {
    await uploadWithS3(s3Client, localPath, key);
    return;
  }

  uploadWithWrangler(localPath, objectName);
}

async function main() {
  const releaseDir = resolve(process.argv[2] ?? "release");
  const latestJson = resolve(process.argv[3] ?? "latest.json");
  const version = readVersion();
  const s3Client = createS3Client();

  const uploads = [
    [join(releaseDir, "MutualzzSetup.exe"), "MutualzzSetup.exe"],
    [join(releaseDir, "Mutualzz.dmg"), "Mutualzz.dmg"],
    [join(releaseDir, "Mutualzz.deb"), "Mutualzz.deb"],
    [join(releaseDir, "Mutualzz.AppImage"), "Mutualzz.AppImage"],
    [join(releaseDir, "Mutualzz.rpm"), "Mutualzz.rpm"],
    [join(releaseDir, "Mutualzz.pacman"), "Mutualzz.pacman"],
    [join(releaseDir, `Mutualzz-win-x64-${version}.zip`), `Mutualzz-win-x64-${version}.zip`],
    [
      join(releaseDir, `Mutualzz-mac-universal-${version}.zip`),
      `Mutualzz-mac-universal-${version}.zip`
    ],
    [join(releaseDir, `Mutualzz-linux-x64-${version}.zip`), `Mutualzz-linux-x64-${version}.zip`],
    [join(releaseDir, "Mutualzz-win.asar"), "Mutualzz-win.asar"],
    [join(releaseDir, "Mutualzz-mac.asar"), "Mutualzz-mac.asar"],
    [join(releaseDir, "Mutualzz-linux.asar"), "Mutualzz-linux.asar"]
  ];

  for (const [localPath, objectName] of uploads) {
    await uploadFile(localPath, objectName, s3Client);
  }

  await uploadFile(latestJson, "latest.json", s3Client);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
