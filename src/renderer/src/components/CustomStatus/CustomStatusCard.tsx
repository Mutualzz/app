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

const DIMS = {
  avatar: 64,
  banner: 84,
  overlap: 32,
  avatarInset: 2,
  bubbleTop: 17,
  bubbleGap: 4,
  bubbleEmoji: 16,
  bubbleText: "body-sm" as TypographyLevel,
  bubblePx: 0.75,
  bubblePy: 0.5,
  bubbleRadius: 10,
  bubbleMinHeight: 30
};

interface Props {
  account: AccountStore;
  text?: string;
  emoji?: PresenceActivityEmoji | null;
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
    const dims = DIMS;
    const previewText = text.trim();
    const hasStatus = hasCustomStatusContent(previewText, emoji);

    const avatarInset = theme.spacing(dims.avatarInset);
    const bubbleLeft = `calc(${avatarInset} + ${dims.avatar + dims.bubbleGap}px)`;
    const bubbleElevation = interactive && hovered ? 6 : 4;

    return (
      <Paper
        width="100%"
        direction="column"
        borderRadius={10}
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
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
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
                onClick={() => {
                  onEdit?.();
                }}
                css={{
                  cursor: interactive ? "pointer" : "default",
                  minWidth: hasStatus ? undefined : "7rem",
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
              level="body-xs"
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
