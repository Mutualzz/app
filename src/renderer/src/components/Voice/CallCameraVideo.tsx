import { useAppStore } from "@hooks/useStores";
import {
  cameraCoverScale,
  resolveCameraRotationDegrees,
} from "@utils/cameraOrientation";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState, type CSSProperties } from "react";

interface Props {
  userId: string;
  stream: MediaStream;
  isSelf?: boolean;
  objectFit?: "cover" | "contain";
  style?: CSSProperties;
}

export const CallCameraVideo = observer(
  ({
    userId,
    stream,
    isSelf = false,
    objectFit = "cover",
    style,
  }: Props) => {
    const app = useAppStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    const taggedOrientation = app.voice.getCameraOrientationForUser(userId);
    const isMobileClient =
      app.voiceStates.get(userId)?.client === "mobile";

    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;

      if (el.srcObject !== stream) el.srcObject = stream;

      const syncSize = () => {
        setSize({ width: el.videoWidth, height: el.videoHeight });
      };

      el.addEventListener("loadedmetadata", syncSize);
      el.addEventListener("resize", syncSize);
      if (el.videoWidth) syncSize();

      return () => {
        el.removeEventListener("loadedmetadata", syncSize);
        el.removeEventListener("resize", syncSize);
        if (videoRef.current?.srcObject === stream) {
          videoRef.current.srcObject = null;
        }
      };
    }, [stream]);

    const rotation = resolveCameraRotationDegrees({
      taggedOrientation,
      isMobileClient,
      videoWidth: size.width,
      videoHeight: size.height,
    });
    const rotated = rotation === 90 || rotation === 270;
    const scale = rotated
      ? cameraCoverScale(size.width, size.height)
      : 1;

    const transformParts = [
      rotated ? `rotate(${rotation}deg)` : null,
      rotated ? `scale(${scale})` : null,
      isSelf ? "scaleX(-1)" : null,
    ].filter(Boolean);

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit,
          transform: transformParts.length
            ? transformParts.join(" ")
            : undefined,
          ...style,
        }}
      />
    );
  },
);
