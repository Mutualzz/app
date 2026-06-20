import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import type { AccountStore } from "@stores/Account.store";
import { useAppStore } from "@hooks/useStores";
import {
  dynamicElevation,
  formatColor,
  TypographyLevel
} from "@mutualzz/ui-core";
import { Box, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { hasCustomStatusContent } from "@utils/customStatus";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";

const PLACEHOLDER = "Set Custom Status...";

const SIZES = {
  compact: {
    avatar: 40,
    banner: 52,
    overlap: 20,
    avatarInset: 1.25,
    bubbleTop: 10,
    bubbleEmoji: 18,
    bubbleText: "body-sm" as TypographyLevel,
    bubblePx: 1.25,
    bubblePy: 0.875,
    bubbleRadius: 10,
    bubbleMinHeight: 32
  },
  full: {
    avatar: 72,
    banner: 96,
    overlap: 36,
    avatarInset: 2.5,
    bubbleTop: 24,
    bubbleEmoji: 20,
    bubbleText: "body-md" as TypographyLevel,
    bubblePx: 1.5,
    bubblePy: 1,
    bubbleRadius: 12,
    bubbleMinHeight: 40
  }
};

interface Props {
  account: AccountStore;
  text?: string;
  emoji?: PresenceActivityEmoji | null;
  size?: keyof typeof SIZES;
  showName?: boolean;
  interactive?: boolean;
  onEdit?: () => void;
  onClear?: () => void;
}

export const CustomStatusCard = observer(
  ({
    account,
    text = "",
    emoji = null,
    size = "full",
    showName = false,
    interactive = false,
    onEdit,
    onClear
  }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const [hovered, setHovered] = useState(false);

    const profile = app.profiles.get(account.id);
    const bannerUrl = profile?.constructBannerUrl();
    const dims = SIZES[size];
    const previewText = text.trim();
    const hasStatus = hasCustomStatusContent(previewText, emoji);

    const avatarInset = theme.spacing(dims.avatarInset);
    const bubbleLeft = `calc(${avatarInset} + ${dims.avatar * 1.15}px)`;
    const bubbleElevation = interactive && hovered ? 6 : 4;

    return (
      <Paper
        width="100%"
        direction="column"
        borderRadius={size === "compact" ? 8 : 10}
        overflow="visible"
        elevation={0}
        variant="soft"
        color="neutral"
        transparency={0}
      >
        <Box
          position="relative"
          css={{ marginBottom: dims.overlap, overflow: "visible" }}
        >
          <Box
            height={dims.banner}
            css={{
              borderTopLeftRadius: size === "compact" ? 8 : 10,
              borderTopRightRadius: size === "compact" ? 8 : 10,
              background: bannerUrl
                ? `url("${bannerUrl}") center / cover no-repeat`
                : account.accentColor
            }}
          />

          <Box
            position="absolute"
            left={dims.avatarInset}
            bottom={0}
            css={{ transform: "translateY(50%)", zIndex: 2 }}
          >
            <UserAvatar
              user={account}
              size={dims.avatar}
              badge
              showInvisible
              disableContextMenu
              popout={false}
            />
          </Box>

          <Box
            position="absolute"
            left={bubbleLeft}
            top={dims.bubbleTop}
            right={dims.avatarInset}
            zIndex={4}
            onMouseEnter={() => interactive && setHovered(true)}
            onMouseLeave={() => interactive && setHovered(false)}
          >
            <Box
              position="relative"
              css={{ width: "max-content", maxWidth: "100%" }}
            >
              <Box
                px={dims.bubblePx}
                py={dims.bubblePy}
                borderRadius={dims.bubbleRadius}
                css={{
                  minWidth: hasStatus
                    ? undefined
                    : size === "compact"
                      ? "7rem"
                      : "9rem",
                  minHeight: dims.bubbleMinHeight,
                  background: dynamicElevation(
                    theme.colors.surface,
                    bubbleElevation
                  ),
                  border: `1px solid ${formatColor(
                    theme.typography.colors.muted,
                    {
                      alpha: 0.18
                    }
                  )}`,
                  transition: "background 0.15s ease"
                }}
              >
                {hasStatus ? (
                  <CustomStatusDisplay
                    text={previewText}
                    emoji={emoji}
                    level={dims.bubbleText}
                    textColor="muted"
                    ellipsis
                    emojiSize={dims.bubbleEmoji}
                  />
                ) : (
                  <Typography
                    level={dims.bubbleText}
                    textColor="muted"
                    css={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0
                    }}
                  >
                    {PLACEHOLDER}
                  </Typography>
                )}
              </Box>

              {interactive && hovered && (
                <Stack
                  position="absolute"
                  top={0}
                  right={theme.spacing(0.5)}
                  zIndex={10}
                  direction="row"
                  alignItems="center"
                  spacing={0.25}
                  px={0.375}
                  py={0.25}
                  borderRadius={999}
                  css={{
                    transform: "translateY(-50%)",
                    pointerEvents: "auto",
                    background: dynamicElevation(theme.colors.surface, 5),
                    border: `1px solid ${formatColor(
                      theme.typography.colors.muted,
                      {
                        alpha: 0.22
                      }
                    )}`,
                    boxShadow: `0 1px 6px ${formatColor(theme.colors.neutral, {
                      alpha: 30
                    })}`
                  }}
                >
                  <IconButton
                    variant="plain"
                    size="sm"
                    aria-label="Edit custom status"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.();
                    }}
                    css={{ width: "1.25rem", height: "1.25rem" }}
                  >
                    <PencilIcon size={11} weight="fill" />
                  </IconButton>
                  {hasStatus && (
                    <IconButton
                      variant="plain"
                      size="sm"
                      color={theme.colors.danger}
                      aria-label="Clear custom status"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        onClear?.();
                      }}
                      css={{ width: "1.25rem", height: "1.25rem" }}
                    >
                      <TrashIcon size={11} weight="fill" />
                    </IconButton>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {showName && (
          <Stack
            direction="column"
            spacing={0.25}
            px={2.5}
            pb={2.5}
            minWidth={0}
          >
            <Typography
              level="body-md"
              fontWeight={700}
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {account.displayName}
            </Typography>
            <Typography
              level="body-sm"
              textColor="muted"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {account.username}
            </Typography>
          </Stack>
        )}
      </Paper>
    );
  }
);
