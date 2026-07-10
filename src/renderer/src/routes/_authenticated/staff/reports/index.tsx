import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  getStaffReportLockdownLabel,
  getStaffReportTakedownLabel,
  staffReportReasonLabels,
  staffReportStatusColors
} from "@components/Staff/staffReportLabels";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIReport, ReportStatus } from "@mutualzz/types";
import { Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { WarningIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/reports/")({
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
  { value: "user", label: "User" },
  { value: "space", label: "Space" }
];

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
          ? "Action completed and report marked actioned"
          : "Target was already removed; report marked actioned"
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to complete action"
      );
    }
  });

  const { mutate: lockdownSpace, isPending: lockingDown } = useMutation({
    mutationKey: ["staff-report-lockdown"],
    mutationFn: (reportId: string) =>
      app.rest.post<{ report: APIReport; contentRemoved: boolean }>(
        `/staff/reports/${reportId}/lockdown`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-reports"] });
      toast.success("Space locked down and owner notified to appeal");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to lock down space"
      );
    }
  });

  const acting = takingDown || lockingDown;

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title="Reports"
        icon={<WarningIcon size={22} weight="fill" />}
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
                      <b>
                        {staffReportReasonLabels[report.reason] ?? report.reason}
                      </b>{" "}
                      · {report.targetType} {report.targetId}
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
                    color={staffReportStatusColors[report.status] ?? "neutral"}
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

                <Button
                  size="sm"
                  color="neutral"
                  variant="soft"
                  css={{ alignSelf: "flex-start" }}
                  onClick={() =>
                    navigate({
                      to: "/staff/reports/$reportId",
                      params: { reportId: report.id }
                    })
                  }
                >
                  View Details
                </Button>

                {report.status === "pending" && (
                  <Stack direction="row" spacing={1} css={{ flexWrap: "wrap" }}>
                    {report.targetType === "space" && (
                      <Button
                        size="sm"
                        color="warning"
                        variant="solid"
                        disabled={acting || updatingStatus}
                        onClick={() => lockdownSpace(report.id)}
                      >
                        {lockingDown
                          ? "Working..."
                          : getStaffReportLockdownLabel(report.targetType)}
                      </Button>
                    )}
                    {report.targetType !== "user" && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="solid"
                        disabled={acting || updatingStatus}
                        onClick={() => takedownContent(report.id)}
                      >
                        {takingDown
                          ? "Working..."
                          : getStaffReportTakedownLabel(report.targetType)}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="success"
                      variant="soft"
                      disabled={updatingStatus || acting}
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
                      disabled={updatingStatus || acting}
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
                      disabled={updatingStatus || acting}
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
