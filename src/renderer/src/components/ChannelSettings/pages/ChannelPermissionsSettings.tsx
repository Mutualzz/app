import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { Space } from "@stores/objects/Space";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import {
  BitField,
  type PermissionFlag,
  permissionFlags
} from "@mutualzz/bitfield";
import { type APIChannel, ChannelType } from "@mutualzz/types";
import { Fragment, JSX, useEffect, useRef, useState } from "react";
import {
  Box,
  ButtonGroup,
  Divider,
  IconSlot,
  InputDefault,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { PermissionEditorControls } from "@components/Permissions/PermissionEditorControls";
import {
  filterPermissionGroups,
  permissionCategoryId,
  scrollToPermissionCategory
} from "@components/Permissions/permissionEditor.utils";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  XIcon
} from "@phosphor-icons/react";
import { UserAvatar } from "@components/User/UserAvatar";
import { ChannelPermissionOverwrite } from "@stores/objects/ChannelPermissionOverwrite";

interface Props {
  space: Space;
  channel: Channel;
}

type OverwriteState = "allow" | "deny" | "neutral";

interface OverwriteDraft {
  allow: bigint;
  deny: bigint;
}

function overwriteKey(ow: ChannelPermissionOverwrite): string {
  if (ow.roleId) return `r:${ow.roleId}`;
  if (ow.userId) return `u:${ow.userId}`;
  return "x";
}

function makeKey(id: string, kind: "role" | "member"): string {
  return kind === "role" ? `r:${id}` : `u:${id}`;
}

function parseKey(key: string): { id: string; kind: "role" | "member" } {
  const [prefix, id] = key.split(":");
  return { id, kind: prefix === "r" ? "role" : "member" };
}

type DraftMap = Map<string, OverwriteDraft>;

function getState(draft: OverwriteDraft, flag: PermissionFlag): OverwriteState {
  const allow = BitField.fromString(permissionFlags, draft.allow.toString());
  const deny = BitField.fromString(permissionFlags, draft.deny.toString());
  if (allow.has(flag)) return "allow";
  if (deny.has(flag)) return "deny";
  return "neutral";
}

function applyState(
  draft: OverwriteDraft,
  flag: PermissionFlag,
  next: OverwriteState
): OverwriteDraft {
  let allow = BitField.fromString(permissionFlags, draft.allow.toString());
  let deny = BitField.fromString(permissionFlags, draft.deny.toString());
  allow = allow.remove(flag);
  deny = deny.remove(flag);
  if (next === "allow") allow = allow.add(flag);
  if (next === "deny") deny = deny.add(flag);
  return { allow: allow.bits, deny: deny.bits };
}

function draftsEqual(a: OverwriteDraft, b: OverwriteDraft) {
  return a.allow === b.allow && a.deny === b.deny;
}

interface PermissionDef {
  flag: PermissionFlag;
  label: string;
  description?: string;
}

const ALL_PERMISSION_GROUPS: {
  title: string;
  channelTypes: ChannelType[];
  items: PermissionDef[];
}[] = [
  {
    title: "General Channel Permissions",
    channelTypes: [ChannelType.Text, ChannelType.Voice, ChannelType.Category],
    items: [
      {
        flag: "ViewChannel",
        label: "View Channel",
        description: "Allow members to view this channel"
      },
      {
        flag: "ManageChannels",
        label: "Manage Channel",
        description: "Allow members to edit or delete this channel"
      },
      {
        flag: "ManageRoles",
        label: "Manage Permissions",
        description:
          "Allow members to edit this channel's permission overwrites"
      }
    ]
  },
  {
    title: "Text Channel Permissions",
    channelTypes: [ChannelType.Text, ChannelType.Category],
    items: [
      {
        flag: "SendMessages",
        label: "Send Messages",
        description: "Allow members to send messages in this channel"
      },
      {
        flag: "EmbedLinks",
        label: "Embed Links",
        description: "Allow members to embed links"
      },
      {
        flag: "AttachFiles",
        label: "Attach Files",
        description: "Allow members to attach files"
      },
      {
        flag: "MentionEveryone",
        label: "Mention Everyone",
        description: "Allow members to @mention @everyone and @here"
      },
      {
        flag: "UseExternalEmojis",
        label: "Use External Emojis",
        description: "Allow members to use emojis from other spaces"
      },
      {
        flag: "ManageMessages",
        label: "Manage Messages",
        description: "Allow members to delete others' messages"
      },
      {
        flag: "ReadMessageHistory",
        label: "Read Message History",
        description: "Allow members to read past messages"
      }
    ]
  },
  {
    title: "Voice Channel Permissions",
    channelTypes: [ChannelType.Voice, ChannelType.Category],
    items: [
      {
        flag: "Connect",
        label: "Connect",
        description: "Allow members to connect to this voice channel"
      },
      {
        flag: "Speak",
        label: "Speak",
        description: "Allow members to speak in this voice channel"
      }
    ]
  }
];

function getPermissionGroups(type: ChannelType) {
  return ALL_PERMISSION_GROUPS.filter((g) => g.channelTypes.includes(type));
}

const StateBtn = ({
  state,
  active,
  onClick
}: {
  state: OverwriteState;
  active: boolean;
  onClick: () => void;
}) => {
  const { theme } = useTheme();

  const colorMap: Record<OverwriteState, string> = {
    allow: theme.colors.success,
    deny: theme.colors.danger,
    neutral: theme.typography.colors.muted
  };

  const iconMap: Record<OverwriteState, JSX.Element> = {
    allow: <CheckIcon weight="bold" size={13} />,
    deny: <XIcon weight="bold" size={13} />,
    neutral: <MinusIcon weight="bold" size={13} />
  };

  const c = colorMap[state];

  return (
    <Stack
      onClick={onClick}
      alignItems="center"
      justifyContent="center"
      css={{
        width: 26,
        height: 26,
        borderRadius: 6,
        cursor: "pointer",
        border: `2px solid ${active ? c : `${c}44`}`,
        background: active ? `${c}22` : "transparent",
        color: active ? c : `${c}66`,
        transition: "border 0.12s, background 0.12s, color 0.12s",
        "&:hover": {
          border: `2px solid ${c}`,
          background: `${c}22`,
          color: c
        }
      }}
    >
      {iconMap[state]}
    </Stack>
  );
};

const PermissionRow = ({
  flag,
  label,
  description,
  draft,
  onChange
}: PermissionDef & {
  draft: OverwriteDraft;
  onChange: (next: OverwriteDraft) => void;
}) => {
  const { theme } = useTheme();
  const current = getState(draft, flag);

  const toggle = (next: OverwriteState) => {
    onChange(applyState(draft, flag, current === next ? "neutral" : next));
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      px={2}
      py={1.25}
      borderRadius={6}
      css={{
        "&:hover": {
          background: formatColor(dynamicElevation(theme.colors.surface, 4), {
            alpha: 60
          })
        }
      }}
    >
      <Stack direction="column" spacing={0.25} flex={1}>
        <Typography fontWeight="bold" level="label-sm">
          {label}
        </Typography>
        {description && (
          <Typography level="body-xs" textColor="muted">
            {description}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <StateBtn
          state="allow"
          active={current === "allow"}
          onClick={() => toggle("allow")}
        />
        <StateBtn
          state="neutral"
          active={current === "neutral"}
          onClick={() => toggle("neutral")}
        />
        <StateBtn
          state="deny"
          active={current === "deny"}
          onClick={() => toggle("deny")}
        />
      </Stack>
    </Stack>
  );
};

interface TargetEntry {
  key: string;
  id: string;
  kind: "role" | "member";
  label: string;
  color?: string;
  user?: any;
}

const TargetItem = ({
  entry,
  selected,
  dirty,
  onClick,
  onRemove
}: {
  entry: TargetEntry;
  selected: boolean;
  dirty: boolean;
  onClick: () => void;
  onRemove: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      px={1.5}
      py={1.25}
      borderRadius={6}
      css={{
        cursor: "pointer",
        background: selected
          ? formatColor(dynamicElevation(theme.colors.surface, 6), {
              alpha: 80
            })
          : "transparent",
        "&:hover": {
          background: formatColor(
            dynamicElevation(theme.colors.surface, selected ? 6 : 4),
            { alpha: selected ? 80 : 60 }
          )
        }
      }}
      onClick={onClick}
      justifyContent="space-between"
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        flex={1}
        minWidth={0}
      >
        {entry.kind === "role" ? (
          <ShieldIcon weight="fill" size={13} color={entry.color} />
        ) : (
          <UserAvatar user={entry.user} size={16} disableContextMenu />
        )}
        <Typography
          level="body-sm"
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {entry.label}
        </Typography>
        {dirty && (
          <Box
            css={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: theme.colors.warning,
              flexShrink: 0
            }}
          />
        )}
      </Stack>
      <IconButton
        size="sm"
        variant="plain"
        color="danger"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        css={{ flexShrink: 0 }}
      >
        <TrashIcon size={12} weight="fill" />
      </IconButton>
    </Stack>
  );
};

const AddOverwritePicker = observer(
  ({
    space,
    existing,
    onAdd
  }: {
    space: Space;
    existing: Set<string>;
    onAdd: (id: string, kind: "role" | "member") => void;
  }) => {
    const { theme } = useTheme();
    const { closeModal } = useModal();
    const [search, setSearch] = useState("");
    const q = search.toLowerCase();

    const roles = space.roles.assignable.filter(
      (r) =>
        !existing.has(`r:${r.id}`) &&
        (q === "" || r.name.toLowerCase().includes(q))
    );

    const members = space.members.all.filter(
      (m) =>
        !existing.has(`u:${m.id}`) &&
        (q === "" ||
          m.displayName.toLowerCase().includes(q) ||
          m.user?.username.toLowerCase().includes(q))
    );

    const handleAdd = (id: string, kind: "role" | "member") => {
      onAdd(id, kind);
      closeModal("add-channel-overwrite");
    };

    return (
      <Paper
        direction="column"
        elevation={5}
        width="28vw"
        maxWidth={380}
        borderRadius={10}
        spacing={2.5}
        p={4}
      >
        <Stack direction="column" spacing={0.5}>
          <Typography level="h5">Add Permission Overwrite</Typography>
          <Typography level="body-sm" textColor="muted">
            Select a role or member to configure channel-specific permissions.
          </Typography>
        </Stack>

        <InputDefault
          placeholder="Search roles or members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          type="text"
        />

        <Stack
          direction="column"
          spacing={0.75}
          css={{ maxHeight: 320, overflowY: "auto" }}
        >
          {roles.length > 0 && (
            <>
              <Typography level="body-xs" textColor="muted" px={1}>
                ROLES
              </Typography>
              {roles.map((role) => (
                <Stack
                  key={role.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  px={1.5}
                  py={1.25}
                  borderRadius={6}
                  css={{
                    cursor: "pointer",
                    "&:hover": {
                      background: formatColor(
                        dynamicElevation(theme.colors.surface, 5),
                        { alpha: 60 }
                      )
                    }
                  }}
                  onClick={() => handleAdd(role.id, "role")}
                >
                  <ShieldIcon weight="fill" size={13} color={role.color} />
                  <Typography level="body-sm">{role.name}</Typography>
                </Stack>
              ))}
            </>
          )}

          {members.length > 0 && (
            <>
              <Typography
                level="body-xs"
                textColor="muted"
                px={1}
                mt={roles.length ? 1 : 0}
              >
                MEMBERS
              </Typography>
              {members.map((member) => (
                <Stack
                  key={member.id}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  px={1.5}
                  py={1.25}
                  borderRadius={6}
                  css={{
                    cursor: "pointer",
                    "&:hover": {
                      background: formatColor(
                        dynamicElevation(theme.colors.surface, 5),
                        { alpha: 60 }
                      )
                    }
                  }}
                  onClick={() => handleAdd(member.id, "member")}
                >
                  <UserAvatar user={member.user} size={18} disableContextMenu />
                  <Typography level="body-sm">{member.displayName}</Typography>
                  <Typography level="body-xs" textColor="muted">
                    {member.user?.username}
                  </Typography>
                </Stack>
              ))}
            </>
          )}

          {roles.length === 0 && members.length === 0 && (
            <Typography
              level="body-sm"
              textColor="muted"
              textAlign="center"
              py={2}
            >
              No results
            </Typography>
          )}
        </Stack>
      </Paper>
    );
  }
);

export const ChannelPermissionsSettings = observer(
  ({ space, channel }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const buildDrafts = (): DraftMap => {
      const map: DraftMap = new Map();
      for (const ow of channel.overwrites) {
        map.set(overwriteKey(ow), {
          allow: ow.allow.bits,
          deny: ow.deny.bits
        });
      }
      return map;
    };

    const [drafts, setDrafts] = useState<DraftMap>(buildDrafts);
    const [bases, setBases] = useState<DraftMap>(buildDrafts);
    const [selectedKey, setSelectedKey] = useState<string | null>(() => {
      const first = channel.overwrites[0];
      return first ? overwriteKey(first) : null;
    });

    const dirtyKeys = (() => {
      const set = new Set<string>();
      for (const [key, draft] of drafts.entries()) {
        const base = bases.get(key);
        if (!base || !draftsEqual(draft, base)) set.add(key);
      }
      return set;
    })();

    const { mutate: saveOverwrite, isPending: saving } = useMutation({
      mutationKey: ["save-channel-overwrite", channel.id, selectedKey],
      mutationFn: async () => {
        if (!selectedKey) return null;
        const draft = drafts.get(selectedKey);
        if (!draft) return null;

        const { id, kind } = parseKey(selectedKey);
        const body = {
          allow: draft.allow.toString(),
          deny: draft.deny.toString()
        };

        return app.rest.put<APIChannel>(
          `/channels/${channel.id}/permissions/${id}?type=${kind}`,
          body
        );
      },
      onSuccess: (data) => {
        if (!data || !selectedKey) return;

        space.updateChannel(data);

        const draft = drafts.get(selectedKey)!;
        setBases((prev) => {
          const next = new Map(prev);
          next.set(selectedKey, { ...draft });
          return next;
        });

        space.members.me?.invalidateChannelPermCache?.();
      }
    });

    const { mutate: deleteOverwrite } = useMutation({
      mutationKey: ["delete-channel-overwrite", channel.id],
      mutationFn: async (key: string) => {
        // If this key was never saved to the DB, don't hit the API
        if (!bases.has(key)) return null;

        const { id, kind } = parseKey(key);
        return app.rest.delete<APIChannel>(
          `/channels/${channel.id}/permissions/${id}?type=${kind}`
        );
      },
      onSuccess: (data, key) => {
        if (data) space.updateChannel(data);

        setDrafts((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        setBases((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });

        if (selectedKey === key) {
          const remaining = [...drafts.keys()].filter((k) => k !== key);
          setSelectedKey(remaining[0] ?? null);
        }

        space.members.me?.invalidateChannelPermCache?.();
      }
    });

    const addOverwrite = (id: string, kind: "role" | "member") => {
      const key = makeKey(id, kind);
      setDrafts((prev) => {
        if (prev.has(key)) return prev;
        const next = new Map(prev);
        next.set(key, { allow: 0n, deny: 0n });
        return next;
      });
      setSelectedKey(key);
    };

    const updateDraft = (key: string, next: OverwriteDraft) => {
      setDrafts((prev) => new Map(prev).set(key, next));
    };

    const resetSelected = () => {
      if (!selectedKey) return;
      const base = bases.get(selectedKey);
      // If never saved, reset back to all-neutral (0n, 0n)
      updateDraft(selectedKey, base ? { ...base } : { allow: 0n, deny: 0n });
    };

    const targetEntries: TargetEntry[] = [...drafts.keys()].map((key) => {
      const { id, kind } = parseKey(key);
      if (kind === "role") {
        const role = space.roles.get(id);
        return { key, id, kind, label: role?.name ?? id, color: role?.color };
      }
      const member = space.members.get(id);
      return {
        key,
        id,
        kind,
        label: member?.displayName ?? id,
        user: member?.user
      };
    });

    const permissionsRootRef = useRef<HTMLDivElement>(null);
    const [permissionSearch, setPermissionSearch] = useState("");

    const permissionGroups = getPermissionGroups(channel.type);
    const permissionCategories = permissionGroups.map((group) => ({
      id: permissionCategoryId(group.title),
      title: group.title
    }));
    const visiblePermissionGroups = filterPermissionGroups(
      permissionGroups,
      permissionSearch
    );

    const handlePermissionCategoryJump = (categoryId: string) => {
      setPermissionSearch("");
      setTimeout(() => {
        scrollToPermissionCategory(permissionsRootRef.current, categoryId);
      }, 0);
    };

    useEffect(() => {
      setPermissionSearch("");
    }, [selectedKey]);

    const existingKeys = new Set(drafts.keys());
    const selectedDraft = selectedKey ? drafts.get(selectedKey) : null;
    const selectedEntry = selectedKey
      ? targetEntries.find((e) => e.key === selectedKey)
      : null;
    const isSelectedDirty = selectedKey ? dirtyKeys.has(selectedKey) : false;

    return (
      <Stack direction="row" flex={1} minWidth={0} height="100%" minHeight={0}>
        <Paper
          direction="column"
          borderLeft="0 !important"
          borderTop="0 !important"
          borderBottom="0 !important"
          spacing={2}
          minWidth="10em"
          maxWidth="10em"
          width="100%"
          elevation={app.settings?.preferEmbossed ? 3 : 1}
          py={2.5}
          px={1.25}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={0.5}
          >
            <Typography level="body-xs" textColor="muted">
              OVERWRITES
            </Typography>
            <IconButton
              size="sm"
              variant="plain"
              onClick={() =>
                openModal(
                  "add-channel-overwrite",
                  <AddOverwritePicker
                    space={space}
                    existing={existingKeys}
                    onAdd={(id, kind) => {
                      addOverwrite(id, kind);
                    }}
                  />
                )
              }
            >
              <PlusIcon size={13} />
            </IconButton>
          </Stack>

          <Stack direction="column" spacing={0.5}>
            {targetEntries.length === 0 && (
              <Typography
                level="body-xs"
                textColor="muted"
                textAlign="center"
                py={2}
              >
                No overwrites yet
              </Typography>
            )}
            {targetEntries.map((entry) => (
              <TargetItem
                key={entry.key}
                entry={entry}
                selected={selectedKey === entry.key}
                dirty={dirtyKeys.has(entry.key)}
                onClick={() => setSelectedKey(entry.key)}
                onRemove={() => deleteOverwrite(entry.key)}
              />
            ))}
          </Stack>
        </Paper>

        <Stack
          direction="column"
          spacing={2.5}
          px={4}
          py={2.5}
          flex={1}
          minWidth={0}
          minHeight={0}
          overflow="auto"
        >
          {!selectedKey || !selectedDraft ? (
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              direction="column"
              spacing={2}
            >
              <IconSlot size={40}>
                <ShieldIcon weight="thin" />
              </IconSlot>
              <Typography textColor="muted" textAlign="center" level="body-sm">
                Select a role or member on the left to edit their permissions
                for this channel, or click <strong>+</strong> to add one.
              </Typography>
            </Stack>
          ) : (
            <Stack
              ref={permissionsRootRef}
              direction="column"
              spacing={2.5}
              flex={1}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {selectedEntry?.kind === "role" ? (
                  <IconSlot size={16}>
                    <ShieldIcon weight="fill" color={selectedEntry.color} />
                  </IconSlot>
                ) : (
                  <UserAvatar
                    user={selectedEntry?.user}
                    size={20}
                    disableContextMenu
                  />
                )}
                <Typography
                  level="label-sm"
                  fontFamily="monospace"
                  weight="bold"
                >
                  {selectedEntry?.label}
                </Typography>
              </Stack>

              <PermissionEditorControls
                search={permissionSearch}
                onSearchChange={setPermissionSearch}
                categories={permissionCategories}
                onCategoryJump={handlePermissionCategoryJump}
              />

              {visiblePermissionGroups.length === 0 ? (
                <Typography textColor="muted" textAlign="center" py={4}>
                  No permissions match your search
                </Typography>
              ) : (
                visiblePermissionGroups.map((group, gi) => {
                  const categoryId = permissionCategoryId(group.title);

                  return (
                    <Stack
                      key={categoryId}
                      direction="column"
                      spacing={1}
                      data-permission-category={categoryId}
                    >
                      <Typography
                        level="body-sm"
                        textColor="secondary"
                        fontWeight="bold"
                        px={2}
                      >
                        {group.title}
                      </Typography>
                      <Stack direction="column" spacing={0.25}>
                        {group.items.map((item, ii) => (
                          <Fragment key={item.flag}>
                            <PermissionRow
                              {...item}
                              draft={selectedDraft}
                              onChange={(next) =>
                                updateDraft(selectedKey, next)
                              }
                            />
                            {ii < group.items.length - 1 && (
                              <Divider css={{ opacity: 0.15 }} />
                            )}
                          </Fragment>
                        ))}
                      </Stack>
                      {gi < visiblePermissionGroups.length - 1 && (
                        <Divider
                          css={{ opacity: 0.35, marginTop: "0.25rem" }}
                        />
                      )}
                    </Stack>
                  );
                })
              )}
            </Stack>
          )}

          {isSelectedDirty && (
            <Box
              mt="auto"
              position="sticky"
              bottom={0}
              zIndex={10}
              display="flex"
              justifyContent="center"
            >
              <Paper
                direction="row"
                variant="elevation"
                py={2}
                px={4}
                elevation={app.settings?.preferEmbossed ? 5 : 3}
                justifyContent="space-between"
                alignItems="center"
                borderRadius={12}
                width="100%"
                maxWidth="min(960px, calc(100% - 32px))"
              >
                <Typography level="body-sm">
                  You have unsaved changes!
                </Typography>
                <ButtonGroup disabled={saving} spacing={10}>
                  <Button
                    color="danger"
                    variant="plain"
                    onClick={resetSelected}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="solid"
                    color="success"
                    onClick={() => saveOverwrite()}
                  >
                    Save Changes
                  </Button>
                </ButtonGroup>
              </Paper>
            </Box>
          )}
        </Stack>
      </Stack>
    );
  }
);
