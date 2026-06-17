export type AvatarEditorMethod = "upload" | "draw" | "avatars";
export type AvatarEditorVariant = "modal" | "embedded";

export interface AvatarEditorContentProps {
  variant?: AvatarEditorVariant;
  onSuccess?: () => void;
}

export const isAvatarEditorMethod = (
  value: unknown
): value is AvatarEditorMethod =>
  value === "upload" || value === "draw" || value === "avatars";
