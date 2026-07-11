import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  getStaffReportLockdownKey,
  getStaffReportTakedownKey,
  staffReportReasonKeys,
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
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/reports/")({
  component: StaffReportsRoute
});

const PAGE_LIMIT = 50;
const ANY = "any";

const statusValues = ["pending", "reviewed", "dismissed", "actioned"] as const;
const targetTypeValues = [
  "message",
  "post",
  "comment",
  "user",
  "space"
] as const;

function StaffReportsRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("staff");
  const { t: tCommon } = useTranslation("common");
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
        err instanceof Error ? err.message : t("report.errors.update")
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
          ? t("report.toasts.actionCompletedMarked")
          : t("report.toasts.alreadyRemoved")
      );
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("report.errors.action")
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
      toast.success(t("report.toasts.lockdownSuccess"));
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("report.errors.lockdown")
      );
    }
  });

  const acting = takingDown || lockingDown;

  const statusLabel = (value: string) =>
    value === ANY
      ? t("report.anyStatus")
      : t(`report.status.${value}` as "report.status.pending");

  const targetTypeLabel = (value: string) =>
    value === ANY
      ? t("report.anyType")
      : t(`report.targetTypes.${value}` as "report.targetTypes.message");

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title={t("nav.reports")}
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
              <Option value={ANY}>{statusLabel(ANY)}</Option>
              {statusValues.map((value) => (
                <Option key={value} value={value}>
                  {statusLabel(value)}
                </Option>
              ))}
            </Select>
            <Select
              value={targetType}
              onValueChange={(v) => setTargetType(String(v))}
            >
              <Option value={ANY}>{targetTypeLabel(ANY)}</Option>
              {targetTypeValues.map((value) => (
                <Option key={value} value={value}>
                  {targetTypeLabel(value)}
                </Option>
              ))}
            </Select>
          </Stack>

          {isFetching && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("home.loading")}
            </Typography>
          )}

          {!isFetching && reports.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("report.empty")}
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
                        {tCommon(
                          staffReportReasonKeys[
                            report.reason as keyof typeof staffReportReasonKeys
                          ] ?? report.reason
                        )}
                      </b>{" "}
                      · {report.targetType} {report.targetId}
                    </Typography>
                    <Typography level="body-xs" textColor="muted">
                      {t("report.reportedBy", {
                        name:
                          report.reporter.globalName ||
                          report.reporter.username
                      })}
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
                    {t(`report.status.${report.status}` as "report.status.pending")}
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
                  {t("report.viewDetails")}
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
                          ? t("working")
                          : t(getStaffReportLockdownKey(report.targetType)!)}
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
                          ? t("working")
                          : t(getStaffReportTakedownKey(report.targetType))}
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
                      {t("report.markReviewed")}
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
                      {t("report.markActioned")}
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
                      {t("report.dismiss")}
                    </Button>
                  </Stack>
                )}

                {report.status !== "pending" && report.reviewedBy && (
                  <Typography level="body-xs" textColor="muted">
                    {t("report.reviewedBy", {
                      status: t(
                        `report.status.${report.status}` as "report.status.pending"
                      ),
                      name:
                        report.reviewedBy.globalName ||
                        report.reviewedBy.username
                    })}
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
              {isFetchingNextPage ? t("home.loading") : t("home.loadMore")}
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
