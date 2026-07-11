import { reportReasonKeys } from "@mutualzz/i18n";

export const staffReportStatusColors: Record<
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  pending: "warning",
  reviewed: "success",
  dismissed: "neutral",
  actioned: "danger"
};

/** @deprecated Prefer t(reportReasonKeys[reason], { ns: "common" }) */
export const staffReportReasonKeys = reportReasonKeys;

export function getStaffReportTakedownKey(targetType: string) {
  return targetType === "space"
    ? "report.actions.shutDownSpace"
    : "report.actions.takeDownContent";
}

export function getStaffReportLockdownKey(targetType: string) {
  return targetType === "space" ? "report.actions.lockDownSpace" : null;
}
