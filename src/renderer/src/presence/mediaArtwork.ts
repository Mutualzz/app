const ARTWORK_SIZE = 128;
const ARTWORK_QUALITY = 0.8;
const BASE64_CHUNK_SIZE = 0x8000;

let cachedArtwork: { trackKey: string; webp: Uint8Array | null } | null = null;
let pendingArtwork: {
  trackKey: string;
  promise: Promise<Uint8Array | null>;
} | null = null;

async function thumbnailToWebp(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
    const side = Math.min(bitmap.width, bitmap.height);
    const sourceX = (bitmap.width - side) / 2;
    const sourceY = (bitmap.height - side) / 2;

    const canvas = new OffscreenCanvas(ARTWORK_SIZE, ARTWORK_SIZE);
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      side,
      side,
      0,
      0,
      ARTWORK_SIZE,
      ARTWORK_SIZE
    );
    bitmap.close();

    const blob = await canvas.convertToBlob({
      type: "image/webp",
      quality: ARTWORK_QUALITY
    });
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

export async function getMediaArtwork(
  trackKey: string
): Promise<Uint8Array | null> {
  if (cachedArtwork?.trackKey === trackKey) return cachedArtwork.webp;
  if (pendingArtwork?.trackKey === trackKey) return pendingArtwork.promise;

  const promise = (async () => {
    const thumbnail = await window.api?.presence?.getMediaThumbnail?.();
    if (!thumbnail || thumbnail.trackKey !== trackKey) return null;

    const webp = await thumbnailToWebp(thumbnail.bytes);
    cachedArtwork = { trackKey, webp };
    return webp;
  })().finally(() => {
    if (pendingArtwork?.trackKey === trackKey) pendingArtwork = null;
  });

  pendingArtwork = { trackKey, promise };
  return promise;
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + BASE64_CHUNK_SIZE));
  }
  return btoa(binary);
}

let cachedArtworkUrl: { trackKey: string; url: string | null } | null = null;
let pendingArtworkUrlKey: string | null = null;

export function resolveMediaArtworkUrl(
  trackKey: string,
  upload: (image: string) => Promise<string | null>,
  onResolved: () => void
): string | null {
  if (cachedArtworkUrl?.trackKey === trackKey) return cachedArtworkUrl.url;
  if (pendingArtworkUrlKey === trackKey) return null;

  pendingArtworkUrlKey = trackKey;

  void (async () => {
    const webp = await getMediaArtwork(trackKey);
    if (!webp) return;

    const url = await upload(toBase64(webp));
    cachedArtworkUrl = { trackKey, url };
    if (url) onResolved();
  })().finally(() => {
    if (pendingArtworkUrlKey === trackKey) pendingArtworkUrlKey = null;
  });

  return null;
}
