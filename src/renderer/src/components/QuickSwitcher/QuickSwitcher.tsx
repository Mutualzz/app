import { ChannelIcon } from "@components/Channel/ChannelIcon";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useOpenChannel } from "@hooks/useOpenChannel";
import { useAppStore } from "@hooks/useStores";
import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { AtIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { Channel } from "@stores/objects/Channel";
import { observer } from "mobx-react-lite";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const QUICK_SWITCHER_MODAL_ID = "quick-switcher";

export const QuickSwitcher = observer(() => {
  const app = useAppStore();
  const openChannel = useOpenChannel();
  const { closeModal } = useModal();
  const { t } = useTranslation("common");
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = app.channels.searchQuickSwitcher(query);
  const activeIndex = Math.min(selectedIndex, results.length - 1);
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (channel: Channel) => {
    closeModal(QUICK_SWITCHER_MODAL_ID);
    openChannel(channel);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((activeIndex + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((activeIndex - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      choose(results[activeIndex]);
    }
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={4}
      borderRadius={12}
      direction="column"
      spacing={2.5}
      width="min(560px, 90vw)"
    >
      <Input
        autoFocus
        size="lg"
        value={query}
        placeholder={t("quickSwitcher.placeholder")}
        startDecorator={<MagnifyingGlassIcon weight="bold" />}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-label={t("quickSwitcher.label")}
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={
          activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
      />

      <Stack
        ref={listRef}
        id={listId}
        role="listbox"
        direction="column"
        spacing={0.5}
        css={{ maxHeight: "50vh", overflowY: "auto" }}
      >
        {results.length === 0 && (
          <Typography level="body-sm" textColor="muted" p={2}>
            {t("quickSwitcher.empty")}
          </Typography>
        )}

        {results.map((channel, index) => {
          const isSelected = index === activeIndex;
          const isUnread = !!app.readStates.get(channel.id)?.isUnread;

          return (
            <Paper
              key={channel.id}
              id={optionId(index)}
              role="option"
              aria-selected={isSelected}
              elevation={isSelected ? 3 : 0}
              borderRadius={8}
              px={2}
              py={1.5}
              spacing={1.5}
              alignItems="center"
              boxShadow="none !important"
              css={{ cursor: "pointer" }}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(channel);
              }}
            >
              {channel.spaceId ? (
                <ChannelIcon type={channel.type} />
              ) : (
                <AtIcon size={16} />
              )}
              <Typography
                level="body-sm"
                fontWeight={isUnread ? 700 : 500}
                css={{ flex: 1, minWidth: 0 }}
                wrap="nowrap"
              >
                {channel.searchableName ?? t("quickSwitcher.unknown")}
              </Typography>
              <Typography level="body-xs" textColor="muted" wrap="nowrap">
                {channel.space?.name ?? t("directMessage")}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
});
