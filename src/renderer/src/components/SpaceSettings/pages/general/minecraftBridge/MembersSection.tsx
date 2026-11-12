import { InputWithLabel } from "@components/InputWithLabel";
import { ListSkeleton } from "@components/Skeletons";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Button } from "@renderer/components/Button";
import { PlayerModerationModal } from "@renderer/components/Modals/PlayerModerationModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { BridgeSection } from "./BridgeSettingsParts";
import type { BridgeMemberRow } from "./types";

const MEMBERS_PAGE_SIZE = 30;
const MEMBERS_LIST_MAX_HEIGHT = 360;

const BridgeMemberItem = observer(
  ({
    member,
    spaceId,
    bridgeId
  }: {
    member: BridgeMemberRow;
    spaceId: string;
    bridgeId: string;
  }) => {
    const { t } = useTranslation("settings");
    const { openModal } = useModal();
    const displayName =
      member.globalName?.trim() ||
      member.username ||
      member.minecraftName ||
      member.userId;

    const { minecraftUuid, minecraftName } = member;

    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        py={0.75}
      >
        <Stack direction="column" spacing={0} minWidth={0}>
          <Typography level="body-sm">{displayName}</Typography>
          <Typography level="body-xs" textColor="muted">
            {member.online
              ? t("minecraftBridge.membersOnline")
              : t("minecraftBridge.membersOffline")}
            {member.minecraftName ? ` · ${member.minecraftName}` : ""}
          </Typography>
        </Stack>
        {minecraftUuid && minecraftName && (
          <Button
            size="sm"
            variant="soft"
            color="danger"
            onClick={() =>
              openModal(
                "player-moderation",
                <PlayerModerationModal
                  spaceId={spaceId}
                  bridgeId={bridgeId}
                  action="ban"
                  minecraftUuid={minecraftUuid}
                  minecraftName={minecraftName}
                />
              )
            }
          >
            {t("minecraftBridge.ban")}
          </Button>
        )}
      </Stack>
    );
  }
);

export const MembersSection = observer(
  ({
    spaceId,
    bridgeId,
    enabled
  }: {
    spaceId: string;
    bridgeId: string;
    enabled: boolean;
  }) => {
    const { t } = useTranslation("settings");
    const { t: tChat } = useTranslation("chat");
    const app = useAppStore();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [listHeight, setListHeight] = useState(MEMBERS_LIST_MAX_HEIGHT);

    useEffect(() => {
      const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
      return () => clearTimeout(timer);
    }, [searchInput]);

    const membersQuery = useInfiniteQuery({
      queryKey: ["space", spaceId, "bridge", "members", search],
      enabled,
      queryFn: ({ pageParam }) =>
        app.rest.get<{ members: BridgeMemberRow[]; hasMore: boolean }>(
          `/spaces/${spaceId}/bridge/members`,
          {
            offset: pageParam,
            limit: MEMBERS_PAGE_SIZE,
            ...(search ? { q: search } : {})
          }
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length * MEMBERS_PAGE_SIZE : undefined,
      refetchInterval: 60_000
    });

    const members =
      membersQuery.data?.pages.flatMap((page) => page.members) ?? [];

    return (
      <BridgeSection
        title={t("minecraftBridge.membersTitle")}
        description={t("minecraftBridge.membersHint")}
      >
        <InputWithLabel
          name="bridge-member-search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("minecraftBridge.membersSearch")}
        />
        {membersQuery.isLoading ? (
          <ListSkeleton label={tChat("loading")} count={4} leading="avatar" />
        ) : members.length === 0 ? (
          <Typography level="body-xs" textColor="muted">
            {search
              ? t("minecraftBridge.membersNoResults")
              : t("minecraftBridge.membersEmpty")}
          </Typography>
        ) : (
          <Virtuoso
            style={{ height: Math.min(listHeight, MEMBERS_LIST_MAX_HEIGHT) }}
            data={members}
            computeItemKey={(_, member) => member.userId}
            totalListHeightChanged={setListHeight}
            increaseViewportBy={200}
            endReached={() => {
              if (
                membersQuery.hasNextPage &&
                !membersQuery.isFetchingNextPage
              ) {
                void membersQuery.fetchNextPage();
              }
            }}
            itemContent={(_, member) => (
              <BridgeMemberItem
                member={member}
                spaceId={spaceId}
                bridgeId={bridgeId}
              />
            )}
          />
        )}
      </BridgeSection>
    );
  }
);
