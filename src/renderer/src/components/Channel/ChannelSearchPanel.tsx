import { IconButton } from "@components/IconButton";
import { MessageSearchFilters } from "@components/Channel/MessageSearchFilters";
import { Input, useTheme } from "@mutualzz/ui-web";
import { formatColor } from "@mutualzz/ui-core";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const SEARCH_FILTERS_POPOVER_ATTR = "data-search-filters-popover";

interface Props {
  spaceName: string;
  expanded: boolean;
  draft: string;
  submitted: boolean;
  channel?: Channel | null;
  space?: Space | null;
  onExpand: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const COLLAPSED_WIDTH = 160;
const EXPANDED_WIDTH = 280;

export const ChannelSearchPanel = observer(
  ({
    spaceName,
    expanded,
    draft,
    submitted,
    channel,
    space,
    onExpand,
    onDraftChange,
    onSubmit,
    onClose,
  }: Props) => {
    const { t } = useTranslation("chat");
    const { theme } = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const placeholder = t("search.placeholder", { space: spaceName });

    useEffect(() => {
      if (!expanded || submitted) {
        setFiltersOpen(false);
      }
    }, [expanded, submitted]);

    const handleFiltersBlur = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active?.closest(`[${SEARCH_FILTERS_POPOVER_ATTR}]`)) return;
        setFiltersOpen(false);
      }, 0);
    };

    const handleFiltersFocus = () => {
      if (!submitted) {
        setFiltersOpen(true);
      }
    };

    useEffect(() => {
      if (!expanded) return;
      inputRef.current?.focus();
    }, [expanded]);

    useEffect(() => {
      if (!expanded) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [expanded, onClose]);

    const hasDraft = draft.length > 0;
    const activeSearchStyles =
      expanded && !submitted
        ? {
            boxShadow: `0 0 0 1px ${formatColor(theme.colors.primary, { alpha: 0.45, format: "hexa" })}`,
          }
        : undefined;

    const searchInput = expanded ? (
      <Input
        ref={inputRef}
        size="sm"
        width={EXPANDED_WIDTH}
        css={activeSearchStyles}
        endDecorator={
          submitted ? (
            <IconButton
              padding={0}
              size="sm"
              aria-label={t("search.close")}
              onClick={onClose}
            >
              <XIcon weight="bold" />
            </IconButton>
          ) : hasDraft ? (
            <IconButton
              padding={0}
              size="sm"
              aria-label={t("search.submit")}
              onClick={onSubmit}
            >
              <MagnifyingGlassIcon weight="bold" />
            </IconButton>
          ) : (
            <MagnifyingGlassIcon weight="bold" />
          )
        }
        placeholder={placeholder}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onFocus={handleFiltersFocus}
        onBlur={handleFiltersBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    ) : (
      <Input
        size="sm"
        width={COLLAPSED_WIDTH}
        endDecorator={<MagnifyingGlassIcon weight="bold" />}
        placeholder={placeholder}
        value=""
        readOnly
        onClick={onExpand}
        onFocus={onExpand}
        css={{ cursor: "text" }}
      />
    );

    return (
      <MessageSearchFilters
        open={expanded && !submitted && filtersOpen}
        closeOnClickOutside={false}
        popoverAttr={SEARCH_FILTERS_POPOVER_ATTR}
        onPopoverBlur={handleFiltersBlur}
        query={draft}
        onQueryChange={onDraftChange}
        space={space}
        channel={channel}
        trigger={searchInput}
      />
    );
  },
);
