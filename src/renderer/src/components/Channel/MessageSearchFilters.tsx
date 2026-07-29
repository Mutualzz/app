import { UserAvatar } from "@components/User/UserAvatar";
import { getSearchDisplayName } from "@components/Channel/messageSearch.utils";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import {
  IconSlot,
  Input,
  Popover,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mutualzz/ui-web";
import { formatColor, styled } from "@mutualzz/ui-core";
import type { AppStore } from "@stores/App.store";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { User } from "@stores/objects/User";
import {
  MESSAGE_SEARCH_HAS_FILTERS,
  hasMessageSearchHasFilter,
  parseMessageSearchQuery,
  setMessageSearchModifier,
  toggleMessageSearchHasFilter,
  type MessageSearchHasFilter,
} from "@mutualzz/validators";
import {
  ArticleIcon,
  CalendarBlankIcon,
  CheckIcon,
  HashIcon,
  LinkIcon,
  PaperclipIcon,
  PushPinIcon,
  SmileyStickerIcon,
  ImageIcon,
  FilmStripIcon,
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface PanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  space?: Space | null;
  channel?: Channel | null;
  popoverAttr?: string;
  onPopoverBlur?: () => void;
}

interface Props extends PanelProps {
  open?: boolean;
  closeOnClickOutside?: boolean;
  popoverAttr?: string;
  onPopoverBlur?: () => void;
  trigger: ReactNode;
}

type FilterTab = "from" | "in" | "mentions" | "has" | "options";

const PANEL_WIDTH = 360;

const FilterPanel = styled(Stack)({
  width: PANEL_WIDTH,
  maxWidth: PANEL_WIDTH,
  maxHeight: "min(440px, 72vh)",
  overflow: "hidden",
  borderRadius: 8,
});

const TabBar = styled(Stack)({
  flexDirection: "row",
  gap: 6,
  padding: "10px 10px 8px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  overflowX: "auto",
  flexShrink: 0,
});

const TabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active, theme }) => ({
  appearance: "none",
  border: "none",
  cursor: "pointer",
  height: 30,
  paddingInline: 12,
  borderRadius: 15,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  flexShrink: 0,
  color: active ? "#fff" : theme.typography.colors.muted,
  backgroundColor: active ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.05)",
  transition: "background-color 0.15s ease, color 0.15s ease",
  "&:hover": {
    backgroundColor: active ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.09)",
    color: active ? "#fff" : theme.typography.colors.primary,
  },
}));

const ScrollBody = styled(Stack)({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "10px 8px 12px",
  gap: 2,
});

const SelectRow = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active, theme }) => ({
  appearance: "none",
  border: "none",
  width: "100%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 38,
  padding: "6px 10px",
  borderRadius: 8,
  textAlign: "left",
  fontFamily: "inherit",
  color: theme.typography.colors.primary,
  backgroundColor: active ? "rgba(255, 255, 255, 0.08)" : "transparent",
  transition: "background-color 0.12s ease",
  "&:hover": {
    backgroundColor: active ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
  },
}));

const OptionsCard = styled(Stack)({
  borderRadius: 8,
  padding: "10px 12px",
  gap: 10,
  backgroundColor: "rgba(0, 0, 0, 0.18)",
});

const HAS_ICONS: Record<MessageSearchHasFilter, typeof LinkIcon> = {
  link: LinkIcon,
  embed: ArticleIcon,
  file: PaperclipIcon,
  image: ImageIcon,
  video: FilmStripIcon,
  sticker: SmileyStickerIcon,
};

interface SearchPerson {
  user: User;
  member?: SpaceMember | null;
}

function UserSelectRow({
  app,
  space,
  channel,
  person,
  active,
  onClick,
  prefix,
  accentColor,
}: {
  app: AppStore;
  space?: Space | null;
  channel?: Channel | null;
  person: SearchPerson;
  active: boolean;
  onClick: () => void;
  prefix?: string;
  accentColor: string;
}) {
  const { user, member } = person;
  const displayName = getSearchDisplayName({ app, space, channel, member, user });
  const showUsername =
    displayName.toLowerCase() !== user.username.toLowerCase();

  return (
    <SelectRow active={active} onClick={onClick} type="button">
      <UserAvatar user={user} size="sm" badge={false} />
      <Stack direction="column" spacing={0} flex={1} minWidth={0}>
        <Typography
          level="body-sm"
          weight={active ? 600 : 500}
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {prefix}
          {displayName}
        </Typography>
        {showUsername ? (
          <Typography level="body-xs" textColor="muted">
            @{user.username}
          </Typography>
        ) : null}
      </Stack>
      {active ? (
        <IconSlot size={14} css={{ color: accentColor, flexShrink: 0 }}>
          <CheckIcon weight="bold" />
        </IconSlot>
      ) : null}
    </SelectRow>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <Stack px={1.5} py={3} alignItems="center" justifyContent="center">
      <Typography level="body-sm" textColor="muted" textAlign="center">
        {children}
      </Typography>
    </Stack>
  );
}

const MessageSearchFilterContent = observer(
  ({ query, onQueryChange, space, channel, popoverAttr, onPopoverBlur }: PanelProps) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const { theme } = useTheme();
    const parsed = parseMessageSearchQuery(query);
    const [tab, setTab] = useState<FilterTab>("from");
    const [beforeDraft, setBeforeDraft] = useState(parsed.before ?? "");
    const [afterDraft, setAfterDraft] = useState(parsed.after ?? "");

    const accentColor = formatColor(theme.colors.primary);
    const mutedIconColor = theme.typography.colors.muted;

    const textChannels = useMemo(() => {
      if (!space) return [];
      return space.visibleChannels.filter(
        (item) => item.type === ChannelType.Text,
      );
    }, [space]);

    const people = useMemo(() => {
      const sortPeople = (entries: SearchPerson[]) =>
        [...entries].sort((a, b) =>
          getSearchDisplayName({
            app,
            space,
            channel,
            member: a.member,
            user: a.user,
          }).localeCompare(
            getSearchDisplayName({
              app,
              space,
              channel,
              member: b.member,
              user: b.user,
            }),
          ),
        );

      if (space) {
        return sortPeople(
          space.members.all
            .filter((member): member is SpaceMember & { user: User } => !!member.user)
            .map((member) => ({ user: member.user, member })),
        );
      }

      if (channel?.isDM || channel?.isGroupDM) {
        const list = [...channel.dmRecipientsList];
        const me = app.account ? app.users.get(app.account.id) : undefined;
        if (me && !list.some((user) => user.id === me.id)) {
          list.unshift(me);
        }
        return sortPeople(list.map((user) => ({ user, member: null })));
      }

      return [];
    }, [space, channel, app.account]);

    const tabs = useMemo(() => {
      const items: { id: FilterTab; label: string }[] = [
        { id: "from", label: t("search.filterFrom") },
        { id: "mentions", label: t("search.filterMentions") },
        { id: "has", label: t("search.filterHas") },
        { id: "options", label: t("search.filterOptions") },
      ];
      if (space) {
        items.splice(1, 0, { id: "in", label: t("search.filterIn") });
      }
      return items;
    }, [space, t]);

    const applyDateFilters = () => {
      let next = setMessageSearchModifier(query, "before", beforeDraft || undefined);
      next = setMessageSearchModifier(next, "after", afterDraft || undefined);
      onQueryChange(next);
    };

    const toggleFrom = (username: string) => {
      const active =
        parsed.from?.toLowerCase() === username.toLowerCase() ||
        (parsed.from === "me" &&
          app.account?.username.toLowerCase() === username.toLowerCase());
      onQueryChange(
        setMessageSearchModifier(query, "from", active ? undefined : username),
      );
    };

    const toggleMentions = (username: string) => {
      const active =
        parsed.mentions?.toLowerCase() === username.toLowerCase() ||
        (parsed.mentions === "me" &&
          app.account?.username.toLowerCase() === username.toLowerCase());
      onQueryChange(
        setMessageSearchModifier(
          query,
          "mentions",
          active ? undefined : username,
        ),
      );
    };

    const toggleIn = (channelName: string) => {
      const active = parsed.in?.toLowerCase() === channelName.toLowerCase();
      onQueryChange(
        setMessageSearchModifier(query, "in", active ? undefined : channelName),
      );
    };

    const activeTabBg = formatColor(theme.colors.primary, { alpha: 0.85, format: "hexa" });

    return (
      <FilterPanel
        direction="column"
        {...(popoverAttr ? { [popoverAttr]: "" } : {})}
        onMouseDown={(event) => event.preventDefault()}
        onBlur={onPopoverBlur}
        tabIndex={-1}
      >
        <TabBar>
          {tabs.map((item) => {
            const isActive = tab === item.id;
            return (
              <TabButton
                key={item.id}
                type="button"
                active={isActive}
                onClick={() => setTab(item.id)}
                css={
                  isActive
                    ? { backgroundColor: activeTabBg, color: "#fff" }
                    : undefined
                }
              >
                {item.label}
              </TabButton>
            );
          })}
        </TabBar>

        <ScrollBody direction="column">
          {tab === "from" ? (
            people.length === 0 ? (
              <EmptyHint>{t("search.empty")}</EmptyHint>
            ) : (
              people.slice(0, 24).map((person) => (
                <UserSelectRow
                  key={person.user.id}
                  app={app}
                  space={space}
                  channel={channel}
                  person={person}
                  accentColor={accentColor}
                  active={
                    parsed.from?.toLowerCase() === person.user.username.toLowerCase() ||
                    (parsed.from === "me" && person.user.id === app.account?.id)
                  }
                  onClick={() => toggleFrom(person.user.username)}
                />
              ))
            )
          ) : null}

          {tab === "in" ? (
            textChannels.filter((item): item is typeof item & { name: string } =>
              Boolean(item.name?.trim()),
            ).length === 0 ? (
              <EmptyHint>{t("search.empty")}</EmptyHint>
            ) : (
              textChannels
                .filter((item): item is typeof item & { name: string } =>
                  Boolean(item.name?.trim()),
                )
                .slice(0, 24)
                .map((item) => {
                  const active =
                    parsed.in?.toLowerCase() === item.name.toLowerCase();
                  return (
                    <SelectRow
                      key={item.id}
                      active={active}
                      onClick={() => toggleIn(item.name)}
                      type="button"
                    >
                      <IconSlot size={16} css={{ color: mutedIconColor, flexShrink: 0 }}>
                        <HashIcon weight="bold" />
                      </IconSlot>
                      <Typography
                        level="body-sm"
                        weight={active ? 600 : 500}
                        css={{
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {active ? (
                        <IconSlot size={14} css={{ color: accentColor, flexShrink: 0 }}>
                          <CheckIcon weight="bold" />
                        </IconSlot>
                      ) : null}
                    </SelectRow>
                  );
                })
            )
          ) : null}

          {tab === "mentions" ? (
            people.length === 0 ? (
              <EmptyHint>{t("search.empty")}</EmptyHint>
            ) : (
              people.slice(0, 20).map((person) => (
                <UserSelectRow
                  key={`mention-${person.user.id}`}
                  app={app}
                  space={space}
                  channel={channel}
                  person={person}
                  prefix="@"
                  accentColor={accentColor}
                  active={
                    parsed.mentions?.toLowerCase() === person.user.username.toLowerCase() ||
                    (parsed.mentions === "me" && person.user.id === app.account?.id)
                  }
                  onClick={() => toggleMentions(person.user.username)}
                />
              ))
            )
          ) : null}

          {tab === "has"
            ? MESSAGE_SEARCH_HAS_FILTERS.map((filter) => {
                const active = hasMessageSearchHasFilter(query, filter);
                const Icon = HAS_ICONS[filter];
                return (
                  <SelectRow
                    key={filter}
                    type="button"
                    active={active}
                    onClick={() =>
                      onQueryChange(toggleMessageSearchHasFilter(query, filter))
                    }
                  >
                    <IconSlot
                      size={16}
                      css={{
                        color: active ? accentColor : mutedIconColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon weight={active ? "fill" : "bold"} />
                    </IconSlot>
                    <Typography
                      level="body-sm"
                      weight={active ? 600 : 500}
                      css={{ flex: 1 }}
                    >
                      {t(`search.has.${filter}`)}
                    </Typography>
                    {active ? (
                      <IconSlot size={14} css={{ color: accentColor, flexShrink: 0 }}>
                        <CheckIcon weight="bold" />
                      </IconSlot>
                    ) : null}
                  </SelectRow>
                );
              })
            : null}

          {tab === "options" ? (
            <Stack direction="column" spacing={1.25}>
              <OptionsCard direction="column">
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <IconSlot size={16} css={{ color: mutedIconColor }}>
                      <PushPinIcon weight="fill" />
                    </IconSlot>
                    <Typography level="body-sm" weight={500}>
                      {t("search.filterPinned")}
                    </Typography>
                  </Stack>
                  <Switch
                    size="sm"
                    checked={Boolean(parsed.pinned)}
                    onChange={(event) =>
                      onQueryChange(
                        setMessageSearchModifier(
                          query,
                          "pinned",
                          event.target.checked ? true : undefined,
                        ),
                      )
                    }
                  />
                </Stack>
              </OptionsCard>

              <OptionsCard direction="column">
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <IconSlot size={16} css={{ color: mutedIconColor }}>
                    <CalendarBlankIcon weight="bold" />
                  </IconSlot>
                  <Typography level="body-sm" weight={600}>
                    {t("search.filterDates")}
                  </Typography>
                </Stack>
                <Input
                  size="sm"
                  placeholder={t("search.filterBefore")}
                  value={beforeDraft}
                  onChange={(event) => setBeforeDraft(event.target.value)}
                  onBlur={applyDateFilters}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyDateFilters();
                  }}
                />
                <Input
                  size="sm"
                  placeholder={t("search.filterAfter")}
                  value={afterDraft}
                  onChange={(event) => setAfterDraft(event.target.value)}
                  onBlur={applyDateFilters}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyDateFilters();
                  }}
                />
              </OptionsCard>
            </Stack>
          ) : null}
        </ScrollBody>
      </FilterPanel>
    );
  },
);

export const MessageSearchFilters = observer(
  ({
    query,
    onQueryChange,
    space,
    channel,
    open,
    closeOnClickOutside = true,
    popoverAttr,
    onPopoverBlur,
    trigger,
  }: Props) => {
    return (
      <Popover
        placement="bottom"
        p={0}
        width={PANEL_WIDTH}
        surfaceRole="popout"
        elevation={8}
        closeOnClickOutside={closeOnClickOutside}
        isOpen={open}
        trigger={trigger}
        css={{ borderRadius: 8, overflow: "hidden" }}
      >
        <MessageSearchFilterContent
          query={query}
          onQueryChange={onQueryChange}
          space={space}
          channel={channel}
          popoverAttr={popoverAttr}
          onPopoverBlur={onPopoverBlur}
        />
      </Popover>
    );
  },
);
