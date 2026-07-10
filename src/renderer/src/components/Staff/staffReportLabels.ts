export const staffReportReasonLabels: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment or Abuse",
  hate_speech: "Hate Speech",
  nsfw: "NSFW / Inappropriate Content",
  self_harm: "Self-Harm or Suicide",
  impersonation: "Impersonation",
  misinformation: "Misinformation",
  other: "Other"
};

export const staffReportStatusColors: Record<
  string,
  "warning" | "success" | "neutral" | "danger"
> = {
  pending: "warning",
  reviewed: "success",
  dismissed: "neutral",
  actioned: "danger"
};

export function getStaffReportTakedownLabel(targetType: string) {
  return targetType === "space" ? "Shut Down Space" : "Take Down Content";
}

export function getStaffReportLockdownLabel(targetType: string) {
  return targetType === "space" ? "Lock Down Space" : "";
}
