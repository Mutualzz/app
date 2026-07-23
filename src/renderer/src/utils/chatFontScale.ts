export const CHAT_FONT_SCALE_CSS_VAR = "--chat-font-scale";

export function applyChatFontScale(scale: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    CHAT_FONT_SCALE_CSS_VAR,
    String(scale)
  );
}
