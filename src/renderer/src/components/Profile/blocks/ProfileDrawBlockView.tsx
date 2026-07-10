import type { ProfileDrawBlock } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack } from "@mutualzz/ui-web";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";

interface Props {
  block: ProfileDrawBlock;
}

export const ProfileDrawBlockView = ({ block }: Props) => {
  const app = useAppStore();
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  if (!block.svgData) {
    return (
      <Paper
        width="100%"
        height="100%"
        borderRadius={cornerRadius}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        css={{ overflow: "hidden" }}
      >
        <Stack
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          css={{ opacity: 0.3 }}
        >
          <PencilSimpleIcon size={32} />
        </Stack>
      </Paper>
    );
  }

  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(block.svgData)}`;

  return (
    <Paper
      width="100%"
      height="100%"
      borderRadius={cornerRadius}
      elevation={0}
      css={{
        overflow: "hidden",
        background: block.backgroundColor ?? "transparent"
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        css={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          userSelect: "none",
          WebkitUserDrag: "none",
          pointerEvents: "none"
        }}
      />
    </Paper>
  );
};
