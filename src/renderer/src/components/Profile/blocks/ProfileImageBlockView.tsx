import { ImageFormat, type ProfileImageBlock } from "@mutualzz/types";
import {
  isProfileImageVideoUrl,
  resolveProfileBlockCornerRadius,
  resolveProfileImageBlockUrl,
} from "@mutualzz/ui-core";
import type { UserProfile } from "@stores/objects/UserProfile";

export const ProfileImageBlockView = ({
  block,
  profile,
}: {
  block: ProfileImageBlock;
  profile: UserProfile;
}) => {
  const displayUrl = block.src
    ? resolveProfileImageBlockUrl(block.src, (hash, animated) =>
        profile.constructBlockImageUrl(
          hash,
          ImageFormat.WebP,
          512,
          animated,
        ),
      )
    : null;
  const isVideo = displayUrl ? isProfileImageVideoUrl(displayUrl) : false;
  const objectFit = block.objectFit ?? "cover";
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  return (
    <div
      css={{
        width: "100%",
        height: "100%",
        borderRadius: cornerRadius,
        overflow: "hidden",
        background: "rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {displayUrl &&
        (isVideo ? (
          <video
            src={displayUrl}
            autoPlay
            loop
            muted
            playsInline
            css={{
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        ) : (
          <img
            src={displayUrl}
            alt=""
            draggable={false}
            css={{
              width: "100%",
              height: "100%",
              objectFit,
            }}
          />
        ))}
    </div>
  );
};