export type StaffSection =
  | "info"
  | "flags"
  | "actions"
  | "sessions"
  | "notes"
  | "audit";

export const staffSectionTitles: Record<StaffSection, string> = {
  info: "Info",
  flags: "Flags",
  actions: "Actions",
  sessions: "Active Sessions",
  notes: "Staff Notes",
  audit: "Audit Log"
};
