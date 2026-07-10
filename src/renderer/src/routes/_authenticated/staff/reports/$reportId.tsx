import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { StaffReportContent } from "@components/Staff/StaffReportContent";
import {
  getStaffReportLockdownLabel,
  getStaffReportTakedownLabel,
  staffReportReasonLabels,
  staffReportStatusColors
} from "@components/Staff/staffReportLabels";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIReportDetail, ReportStatus } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ArrowLeftIcon, WarningIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/reports/$reportId")({
  component: StaffReportDetailRoute
});

function StaffReportDetailRoute() {
  const { reportId } = Route.useParams();
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;

  const queryKey = ["staff-report", reportId];

  const { data: report, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => app.rest.get<APIReportDetail>(`/staff/reports/${reportId}`)
  });

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationKey: ["staff-update-report-status", reportId],
    mutationFn: (status: ReportStatus) =>
      app.rest.patch(`/staff/reports/${reportId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["staff-reports"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update report"
      );
    }
  });

  const { mutate: takedownContent, isPending: takingDown } = useMutation({
    mutationKey: ["staff-report-takedown", reportId],
    mutationFn: () =>
      app.rest.post<{ report: APIReportDetail; contentRemoved: boolean }>(
        `/staff/reports/${reportId}/takedown`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["staff-reports"] });
      toast.success("Action completed");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to complete action"
      );
    }
  });

  const { mutate: lockdownSpace, isPending: lockingDown } = useMutation({
    mutationKey: ["staff-report-lockdown", reportId],
    mutationFn: () =>
      app.rest.post<{ report: APIReportDetail; contentRemoved: boolean }>(
        `/staff/reports/${reportId}/lockdown`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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
        title="Report Details"
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
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={720}>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={<ArrowLeftIcon size={16} />}
            css={{ alignSelf: "flex-start" }}
            onClick={() => navigate({ to: "/staff/reports" })}
          >
            Back to reports
          </Button>

          {isLoading && (
            <Typography level="body-sm" textColor="muted">
              Loading report...
            </Typography>
          )}

          {error && (
            <Typography level="body-sm" color="danger">
              {error instanceof Error ? error.message : "Failed to load report"}
            </Typography>
          )}

          {report && (
            <Paper
              variant="soft"
              borderRadius={12}
              p={2}
              boxShadow="none !important"
              direction="column"
              spacing={1.25}
              elevation={embossed ? 1 : 0}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Stack direction="column" spacing={0.25}>
                  <Typography level="title-sm" fontWeight={700}>
                    {staffReportReasonLabels[report.reason] ?? report.reason}
                  </Typography>
                  <Typography level="body-xs" textColor="muted">
                    {report.targetType} · {report.targetId}
                  </Typography>
                  <Typography level="body-xs" textColor="muted">
                    Reported by{" "}
                    {report.reporter.globalName || report.reporter.username} ·{" "}
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
                <Paper
                  variant="outlined"
                  borderRadius={8}
                  p={1.25}
                  boxShadow="none !important"
                  direction="column"
                  spacing={0.25}
                >
                  <Typography level="body-xs" fontWeight={600}>
                    Reporter notes
                  </Typography>
                  <Typography level="body-sm">{report.description}</Typography>
                </Paper>
              )}

              <Stack direction="column" spacing={0.75}>
                <Typography level="body-sm" fontWeight={600}>
                  Reported content
                </Typography>
                <StaffReportContent
                  content={report.content}
                  reportedMessageId={
                    report.targetType === "message" ? report.targetId : undefined
                  }
                />
              </Stack>

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
                  Open staff user panel
                </Button>
              )}

              {report.status === "pending" && (
                <Stack direction="row" spacing={1} css={{ flexWrap: "wrap" }}>
                  {report.targetType === "space" && (
                    <Button
                      size="sm"
                      color="warning"
                      variant="solid"
                      disabled={acting || updatingStatus}
                      onClick={() => lockdownSpace()}
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
                      onClick={() => takedownContent()}
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
                    onClick={() => updateStatus("reviewed")}
                  >
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="soft"
                    disabled={updatingStatus || acting}
                    onClick={() => updateStatus("actioned")}
                  >
                    Mark Actioned
                  </Button>
                  <Button
                    size="sm"
                    color="neutral"
                    variant="soft"
                    disabled={updatingStatus || acting}
                    onClick={() => updateStatus("dismissed")}
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
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
