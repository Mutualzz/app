import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIAppeal } from "@mutualzz/types";
import { Option, Select, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { GavelIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/appeals")({
  component: StaffAppealsRoute
});

const PAGE_LIMIT = 50;
const ANY = "any";

const statusOptions: { value: string; label: string }[] = [
  { value: ANY, label: "Any status" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" }
];

const statusColors: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger"
};

function StaffAppealsRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;

  const [status, setStatus] = useState<string>("pending");
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {}
  );

  const effectiveStatus = status === ANY ? undefined : status;

  const queryKey = ["staff-appeals", effectiveStatus];

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        app.rest.get<APIAppeal[]>("/staff/appeals", {
          ...(effectiveStatus ? { status: effectiveStatus } : {}),
          ...(pageParam ? { before: pageParam } : {}),
          limit: PAGE_LIMIT
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].id
          : undefined
    });

  const appeals = data?.pages.flat() ?? [];

  const { mutate: decideAppeal, isPending: deciding } = useMutation({
    mutationKey: ["staff-decide-appeal"],
    mutationFn: ({
      appealId,
      status: newStatus,
      staffResponse
    }: {
      appealId: string;
      status: "accepted" | "rejected";
      staffResponse?: string;
    }) =>
      app.rest.patch(`/staff/appeals/${appealId}`, {
        status: newStatus,
        staffResponse: staffResponse || undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-appeals"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update appeal"
      );
    }
  });

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title="Appeals"
        icon={<GavelIcon size={22} weight="fill" />}
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
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={640}>
          <Select value={status} onValueChange={(v) => setStatus(String(v))}>
            {statusOptions.map((o) => (
              <Option key={o.value} value={o.value}>
                {o.label}
              </Option>
            ))}
          </Select>

          {isFetching && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              Loading...
            </Typography>
          )}

          {!isFetching && appeals.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              No appeals found
            </Typography>
          )}

          <Stack direction="column" spacing={0.75}>
            {appeals.map((appeal) => (
              <Paper
                key={appeal.id}
                variant="soft"
                borderRadius={10}
                p={1.5}
                boxShadow="none !important"
                direction="column"
                spacing={0.75}
                elevation={embossed ? 1 : 0}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Stack direction="column" spacing={0.1}>
                    <Typography level="body-sm">
                      <b>
                        {appeal.user.globalName || appeal.user.username}
                      </b>
                      {appeal.space ? ` · ${appeal.space.name}` : ""}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      {appeal.space ? "Space lockdown appeal · " : ""}
                      {dayjs(appeal.createdAt).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Stack>
                  <Typography
                    level="body-xs"
                    fontWeight={700}
                    color={statusColors[appeal.status] ?? "neutral"}
                    css={{ textTransform: "uppercase" }}
                  >
                    {appeal.status}
                  </Typography>
                </Stack>

                <Typography level="body-sm" css={{ opacity: 0.85 }}>
                  {appeal.message}
                </Typography>

                <Button
                  size="sm"
                  color="neutral"
                  variant="soft"
                  css={{ alignSelf: "flex-start" }}
                  onClick={() =>
                    navigate({
                      to: "/staff/users/$userId",
                      params: { userId: appeal.user.id }
                    })
                  }
                >
                  View Account
                </Button>

                {appeal.status === "pending" && (
                  <>
                    <Textarea
                      value={responseDrafts[appeal.id] ?? ""}
                      onChange={(e) =>
                        setResponseDrafts((prev) => ({
                          ...prev,
                          [appeal.id]: e.target.value
                        }))
                      }
                      placeholder="Response to the user (optional)"
                      rows={2}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="sm"
                        color="success"
                        variant="soft"
                        disabled={deciding}
                        onClick={() =>
                          decideAppeal({
                            appealId: appeal.id,
                            status: "accepted",
                            staffResponse: responseDrafts[appeal.id]
                          })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="soft"
                        disabled={deciding}
                        onClick={() =>
                          decideAppeal({
                            appealId: appeal.id,
                            status: "rejected",
                            staffResponse: responseDrafts[appeal.id]
                          })
                        }
                      >
                        Reject
                      </Button>
                    </Stack>
                  </>
                )}

                {appeal.status !== "pending" && appeal.reviewedBy && (
                  <Stack direction="column" spacing={0.25}>
                    {appeal.staffResponse && (
                      <Typography level="body-sm">
                        {appeal.staffResponse}
                      </Typography>
                    )}
                    <Typography level="body-xs" textColor="muted">
                      {appeal.status[0].toUpperCase() +
                        appeal.status.slice(1)}{" "}
                      by{" "}
                      {appeal.reviewedBy.globalName ||
                        appeal.reviewedBy.username}
                      {appeal.reviewedAt &&
                        ` · ${dayjs(appeal.reviewedAt).format(
                          "MMM D, YYYY h:mm A"
                        )}`}
                    </Typography>
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>

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
