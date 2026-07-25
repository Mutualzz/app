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

function getR2Credentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "";
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.R2_ACCESS_KEY ||
    "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.R2_SECRET_KEY ||
    "";

  return { accountId, accessKeyId, secretAccessKey };
}

function createS3Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Credentials();

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

function describeMissingR2Credentials() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Credentials();
  const missing = [];

  if (!accountId) missing.push("CF_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID)");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");

  return missing;
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
      const missing = describeMissingR2Credentials();
      throw new Error(
        `${basename(localPath)} is ${Math.ceil(size / (1024 * 1024))} MiB. ` +
          "Wrangler supports uploads up to 300 MiB. " +
          "Create an R2 S3 API token in Cloudflare (R2 -> Manage R2 API Tokens) and add GitHub secrets: " +
          `${missing.join(", ")}. ` +
          "CF_API_TOKEN is for Wrangler only and cannot upload large files."
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

  const largeUploads = uploads.filter(
    ([localPath]) => existsSync(localPath) && statSync(localPath).size > WRANGLER_LIMIT
  );

  if (largeUploads.length > 0 && !s3Client) {
    const missing = describeMissingR2Credentials();
    throw new Error(
      `Found ${largeUploads.length} release file(s) over 300 MiB but R2 multipart credentials are missing: ${missing.join(", ")}`
    );
  }

  if (s3Client) {
    console.log("Using R2 S3 multipart upload for release artifacts");
  } else {
    console.log("Using Wrangler upload (files must be under 300 MiB)");
  }

  for (const [localPath, objectName] of uploads) {
    await uploadFile(localPath, objectName, s3Client);
  }

  await uploadFile(latestJson, "latest.json", s3Client);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
