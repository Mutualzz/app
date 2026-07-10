import { Paper } from "@components/Paper";
import type { ProfileStickerBlock } from "@mutualzz/types";
import { ImageFormat, type Sizes } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { StickerIcon } from "@phosphor-icons/react";
import { useAppStore } from "@renderer/hooks/useStores";
import { Expression } from "@stores/objects/Expression";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

const STICKER_RENDER_SIZE = 256 satisfies Sizes;

function getStickerRenderUrl(sticker: Expression) {
  return Expression.constructUrl(
    sticker.id,
    sticker.animated,
    sticker.assetHash,
    STICKER_RENDER_SIZE,
    sticker.animated ? ImageFormat.GIF : ImageFormat.WebP
  );
}

export const ProfileStickerBlockView = observer(
  ({ block }: { block: ProfileStickerBlock }) => {
    const app = useAppStore();
    const [sticker, setSticker] = useState<Expression | null>(null);
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const expressionId = block.expressionId?.trim() ?? "";

    useEffect(() => {
      if (!expressionId) {
        setSticker(null);
        return;
      }

      const cached = app.expressions.get(expressionId);
      if (cached) {
        setSticker(cached);
        return;
      }

      let cancelled = false;
      void app.expressions.resolve(expressionId).then((resolved) => {
        if (!cancelled) setSticker(resolved ?? null);
      });

      return () => {
        cancelled = true;
      };
    }, [app.expressions, expressionId]);

    const shellStyle = {
      width: "100%",
      height: "100%",
      borderRadius: cornerRadius,
      overflow: "hidden" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    const placeholder = (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={0.75}
        css={{ opacity: 0.45, padding: 12, textAlign: "center" }}
      >
        <StickerIcon size={28} weight="fill" />
        <Typography level="body-xs">
          {expressionId ? "Sticker unavailable" : "Choose a sticker"}
        </Typography>
      </Stack>
    );

    if (sticker) {
      return (
        <div css={shellStyle}>
          <img
            src={getStickerRenderUrl(sticker)}
            alt={sticker.name}
            draggable={false}
            css={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      );
    }

    return (
      <Paper
        width="100%"
        height="100%"
        borderRadius={cornerRadius}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        css={shellStyle}
      >
        {placeholder}
      </Paper>
    );
  },
);
