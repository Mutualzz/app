import { Button } from "@components/Button";
import { MessageSearchActiveFilters } from "@components/Channel/MessageSearchActiveFilters";
import { MessageSearchFilters } from "@components/Channel/MessageSearchFilters";
import { IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { FunnelSimpleIcon, MagnifyingGlassIcon, SortAscendingIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { SearchResultsHeaderBar } from "@components/Channel/MessageSearchResultRow";

interface Props {
  title: string;
  query: string;
  onQueryChange: (query: string) => void;
  space?: Space | null;
  channel?: Channel | null;
  showSort?: boolean;
  sortLabel?: string;
  onToggleSort?: () => void;
  isSearching?: boolean;
}

export const MessageSearchResultsHeader = ({
  title,
  query,
  onQueryChange,
  space,
  channel,
  showSort,
  sortLabel,
  onToggleSort,
  isSearching,
}: Props) => {
  const { t } = useTranslation("chat");

  return (
    <>
      <SearchResultsHeaderBar direction="column" spacing={0}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
            <IconSlot size={16} css={{ opacity: isSearching ? 0.7 : 0.45, flexShrink: 0 }}>
              <MagnifyingGlassIcon weight="bold" />
            </IconSlot>
            <Typography
              level="label-sm"
              weight="bold"
              css={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
            <MessageSearchFilters
              query={query}
              onQueryChange={onQueryChange}
              space={space}
              channel={channel}
              trigger={
                <Button
                  size="sm"
                  variant="solid"
                  color="neutral"
                  startDecorator={<FunnelSimpleIcon weight="bold" size={14} />}
                >
                  {t("search.filters")}
                </Button>
              }
            />

            {showSort && onToggleSort ? (
              <Button
                size="sm"
                variant="solid"
                color="neutral"
                onClick={onToggleSort}
                startDecorator={<SortAscendingIcon weight="bold" size={14} />}
              >
                {sortLabel ?? t("search.sort")}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </SearchResultsHeaderBar>

      <MessageSearchActiveFilters
        query={query}
        onQueryChange={onQueryChange}
        space={space}
        channel={channel}
      />
    </>
  );
};
