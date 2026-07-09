import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffAction } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

interface Props {
  userId: string;
}

const PAGE_LIMIT = 50;

const actionLabels: Record<string, string> = {
  "user.disable": "disabled this account",
  "user.enable": "enabled this account",
  "user.force_logout": "forced a logout on this account",
  "user.session_revoke": "revoked a session on this account",
  "user.profile_update": "updated this account's profile",
  "user.verify_reminder_sent": "sent a verification reminder to this account",
  "user.warn": "sent this account a warning",
  "user.restrict": "temporarily restricted this account",
  "user.restrict_lift": "lifted a restriction on this account"
};

const describeAction = (action: string) => {
  if (actionLabels[action]) return actionLabels[action];

  const flagMatch = action.match(/^user\.flag\.(.+)\.(grant|revoke)$/);
  if (flagMatch) {
    const [, flag, verb] = flagMatch;
    return verb === "grant"
      ? `granted the ${flag} flag`
      : `revoked the ${flag} flag`;
  }

  const takedownMatch = action.match(/^content\.takedown\.(.+)$/);
  if (takedownMatch) return `took down a reported ${takedownMatch[1]}`;

  return action;
};

export const StaffUserAuditSection = ({ userId }: Props) => {
  const app = useAppStore();

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
        No staff actions yet
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
              {describeAction(entry.action)}
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
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </Stack>
  );
};
