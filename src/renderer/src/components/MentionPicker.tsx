import { useAppStore } from "@hooks/useStores";
import { Paper, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar";
import { dynamicElevation } from "@mutualzz/ui-core";
import { ReactEditor, useSlate } from "slate-react";
import { MentionType } from "@mutualzz/types";

interface Candidate {
  id: string;
  displayName?: string;
  type: MentionType;
  user?: any;
}

interface Props {
  search: string;
  onSelect: (type: MentionType, id: string) => void;
  onClose: () => void;
}

export const MentionPicker = observer(
  ({ search, onSelect, onClose }: Props) => {
    const app = useAppStore();
    const editor = useSlate();
    const { theme } = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(0);
    const [toolbarStyle, setToolbarStyle] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    const channel = app.channels.active;
    const space = channel?.spaceId ? app.spaces.get(channel.spaceId) : null;

    const canMentionEveryone =
      space?.members.me?.hasPermission("MentionEveryone", channel) ?? false;

    const userCandidates: Candidate[] = space
      ? [...space.members.all.values()].map((m) => ({
          id: m.userId,
          displayName: m.user?.displayName,
          username: m.user?.username,
          type: "user",
          user: m.user
        }))
      : (channel?.dmRecipients ?? []).map((u) => ({
          id: u.id,
          displayName: u.displayName,
          username: u.username,
          type: "user",
          user: u
        }));

    const roleCandidates: Candidate[] =
      space && space.roles
        ? space.roles.all
            .filter((r) => r.mentionable || canMentionEveryone)
            .map((r) => ({
              id: r.id,
              displayName: `@${r.name}`,
              type: "role" as MentionType
            }))
            .filter((r) => r.id !== space.id)
        : [];

    const specialCandidates: Candidate[] = [];
    if (canMentionEveryone && space) {
      if (search.toLowerCase().includes("everyone")) {
        specialCandidates.push({
          id: "everyone",
          displayName: "@everyone",
          type: "everyone"
        });
      }
      if (search.toLowerCase().includes("here")) {
        specialCandidates.push({
          id: "here",
          displayName: "@here",
          type: "here"
        });
      }
    }

    const filteredSpecial = specialCandidates;

    const filteredRegular = [...userCandidates, ...roleCandidates].filter((c) =>
      c.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    const filtered = [...filteredSpecial, ...filteredRegular].slice(0, 8);

    useEffect(() => {
      try {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const caretRect = sel.getRangeAt(0).getBoundingClientRect();
        if (!caretRect.width && !caretRect.height) return;

        const editorEl = ReactEditor.toDOMNode(editor, editor);
        const editorRect = editorEl.getBoundingClientRect();

        const popupHeight = ref.current?.offsetHeight ?? 0;
        const spaceAbove = caretRect.top;
        const spaceBelow = window.innerHeight - caretRect.bottom;
        const gap = 20;

        const showAbove =
          spaceAbove >= popupHeight + gap || spaceAbove > spaceBelow;

        setToolbarStyle({
          top: showAbove
            ? caretRect.top - popupHeight - gap
            : caretRect.bottom + gap,
          left: editorRect.left,
          width: editorRect.width
        });
      } catch {}
    }, [editor, filtered]);

    useEffect(() => {
      setSelected(0);
    }, [search]);

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopImmediatePropagation();
          setSelected((s) => Math.min(s + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopImmediatePropagation();
          setSelected((s) => Math.max(s - 1, 0));
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          e.stopImmediatePropagation();
          const pick = filtered[selected];
          if (pick) onSelect(pick.type, pick.id);
        } else if (e.key === "Escape") {
          e.stopImmediatePropagation();
          onClose();
        }
      };
      window.addEventListener("keydown", handler, true);
      return () => window.removeEventListener("keydown", handler, true);
    }, [filtered, selected, onSelect, onClose]);

    if (filtered.length === 0) return null;

    return (
      <Paper
        ref={ref}
        display="block"
        css={{
          position: "fixed",
          top: toolbarStyle?.top ?? -9999,
          left: toolbarStyle?.left ?? 0,
          width: toolbarStyle?.width ?? 0
        }}
        borderRadius={8}
        zIndex={theme.zIndex.tooltip}
        py={2}
        px={2}
        elevation={app.settings?.preferEmbossed ? 3 : 1}
        variant="elevation"
      >
        <Typography
          textColor="secondary"
          fontFamily="monospace"
          level="body-xs"
          mb={2.5}
        >
          {search.length === 0 ? "Members" : `Members matching "${search}"`}
        </Typography>
        {filtered.map((c, i) => (
          <Paper
            key={`${c.type}:${c.id}`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(c.type, c.id);
            }}
            spacing={1.25}
            py={2}
            px={1.25}
            alignItems="center"
            borderRadius={8}
            elevation={selected === i ? 3 : 1}
            justifyContent="space-between"
            css={{
              cursor: "pointer",
              "&:hover": {
                background: dynamicElevation(theme.colors.surface, 5)
              }
            }}
            boxShadow="none !important"
          >
            <Stack spacing={1.25} alignItems="center">
              {c.type === "user" && <UserAvatar user={c.user} />}
              <Typography level="body-sm" fontWeight={600}>
                {c.displayName}
              </Typography>
            </Stack>
            <Typography level="body-xs" textColor="secondary">
              {c.type === "role"
                ? "Notify users with this role who have permission to view this channel"
                : c.type === "everyone"
                  ? "Notify everyone who has permission to view this channel"
                  : c.type === "here"
                    ? "Notify everyone online who has permission to view this channel"
                    : `${"username" in c ? c.username : "unknown"}`}
            </Typography>
          </Paper>
        ))}
      </Paper>
    );
  }
);
