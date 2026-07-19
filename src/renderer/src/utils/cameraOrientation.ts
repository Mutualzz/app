export function resolveCameraRotationDegrees(options: {
  taggedOrientation?: number | null;
  isMobileClient?: boolean;
  videoWidth?: number;
  videoHeight?: number;
}): number {
  const tagged = options.taggedOrientation;
  if (tagged === 90 || tagged === 180 || tagged === 270) return tagged;

  if (
    options.isMobileClient &&
    (options.videoWidth ?? 0) > 0 &&
    (options.videoHeight ?? 0) > 0 &&
    (options.videoWidth as number) > (options.videoHeight as number)
  ) {
    return 90;
  }

  return 0;
}

export function cameraCoverScale(videoWidth: number, videoHeight: number) {
  if (videoWidth <= 0 || videoHeight <= 0) return 16 / 9;
  return Math.max(videoWidth / videoHeight, videoHeight / videoWidth);
}
