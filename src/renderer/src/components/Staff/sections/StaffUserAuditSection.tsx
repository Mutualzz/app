import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffAction } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

interface Props {
  userId: string;
}

const PAGE_LIMIT = 50;

const actionLabelKeys: Record<string, string> = {
  "user.disable": "auditActions.disabledAccount",
  "user.enable": "auditActions.enabledAccount",
  "user.delete": "auditActions.softDeletedAccount",
  "user.hard_delete": "auditActions.hardDeletedAccount",
  "user.force_logout": "auditActions.forcedLogout",
  "user.session_revoke": "auditActions.revokedSession",
  "user.profile_update": "auditActions.updatedProfile",
  "user.warn": "auditActions.warnedUser",
  "user.restrict": "auditActions.restrictedUser",
  "user.restrict_lift": "auditActions.liftedRestriction",
  "space.delete": "auditActions.shutDownSpace",
  "space.lockdown": "auditActions.lockedDownSpace"
};

const describeAction = (action: string, t: TFunction<"staff">) => {
  if (actionLabelKeys[action]) return t(actionLabelKeys[action]);

  const flagMatch = action.match(/^user\.flag\.(.+)\.(grant|revoke)$/);
  if (flagMatch) {
    const [, flag, verb] = flagMatch;
    return verb === "grant"
      ? t("auditActions.grantedFlag", { flag })
      : t("auditActions.revokedFlag", { flag });
  }

  const takedownMatch = action.match(/^content\.takedown\.(.+)$/);
  if (takedownMatch)
    return t("auditActions.tookDownContent", { type: takedownMatch[1] });

  return action;
};

export const StaffUserAuditSection = ({ userId }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("staff");

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["staff-actions", userId],
    queryFn: ({ pageParam }) =>
      app.rest.get<APIStaffAction[]>(`/staff/users/${userId}/actions`, {
        ...(pageParam ? { before: pageParam } : {}),
        limit: PAGE_LIMIT
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_LIMIT
        ? lastPage[lastPage.length - 1].id
        : undefined
  });

  const actions = data?.pages.flat() ?? [];

  if (!isFetching && actions.length === 0) {
    return (
      <Typography level="body-sm" textColor="muted">
        {t("user.audit.empty")}
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={0.75} maxWidth={560}>
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
          elevation={app.settings?.preferEmbossed ? 1 : 0}
        >
          <ClockCounterClockwiseIcon
            size={16}
            css={{ marginTop: "0.2rem", flexShrink: 0, opacity: 0.6 }}
          />
          <Stack direction="column" spacing={0.1}>
            <Typography level="body-sm">
              <b>{entry.actor.globalName || entry.actor.username}</b>{" "}
              {describeAction(entry.action, t)}
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
  );
};
