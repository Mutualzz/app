import type { APIUser } from "@mutualzz/types";
import { isMessageSearchQueryReady } from "@mutualzz/validators";
import type { ColorLike } from "@mutualzz/ui-core";
import { getMessageAuthorColor } from "@mutualzz/client";
import type { AppStore } from "@stores/App.store";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { User } from "@stores/objects/User";

interface SearchDisplayContext {
  app: AppStore;
  space?: Space | null;
  channel?: Channel | null;
  member?: SpaceMember | null;
  user?: User | null;
  author?: APIUser | null;
  username?: string;
}

export function getSearchDisplayName({
  app,
  space,
  channel,
  member,
  user,
  author,
  username,
}: SearchDisplayContext) {
  if (member) return member.displayName;

  const userId = user?.id ?? author?.id;
  if (userId && space) {
    const spaceMember = space.members.get(userId);
    if (spaceMember) return spaceMember.displayName;
  }

  if (user) return user.displayName;

  if (userId) {
    const storeUser = app.users.get(userId);
    if (storeUser) return storeUser.displayName;
  }

  if (username) {
    const spaceMember = space?.members.all.find(
      (entry) => entry.user?.username.toLowerCase() === username.toLowerCase(),
    );
    if (spaceMember) return spaceMember.displayName;

    const dmUser = channel?.dmRecipientsList.find(
      (entry) => entry.username.toLowerCase() === username.toLowerCase(),
    );
    if (dmUser) return dmUser.displayName;

    for (const storeUser of app.users.all) {
      if (storeUser.username.toLowerCase() === username.toLowerCase()) {
        return storeUser.displayName;
      }
    }

    return username;
  }

  if (author) return author.globalName || author.username;

  return "";
}

export function getSearchAuthorColor(
  app: AppStore,
  author: APIUser,
  space: Space | null | undefined,
  options: {
    showRoleColors: boolean;
    primaryTextColor: string;
  },
): ColorLike {
  const member = space?.members.get(author.id);
  return getMessageAuthorColor({
    showRoleColors: options.showRoleColors,
    primaryTextColor: options.primaryTextColor,
    roleColor: member?.highestRole?.color,
    accentColor: app.users.get(author.id)?.accentColor ?? author.accentColor,
  }) as ColorLike;
}

export function commitSearchFilterChange(
  value: string,
  setDraft: (value: string) => void,
  setQuery: (value: string) => void,
) {
  setDraft(value);
  const trimmed = value.trim();
  if (isMessageSearchQueryReady(trimmed)) {
    setQuery(trimmed);
  }
}
