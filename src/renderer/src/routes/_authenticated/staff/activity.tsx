import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffAction } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon
} from "@phosphor-icons/react";
import { IconButton } from "@renderer/components/IconButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/_authenticated/staff/activity")({
  component: StaffActivityRoute
});

const PAGE_LIMIT = 50;

const actionVerbs: Record<string, string> = {
  "user.disable": "disabled",
  "user.enable": "enabled",
  "user.delete": "soft deleted",
  "user.hard_delete": "hard deleted",
  "user.force_logout": "forced a logout on",
  "user.session_revoke": "revoked a session on",
  "user.profile_update": "updated the profile of",
  "user.verify_reminder_sent": "sent a verification reminder to",
  "user.warn": "sent a warning to",
  "user.restrict": "temporarily restricted",
  "user.restrict_lift": "lifted a restriction on"
};

const formatStaffActionTarget = (entry: APIStaffAction) => {
  if (entry.target) {
    return entry.target.globalName || entry.target.username;
  }

  if (entry.action === "user.hard_delete" && entry.reason) {
    const match = entry.reason.match(/^@([^\s(]+)/);
    if (match) return `@${match[1]} (removed)`;
  }

  return "a removed user";
};

const describeGlobalAction = (entry: APIStaffAction) => {
  const actorName = entry.actor.globalName || entry.actor.username;
  const targetName = formatStaffActionTarget(entry);

  if (actionVerbs[entry.action]) {
    return `${actorName} ${actionVerbs[entry.action]} ${targetName}`;
  }

  const flagMatch = entry.action.match(/^user\.flag\.(.+)\.(grant|revoke)$/);
  if (flagMatch) {
    const [, flag, verb] = flagMatch;
    return verb === "grant"
      ? `${actorName} granted the ${flag} flag to ${targetName}`
      : `${actorName} revoked the ${flag} flag from ${targetName}`;
  }

  const takedownMatch = entry.action.match(/^content\.takedown\.(.+)$/);
  if (takedownMatch) {
    return `${actorName} took down a reported ${takedownMatch[1]} from ${targetName}`;
  }

  return `${actorName} performed ${entry.action} on ${targetName}`;
};

function StaffActivityRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
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
      <Paper
        borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 4 }}
        borderLeftWidth="0px !important"
        elevation={embossed ? 3 : 0}
        alignItems="center"
        spacing={1.25}
        borderTop="0 !important"
        borderLeft="0 !important"
      >
        <IconButton
          variant="plain"
          size="sm"
          onClick={() => navigate({ to: "/staff" })}
        >
          <ArrowLeftIcon />
        </IconButton>
        <ClockCounterClockwiseIcon size={22} weight="fill" />
        <Typography level={{ xs: "h6", sm: "h5" }} fontFamily="monospace">
          Staff Activity
        </Typography>
      </Paper>

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
              Loading...
            </Typography>
          )}

          {!isFetching && actions.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              No staff actions yet
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
                  params: { userId: entry.target.id }
                })
              }
            >
              <ClockCounterClockwiseIcon
                size={16}
                css={{ marginTop: "0.2rem", flexShrink: 0, opacity: 0.6 }}
              />
              <Stack direction="column" spacing={0.1}>
                <Typography level="body-sm">
                  {describeGlobalAction(entry)}
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
      </Paper>
    </Stack>
  );
}
