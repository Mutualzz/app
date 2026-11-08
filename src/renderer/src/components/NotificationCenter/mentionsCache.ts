import type { APIMessage } from "@mutualzz/types";
import type { InfiniteData } from "@tanstack/react-query";

export interface MentionsPage {
  messages: APIMessage[];
  hasMore: boolean;
  nextBefore: string | null;
}

export type MentionsData = InfiniteData<MentionsPage, string | undefined>;

export const removeMentionFromCache = (
  data: MentionsData | undefined,
  messageId: string
): MentionsData | undefined =>
  data && {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.filter((message) => message.id !== messageId)
    }))
  };
