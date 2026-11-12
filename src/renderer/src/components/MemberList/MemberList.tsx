import { ListSectionHeader } from "@components/ListSection";
import { MemberListItem } from "@components/MemberList/MemberListItem";
import { Paper } from "@components/Paper";
import { MemberRowSkeleton, SkeletonGroup } from "@components/Skeletons";
import { useAppStore } from "@hooks/useStores";
import { Box, Skeleton, useTheme } from "@mutualzz/ui-web";
import {
  MAX_MEMBER_LIST_WINDOW_CHUNKS,
  MEMBER_LIST_CHUNK_SIZE
} from "@mutualzz/validators";
import type { MemberListGroupSummary } from "@stores/SpaceMemberWindow.store";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ListRange, Virtuoso } from "react-virtuoso";

const WINDOW_DEBOUNCE_MS = 100;
const PLACEHOLDER_ROWS = 12;

interface MemberListSegment {
  group: MemberListGroupSummary;
  open: boolean;
  visibleStart: number;
  visibleCount: number;
  absoluteStart: number;
}

type VisibleRow =
  | { kind: "header"; segment: MemberListSegment }
  | { kind: "member"; absoluteIndex: number; isFirstInSection: boolean };

function buildSegments(
  groups: MemberListGroupSummary[],
  collapsedGroupIds: Set<string>
) {
  const segments: MemberListSegment[] = [];
  let visibleStart = 0;
  let absoluteStart = 0;

  for (const group of groups) {
    const open = !collapsedGroupIds.has(group.id);
    const visibleCount = 1 + (open ? group.count : 0);
    segments.push({ group, open, visibleStart, visibleCount, absoluteStart });
    visibleStart += visibleCount;
    absoluteStart += 1 + group.count;
  }

  return { segments, visibleTotal: visibleStart, absoluteTotal: absoluteStart };
}

function resolveRow(
  segments: MemberListSegment[],
  visibleIndex: number
): VisibleRow | null {
  for (const segment of segments) {
    const offset = visibleIndex - segment.visibleStart;
    if (offset < 0 || offset >= segment.visibleCount) continue;
    if (offset === 0) return { kind: "header", segment };
    return {
      kind: "member",
      absoluteIndex: segment.absoluteStart + offset,
      isFirstInSection: offset === 1
    };
  }
  return null;
}

function chunksForRange(
  segments: MemberListSegment[],
  range: ListRange,
  absoluteTotal: number
) {
  const visibleChunks = new Set<number>();
  for (
    let visibleIndex = range.startIndex;
    visibleIndex <= range.endIndex;
    visibleIndex++
  ) {
    const row = resolveRow(segments, visibleIndex);
    if (row?.kind === "member")
      visibleChunks.add(Math.floor(row.absoluteIndex / MEMBER_LIST_CHUNK_SIZE));
  }

  if (!visibleChunks.size) return [0];

  const sortedChunks = [...visibleChunks].sort((left, right) => left - right);
  const chunks = new Set(sortedChunks);
  const firstChunk = sortedChunks[0];
  const lastChunk = sortedChunks[sortedChunks.length - 1];
  const lastAvailableChunk = Math.max(
    0,
    Math.ceil(absoluteTotal / MEMBER_LIST_CHUNK_SIZE) - 1
  );

  if (chunks.size < MAX_MEMBER_LIST_WINDOW_CHUNKS && firstChunk > 0)
    chunks.add(firstChunk - 1);
  if (
    chunks.size < MAX_MEMBER_LIST_WINDOW_CHUNKS &&
    lastChunk < lastAvailableChunk
  )
    chunks.add(lastChunk + 1);

  return [...chunks]
    .sort((left, right) => left - right)
    .slice(0, MAX_MEMBER_LIST_WINDOW_CHUNKS);
}

const MemberListPlaceholder = () => {
  const { t } = useTranslation("chat");

  return (
    <Box p="24px 8px 0 8px">
      <Skeleton
        width={120}
        fontSize={12}
        css={{ marginBottom: 8, marginLeft: 8 }}
      />
      <SkeletonGroup
        label={t("loading")}
        count={PLACEHOLDER_ROWS}
        spacing={1.25}
        render={(index) => <MemberRowSkeleton index={index} />}
      />
    </Box>
  );
};

export const MemberList = observer(() => {
  const { theme } = useTheme();
  const app = useAppStore();
  const space = app.spaces.active;
  const channel = app.channels.active;
  const store = space?.memberListWindow ?? null;

  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(
    () => new Set()
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = store?.groups;
  const rows = store?.rows;
  const { segments, visibleTotal, absoluteTotal } = useMemo(
    () => buildSegments(groups ?? [], collapsedGroupIds),
    [groups, collapsedGroupIds]
  );

  const spaceId = space?.id;
  const channelId = channel?.id;

  const toggleGroup = useCallback((groupId: string) => {
    setCollapsedGroupIds((previous) => {
      const next = new Set(previous);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      if (!spaceId || !channelId) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        app.gateway.subscribeMemberList(
          spaceId,
          channelId,
          chunksForRange(segments, range, absoluteTotal)
        );
      }, WINDOW_DEBOUNCE_MS);
    },
    [app.gateway, spaceId, channelId, segments, absoluteTotal]
  );

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    []
  );

  return (
    <Paper
      surfaceRole="chrome"
      elevation={0}
      direction="column"
      flex="0 0 240px"
      overflowX="hidden"
      borderTop="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
    >
      <Virtuoso
        key={`${spaceId}:${channelId}`}
        style={{ flex: 1 }}
        totalCount={visibleTotal}
        increaseViewportBy={{ top: 200, bottom: 400 }}
        rangeChanged={handleRangeChanged}
        components={{ EmptyPlaceholder: MemberListPlaceholder }}
        context={{ rows }}
        computeItemKey={(visibleIndex) => {
          const row = resolveRow(segments, visibleIndex);
          if (!row) return `empty-${visibleIndex}`;
          if (row.kind === "header") return `header-${row.segment.group.id}`;
          const listRow = rows?.[row.absoluteIndex];
          return listRow?.type === "member"
            ? `member-${listRow.member.userId}`
            : `row-${row.absoluteIndex}`;
        }}
        itemContent={(visibleIndex, _, context) => {
          const row = resolveRow(segments, visibleIndex);
          if (!row) return null;

          if (row.kind === "header") {
            const { group, open } = row.segment;
            return (
              <Box p="24px 8px 0 8px">
                <ListSectionHeader
                  name={`${store?.groupName(group) ?? group.name} - ${group.count}`}
                  open={open}
                  onToggle={() => toggleGroup(group.id)}
                />
              </Box>
            );
          }

          const listRow = context.rows?.[row.absoluteIndex];

          return (
            <Box
              p="0 8px"
              css={{
                paddingTop: row.isFirstInSection ? 0 : theme.spacing(1.25)
              }}
            >
              {listRow?.type === "member" ? (
                <MemberListItem
                  member={listRow.member}
                  isOwner={listRow.member.userId === space?.ownerId}
                />
              ) : (
                <MemberRowSkeleton index={row.absoluteIndex} />
              )}
            </Box>
          );
        }}
      />
    </Paper>
  );
});
