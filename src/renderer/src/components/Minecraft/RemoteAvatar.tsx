import { Avatar } from "@mutualzz/ui-web";
import { CubeIcon } from "@phosphor-icons/react";
import { useState } from "react";

interface Props {
  src?: string | null;
  name?: string;
  size?: number;
}

/** External avatar (e.g. Discord CDN) with cube fallback on load failure. */
export const RemoteAvatar = ({ src, name, size = 36 }: Props) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Avatar size={size} color="neutral" variant="soft" shape="circle">
        <CubeIcon weight="fill" />
      </Avatar>
    );
  }

  return (
    <div
      css={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    >
      <img
        src={src}
        alt={name ?? "Avatar"}
        draggable={false}
        onError={() => setFailed(true)}
        css={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
};
