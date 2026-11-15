import { getIframeEmbedUrl } from "@components/Profile/shared/profileEmbed.utils";
import type { ProfileEmbedBlock } from "@mutualzz/types";
import {
  resolveProfileBackgroundFill,
  resolveProfileBlockCornerRadius
} from "@mutualzz/ui-core";
import { Typography } from "@mutualzz/ui-web";
import { PlayCircleIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const ProfileEmbedBlockView = observer(
  ({
    block,
    interactive
  }: {
    block: ProfileEmbedBlock;
    interactive: boolean;
  }) => {
    const { t } = useTranslation("settings");
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const customBackground = block.backgroundColor?.trim() || null;

    if (!block.kind) return null;

    const embedUrl = getIframeEmbedUrl(block.kind, block.url);
    const kindLabel = t(`profile.embed.kinds.${block.kind}`);

    return (
      <div
        css={{
          width: "100%",
          height: "100%",
          borderRadius: cornerRadius,
          overflow: "hidden",
          background: customBackground
            ? resolveProfileBackgroundFill(customBackground, "transparent")
            : "rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        }}
      >
        {embedUrl ? (
          <iframe
            title={kindLabel}
            src={embedUrl}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            css={{
              width: "100%",
              height: "100%",
              border: 0,
              display: "block",
              pointerEvents: interactive ? "auto" : "none"
            }}
          />
        ) : (
          <>
            <PlayCircleIcon size={28} css={{ opacity: 0.5 }} />
            <Typography
              level="body-xs"
              textColor="muted"
              css={{ fontSize: "var(--pcf-xs)", textAlign: "center" }}
            >
              {t("profile.embed.placeholder", { kind: kindLabel })}
            </Typography>
          </>
        )}
      </div>
    );
  }
);
