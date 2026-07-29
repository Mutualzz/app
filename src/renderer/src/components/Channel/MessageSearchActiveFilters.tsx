import { IconButton } from "@components/IconButton";
import { getSearchDisplayName } from "@components/Channel/messageSearch.utils";
import { useAppStore } from "@hooks/useStores";
import { IconSlot, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { formatColor } from "@mutualzz/ui-core";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import {
  parseMessageSearchQuery,
  setMessageSearchModifier,
  toggleMessageSearchHasFilter,
  type MessageSearchHasFilter,
} from "@mutualzz/validators";
import { XIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  space?: Space | null;
  channel?: Channel | null;
}

interface FilterPill {
  key: string;
  label: string;
  remove: () => void;
}

export const MessageSearchActiveFilters = ({
  query,
  onQueryChange,
  space,
  channel,
}: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const { theme } = useTheme();
  const parsed = parseMessageSearchQuery(query);
  const pills: FilterPill[] = [];

  if (parsed.from) {
    pills.push({
      key: "from",
      label:
        parsed.from.toLowerCase() === "me"
          ? t("search.activeFromMe")
          : t("search.activeFromUser", {
              user: getSearchDisplayName({
                app,
                space,
                channel,
                username: parsed.from,
              }),
            }),
      remove: () => onQueryChange(setMessageSearchModifier(query, "from", undefined)),
    });
  }

  if (parsed.in) {
    pills.push({
      key: "in",
      label: t("search.activeInChannel", { channel: parsed.in }),
      remove: () => onQueryChange(setMessageSearchModifier(query, "in", undefined)),
    });
  }

  if (parsed.mentions) {
    pills.push({
      key: "mentions",
      label:
        parsed.mentions.toLowerCase() === "me"
          ? t("search.filterMentionsMe")
          : t("search.activeMentionsUser", {
              user: getSearchDisplayName({
                app,
                space,
                channel,
                username: parsed.mentions,
              }),
            }),
      remove: () =>
        onQueryChange(setMessageSearchModifier(query, "mentions", undefined)),
    });
  }

  for (const filter of parsed.has) {
    pills.push({
      key: `has-${filter}`,
      label: t(`search.has.${filter}`),
      remove: () =>
        onQueryChange(toggleMessageSearchHasFilter(query, filter)),
    });
  }

  if (parsed.pinned) {
    pills.push({
      key: "pinned",
      label: t("search.filterPinned"),
      remove: () => onQueryChange(setMessageSearchModifier(query, "pinned", undefined)),
    });
  }

  if (parsed.before) {
    pills.push({
      key: "before",
      label: t("search.activeBefore", { date: parsed.before }),
      remove: () => onQueryChange(setMessageSearchModifier(query, "before", undefined)),
    });
  }

  if (parsed.after) {
    pills.push({
      key: "after",
      label: t("search.activeAfter", { date: parsed.after }),
      remove: () => onQueryChange(setMessageSearchModifier(query, "after", undefined)),
    });
  }

  if (pills.length === 0) return null;

  const accentBg = formatColor(theme.colors.primary, { alpha: 0.14, format: "hexa" });
  const accentBorder = formatColor(theme.colors.primary, { alpha: 0.32, format: "hexa" });
  const accentText = formatColor(theme.colors.primary);

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      px={2}
      pb={1.25}
      css={{ gap: 6 }}
    >
      {pills.map((pill) => (
        <Stack
          key={pill.key}
          direction="row"
          alignItems="center"
          spacing={0.5}
          css={{
            height: 26,
            paddingLeft: 10,
            paddingRight: 4,
            borderRadius: 13,
            backgroundColor: accentBg,
            border: `1px solid ${accentBorder}`,
            flexShrink: 0,
          }}
        >
          <Typography
            level="body-xs"
            weight={600}
            css={{ color: accentText, lineHeight: 1 }}
          >
            {pill.label}
          </Typography>
          <IconButton
            padding={0}
            size="sm"
            aria-label={t("search.removeFilter")}
            onClick={pill.remove}
            css={{
              width: 18,
              height: 18,
              minWidth: 18,
              borderRadius: 9,
              color: theme.typography.colors.muted,
              "&:hover": {
                color: theme.typography.colors.primary,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <IconSlot size={11}>
              <XIcon weight="bold" />
            </IconSlot>
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
};
