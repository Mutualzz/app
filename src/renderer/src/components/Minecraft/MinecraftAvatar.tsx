import { Avatar } from "@mutualzz/ui-web";
import { CubeIcon } from "@phosphor-icons/react";
import { minecraftAvatarUrl } from "@mutualzz/client";
import { observer } from "mobx-react-lite";
import { useState } from "react";

interface Props {
  uuid?: string | null;
  name?: string;
  size?: number | "sm" | "md" | "lg";
}

const resolvePixelSize = (size: Props["size"]) => {
  if (typeof size === "number") return size;
  switch (size) {
    case "sm":
      return 24;
    case "lg":
      return 48;
    case "md":
    default:
      return 40;
  }
};

export const MinecraftAvatar = observer(
  ({ uuid, name, size = "md" }: Props) => {
    const [failed, setFailed] = useState(false);
    const pixelSize = resolvePixelSize(size);

    if (!uuid || failed) {
      return (
        <Avatar size={pixelSize} color="neutral" variant="soft" shape="circle">
          <CubeIcon weight="fill" />
        </Avatar>
      );
    }

    return (
      <div
        css={{
          width: pixelSize,
          height: pixelSize,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <img
          src={minecraftAvatarUrl(uuid)}
          alt={name ? `${name}'s Minecraft skin` : "Minecraft skin"}
          draggable={false}
          onError={() => setFailed(true)}
          css={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>
    );
  },
);
