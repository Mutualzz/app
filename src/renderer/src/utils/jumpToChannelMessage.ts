import { formatColor } from "@mutualzz/ui-core";
import type { Theme } from "@emotion/react";
import type { Channel } from "@stores/objects/Channel";

const SCROLL_RETRY_MS = 50;
const SCROLL_RETRY_ATTEMPTS = 40;

function highlightMessage(el: HTMLElement, theme: Theme) {
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.animate(
    [
      {
        backgroundColor: formatColor(theme.colors.info, {
          alpha: 50,
          format: "hexa",
        }),
      },
      { backgroundColor: "transparent" },
    ],
    { duration: 2000, easing: "ease-out" },
  );
}

function tryScrollToMessage(messageId: string, theme: Theme) {
  const el = document.getElementById(`message-${messageId}`);
  if (!el) return false;

  highlightMessage(el, theme);
  return true;
}

async function waitForScroll(messageId: string, theme: Theme) {
  for (let attempt = 0; attempt < SCROLL_RETRY_ATTEMPTS; attempt++) {
    if (tryScrollToMessage(messageId, theme)) return true;
    await new Promise((resolve) => setTimeout(resolve, SCROLL_RETRY_MS));
  }

  return false;
}

export async function jumpToChannelMessage(
  channel: Channel | null | undefined,
  messageId: string,
  theme: Theme,
) {
  if (!channel) return false;

  if (tryScrollToMessage(messageId, theme)) return true;

  if (!channel.messages.has(messageId)) {
    await channel.getMessages(false, 50, undefined, undefined, messageId);
  }

  return waitForScroll(messageId, theme);
}
