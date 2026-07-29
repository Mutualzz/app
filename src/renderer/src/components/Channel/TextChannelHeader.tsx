import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  Divider,
  IconSlot,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { resolveWallpaperDivider } from "@mutualzz/ui-core";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import { ChannelPinnedPopover } from "@components/Channel/ChannelPinnedPopover";
import { ChannelSearchPanel } from "@components/Channel/ChannelSearchPanel";
import { IconButton } from "../IconButton";
import { HashIcon, UsersIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { useTranslation } from "react-i18next";

interface Props {
  channel?: Channel | null;
  searchExpanded: boolean;
  searchDraft: string;
  searchSubmitted: boolean;
  onSearchExpand: () => void;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClose: () => void;
}

export const TextChannelHeader = observer(({
  channel,
  searchExpanded,
  searchDraft,
  searchSubmitted,
  onSearchExpand,
  onSearchDraftChange,
  onSearchSubmit,
  onSearchClose,
}: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");

  return (
    <Paper
      variant="plain"
      elevation={0}
      p={2.5}
      height="100%"
      borderLeft="0 !important"
      borderRight="0 !important"
      borderTop="0 !important"
      maxHeight="2.95rem"
      direction="row"
      boxShadow="0 !important"
      alignItems="center"
      justifyContent="space-between"
      css={{
        background: "transparent",
        ...(theme.backgroundImageUrl
          ? {
              borderBottom: `1px solid ${resolveWallpaperDivider(theme)}`
            }
          : null)
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flex={1}
        spacing={2}
        minWidth={0}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconSlot size={16}>
            <HashIcon />
          </IconSlot>
          <Typography level="label-sm" weight="bold">
            {channel?.name}
          </Typography>
        </Stack>
        <Stack flex="1 1 auto" direction="row" alignItems="center" minWidth={0}>
          {channel?.topic && (
            <>
              <Divider
                style={{
                  margin: "0 8px"
                }}
                orientation="vertical"
              />
              <MarkdownRenderer value={channel.topic} />
            </>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.25} flexShrink={0}>
        {channel && (
          <>
            <Tooltip content={t("header.pins")}>
              <ChannelPinnedPopover channel={channel} />
            </Tooltip>
            <Tooltip
              content={
                app.memberListVisible
                  ? t("header.memberList.hide")
                  : t("header.memberList.show")
              }
              placement="bottom"
            >
              <IconButton
                color={app.memberListVisible ? "success" : undefined}
                onClick={() => app.toggleMemberList()}
              >
                <UsersIcon weight="fill" />
              </IconButton>
            </Tooltip>
            <ChannelSearchPanel
              spaceName={channel.space?.name ?? t("unknownSpace")}
              expanded={searchExpanded}
              draft={searchDraft}
              submitted={searchSubmitted}
              channel={channel}
              space={channel.space}
              onExpand={onSearchExpand}
              onDraftChange={onSearchDraftChange}
              onSubmit={onSearchSubmit}
              onClose={onSearchClose}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
});
