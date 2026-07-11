import { Link } from "@components/Link";
import { ProfileLinkKindIcon } from "@components/Profile/shared/ProfileLinkKindIcon";
import {
  formatProfileUrlLabel,
  resolveProfileUrl
} from "@components/Profile/shared/profileLink.utils";
import type { ProfileLinksBlock } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";
import { useTranslation } from "react-i18next";

interface Props {
  block: ProfileLinksBlock;
}

export const ProfileLinksBlockView = ({ block }: Props) => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const links = block.links.filter(
    (link) => link.label.trim() && link.url.trim()
  );
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  return (
    <Paper
      direction="column"
      spacing={0.75}
      width="100%"
      height="100%"
      p={1.25}
      borderRadius={cornerRadius}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      overflow="auto"
    >
      {links.length === 0 && (
        <Typography
          level="body-sm"
          css={{ opacity: 0.55, fontSize: "var(--pcf-sm)" }}
        >
          {t("profile.blocks.addLinksInInspector")}
        </Typography>
      )}
      {links.map((link, index) => {
        const resolved = resolveProfileUrl(link.url);
        const kind = resolved?.kind ?? "website";
        const accent = resolved?.color ?? "#6366F1";
        const subtitle = resolved ? formatProfileUrlLabel(resolved) : link.url;

        return (
          <Link
            key={`${link.url}-${index}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            css={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
              background: `linear-gradient(90deg, ${accent}18 0%, rgba(255,255,255,0.04) 100%)`,
              border: `1px solid ${accent}44`,
              "&:hover": {
                background: `linear-gradient(90deg, ${accent}28 0%, rgba(255,255,255,0.08) 100%)`,
                borderColor: `${accent}88`
              }
            }}
          >
            <Stack
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              borderRadius={8}
              css={{
                lineHeight: 0,
                background: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}55`,
                "& svg": {
                  display: "block"
                }
              }}
            >
              <ProfileLinkKindIcon kind={kind} size={18} />
            </Stack>
            <Stack direction="column" spacing={0.15} flex={1} minWidth={0}>
              <Typography
                level="body-sm"
                fontWeight={600}
                css={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "var(--pcf-sm)"
                }}
              >
                {link.label}
              </Typography>
              {resolved && (
                <Typography
                  level="body-xs"
                  css={{
                    opacity: 0.65,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "var(--pcf-xs)"
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Stack>
            <ArrowSquareOutIcon
              size={14}
              css={{ opacity: 0.65, flexShrink: 0, color: accent }}
            />
          </Link>
        );
      })}
    </Paper>
  );
};
