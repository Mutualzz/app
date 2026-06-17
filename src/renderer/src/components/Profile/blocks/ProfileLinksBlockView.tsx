import { Link } from "@components/Link";
import { ProfileLinkKindIcon } from "@components/Profile/shared/ProfileLinkKindIcon";
import {
  formatProfileUrlLabel,
  resolveProfileUrl
} from "@components/Profile/shared/profileLink.utils";
import type { ProfileLinksBlock } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

interface Props {
  block: ProfileLinksBlock;
}

export const ProfileLinksBlockView = ({ block }: Props) => {
  const links = block.links.filter((link) => link.label.trim() && link.url.trim());

  if (links.length === 0) {
    return (
      <Box
        width="100%"
        height="100%"
        borderRadius={12}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--mz-palette-neutral-softBg)",
          border: "1px dashed var(--mz-palette-neutral-outlinedBorder)"
        }}
      >
        <Typography level="body-sm" css={{ opacity: 0.55 }}>
          Add links in the inspector
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      direction="column"
      spacing={0.75}
      width="100%"
      height="100%"
      p={1.25}
      borderRadius={12}
      css={{
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "auto"
      }}
    >
      {links.map((link, index) => {
        const resolved = resolveProfileUrl(link.url);
        const kind = resolved?.kind ?? "website";
        const accent = resolved?.color ?? "#6366F1";
        const subtitle = resolved
          ? formatProfileUrlLabel(resolved)
          : link.url;

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
                  whiteSpace: "nowrap"
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
                    whiteSpace: "nowrap"
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
    </Stack>
  );
};
