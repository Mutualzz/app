export type StaffSection = "info" | "flags" | "actions" | "sessions" | "audit";

export const staffSectionTitles: Record<StaffSection, string> = {
  info: "Info",
  flags: "Flags",
  actions: "Actions",
  sessions: "Active Sessions",
  audit: "Audit Log"
};
