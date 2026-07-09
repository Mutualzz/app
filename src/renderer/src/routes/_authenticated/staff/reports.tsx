import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIReport, ReportStatus } from "@mutualzz/types";
import { Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { WarningIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { IconButton } from "@renderer/components/IconButton";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/reports")({
  component: StaffReportsRoute
});

const PAGE_LIMIT = 50;
const ANY = "any";

const statusOptions: { value: string; label: string }[] = [
  { value: ANY, label: "Any status" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "dismissed", label: "Dismissed" },
  { value: "actioned", label: "Actioned" }
];

const targetTypeOptions: { value: string; label: string }[] = [
  { value: ANY, label: "Any type" },
  { value: "message", label: "Message" },
  { value: "post", label: "Post" },
  { value: "comment", label: "Comment" },
  { value: "user", label: "User" }
];

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment or Abuse",
  hate_speech: "Hate Speech",
  nsfw: "NSFW / Inappropriate Content",
  self_harm: "Self-Harm or Suicide",
  impersonation: "Impersonation",
  misinformation: "Misinformation",
  other: "Other"
};

const statusColors: Record<
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  pending: "warning",
  reviewed: "success",
  dismissed: "neutral",
  actioned: "danger"
};

function StaffReportsRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;

  const [status, setStatus] = useState<string>("pending");
  const [targetType, setTargetType] = useState<string>(ANY);

  const effectiveStatus = status === ANY ? undefined : status;
  const effectiveTargetType = targetType === ANY ? undefined : targetType;

  const queryKey = ["staff-reports", effectiveStatus, effectiveTargetType];

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        app.rest.get<APIReport[]>("/staff/reports", {
          ...(effectiveStatus ? { status: effectiveStatus } : {}),
          ...(effectiveTargetType ? { targetType: effectiveTargetType } : {}),
          ...(pageParam ? { before: pageParam } : {}),
          limit: PAGE_LIMIT
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].id
          : undefined
    });

  const reports = data?.pages.flat() ?? [];

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationKey: ["staff-update-report-status"],
    mutationFn: ({
      reportId,
      status: newStatus
    }: {
      reportId: string;
      status: ReportStatus;
    }) => app.rest.patch(`/staff/reports/${reportId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-reports"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update report"
      );
    }
  });

  const { mutate: takedownContent, isPending: takingDown } = useMutation({
    mutationKey: ["staff-report-takedown"],
    mutationFn: (reportId: string) =>
      app.rest.post<{ report: APIReport; contentRemoved: boolean }>(
        `/staff/reports/${reportId}/takedown`,
        {}
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff-reports"] });
      toast.success(
        data.contentRemoved
          ? "Content removed and report marked actioned"
          : "Content was already removed; report marked actioned"
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to take down content"
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
        <WarningIcon size={22} weight="fill" />
        <Typography level={{ xs: "h6", sm: "h5" }} fontFamily="monospace">
          Reports
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
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={640}>
          <Stack direction="row" spacing={1}>
            <Select value={status} onValueChange={(v) => setStatus(String(v))}>
              {statusOptions.map((o) => (
                <Option key={o.value} value={o.value}>
                  {o.label}
                </Option>
              ))}
            </Select>
            <Select
              value={targetType}
              onValueChange={(v) => setTargetType(String(v))}
            >
              {targetTypeOptions.map((o) => (
                <Option key={o.value} value={o.value}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Stack>

          {isFetching && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              Loading...
            </Typography>
          )}

          {!isFetching && reports.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              No reports found
            </Typography>
          )}

          <Stack direction="column" spacing={0.75}>
            {reports.map((report) => (
              <Paper
                key={report.id}
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
                      <b>{reasonLabels[report.reason] ?? report.reason}</b> ·{" "}
                      {report.targetType} {report.targetId}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      Reported by{" "}
                      {report.reporter.globalName || report.reporter.username}
                      {" · "}
                      {dayjs(report.createdAt).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Stack>
                  <Typography
                    level="body-xs"
                    fontWeight={700}
                    color={statusColors[report.status] ?? "neutral"}
                    css={{ textTransform: "uppercase" }}
                  >
                    {report.status}
                  </Typography>
                </Stack>

                {report.description && (
                  <Typography level="body-sm" css={{ opacity: 0.85 }}>
                    {report.description}
                  </Typography>
                )}

                {report.targetType === "user" && (
                  <Button
                    size="sm"
                    color="neutral"
                    variant="soft"
                    css={{ alignSelf: "flex-start" }}
                    onClick={() =>
                      navigate({
                        to: "/staff/users/$userId",
                        params: { userId: report.targetId }
                      })
                    }
                  >
                    View Account
                  </Button>
                )}

                {report.status === "pending" && (
                  <Stack direction="row" spacing={1} css={{ flexWrap: "wrap" }}>
                    {report.targetType !== "user" && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="solid"
                        disabled={takingDown || updatingStatus}
                        onClick={() => takedownContent(report.id)}
                      >
                        {takingDown ? "Removing..." : "Take Down Content"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="success"
                      variant="soft"
                      disabled={updatingStatus || takingDown}
                      onClick={() =>
                        updateStatus({
                          reportId: report.id,
                          status: "reviewed"
                        })
                      }
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="soft"
                      disabled={updatingStatus || takingDown}
                      onClick={() =>
                        updateStatus({
                          reportId: report.id,
                          status: "actioned"
                        })
                      }
                    >
                      Mark Actioned
                    </Button>
                    <Button
                      size="sm"
                      color="neutral"
                      variant="soft"
                      disabled={updatingStatus || takingDown}
                      onClick={() =>
                        updateStatus({
                          reportId: report.id,
                          status: "dismissed"
                        })
                      }
                    >
                      Dismiss
                    </Button>
                  </Stack>
                )}

                {report.status !== "pending" && report.reviewedBy && (
                  <Typography level="body-xs" textColor="muted">
                    {report.status[0].toUpperCase() + report.status.slice(1)} by{" "}
                    {report.reviewedBy.globalName || report.reviewedBy.username}
                    {report.reviewedAt &&
                      ` · ${dayjs(report.reviewedAt).format("MMM D, YYYY h:mm A")}`}
                  </Typography>
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
