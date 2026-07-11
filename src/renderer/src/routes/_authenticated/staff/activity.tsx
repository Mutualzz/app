import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffAction } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/staff/activity")({
  component: StaffActivityRoute
});

const PAGE_LIMIT = 50;

const globalActionKeys: Record<string, string> = {
  "user.disable": "auditActions.global.disabled",
  "user.enable": "auditActions.global.enabled",
  "user.delete": "auditActions.global.softDeleted",
  "user.hard_delete": "auditActions.global.hardDeleted",
  "user.force_logout": "auditActions.global.forcedLogout",
  "user.session_revoke": "auditActions.global.revokedSession",
  "user.profile_update": "auditActions.global.updatedProfile",
  "user.warn": "auditActions.global.warned",
  "user.restrict": "auditActions.global.restricted",
  "user.restrict_lift": "auditActions.global.liftedRestriction",
  "space.delete": "auditActions.global.shutDownSpace",
  "space.lockdown": "auditActions.global.lockedDownSpace"
};

const formatStaffActionTarget = (
  entry: APIStaffAction,
  t: TFunction<"staff">
) => {
  if (entry.target) {
    return entry.target.globalName || entry.target.username;
  }

  if (entry.action === "user.hard_delete" && entry.reason) {
    const match = entry.reason.match(/^@([^\s(]+)/);
    if (match) return t("activity.removedUserNamed", { name: match[1] });
  }

  return t("activity.removedUser");
};

const describeGlobalAction = (
  entry: APIStaffAction,
  t: TFunction<"staff">
) => {
  const actor = entry.actor.globalName || entry.actor.username;
  const target = formatStaffActionTarget(entry, t);

  if (globalActionKeys[entry.action]) {
    return t(globalActionKeys[entry.action], { actor, target });
  }

  const flagMatch = entry.action.match(/^user\.flag\.(.+)\.(grant|revoke)$/);
  if (flagMatch) {
    const [, flag, verb] = flagMatch;
    return verb === "grant"
      ? t("auditActions.global.grantedFlag", { actor, flag, target })
      : t("auditActions.global.revokedFlag", { actor, flag, target });
  }

  const takedownMatch = entry.action.match(/^content\.takedown\.(.+)$/);
  if (takedownMatch) {
    return t("auditActions.global.tookDownContent", {
      actor,
      type: takedownMatch[1]
    });
  }

  if (entry.action === "space.delete") {
    return t("auditActions.global.shutDownSpace", { actor });
  }

  if (entry.action === "space.lockdown") {
    return t("auditActions.global.lockedDownSpace", { actor });
  }

  return `${actor} ${entry.action} ${target}`;
};

function StaffActivityRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation("staff");
  const embossed = app.settings?.preferEmbossed;

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["staff-all-actions"],
      queryFn: ({ pageParam }) =>
        app.rest.get<APIStaffAction[]>(
          "/staff/actions",
          pageParam
            ? { before: pageParam, limit: PAGE_LIMIT }
            : { limit: PAGE_LIMIT }
        ),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].id
          : undefined
    });

  const actions = data?.pages.flat() ?? [];

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title={t("pages.activity")}
        icon={<ClockCounterClockwiseIcon size={22} weight="fill" />}
      />

      <Paper
        flex={1}
        height="100%"
        overflow="auto"
        width="100%"
        spacing={1.25}
        alignItems="center"
        borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        borderBottomRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        elevation={embossed ? 2 : 0}
        direction="column"
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 3 }}
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
      >
        <Stack direction="column" spacing={0.75} width="100%" maxWidth={640}>
          {isFetching && !isFetchingNextPage && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("home.loading")}
            </Typography>
          )}

          {!isFetching && actions.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("activity.empty")}
            </Typography>
          )}

          {actions.map((entry) => (
            <Paper
              key={entry.id}
              variant="soft"
              borderRadius={10}
              p={1.5}
              boxShadow="none !important"
              direction="row"
              spacing={1.25}
              alignItems="flex-start"
              elevation={embossed ? 1 : 0}
              css={{ cursor: "pointer" }}
              onClick={() =>
                navigate({
                  to: "/staff/users/$userId",
                  params: { userId: entry.target?.id }
                })
              }
            >
              <ClockCounterClockwiseIcon
                size={16}
                css={{ marginTop: "0.2rem", flexShrink: 0, opacity: 0.6 }}
              />
              <Stack direction="column" spacing={0.1}>
                <Typography level="body-sm">
                  {describeGlobalAction(entry, t)}
                </Typography>
                {entry.reason && (
                  <Typography level="body-xs" textColor="muted">
                    {entry.reason}
                  </Typography>
                )}
                <Typography level="body-xs" textColor="muted">
                  {dayjs(entry.createdAt).format("MMM D, YYYY h:mm A")}
                </Typography>
              </Stack>
            </Paper>
          ))}

          {hasNextPage && (
            <Button
              color="neutral"
              variant="soft"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              css={{ alignSelf: "center", marginTop: "0.5rem" }}
            >
              {isFetchingNextPage ? t("home.loading") : t("home.loadMore")}
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
