import { ImageFormat, type ProfileImageBlock } from "@mutualzz/types";
import type { UserProfile } from "@stores/objects/UserProfile";

export const ProfileImageBlockView = ({
  block,
  profile
}: {
  block: ProfileImageBlock;
  profile: UserProfile;
}) => {
  const src = block.src
    ? profile.constructBlockImageUrl(
        block.src,
        ImageFormat.WebP,
        512,
        block.src.startsWith("a_")
      )
    : null;

  return (
    <div
      css={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          css={{
            width: "100%",
            height: "100%",
            objectFit: block.objectFit ?? "cover"
          }}
        />
      ) : null}
    </div>
  );
};
