import type { Theme as MzTheme } from "@emotion/react";
import type { AppStore } from "@stores/App.store";
import { Theme } from "@stores/objects/Theme";
import type { useNavigate } from "@tanstack/react-router";
import mergeWith from "lodash-es/mergeWith";
import { isValidElement, type ReactNode } from "react";
import MurmurHash from "imurmurhash";
import {
  ExpressionType,
  PresenceStatus
} from "@mutualzz/types";
import type { Expression } from "@stores/objects/Expression";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { Channel } from "@stores/objects/Channel";
import { Snowflake } from "@mutualzz/client";
import i18n from "../i18n";
import {
  createSystemMessage as createSystemMessageBase,
  preferredChannelForSpace,
  resolveModeRouteTarget,
} from "@mutualzz/client";

export function mergeAppendAnything(
  ...objects: Record<string, string | string[]>[]
): Record<string, string[]> {
  return mergeWith({}, ...objects, (objValue: any, srcValue: any) => {
    const toArray = (val: string | string[]): string[] =>
      Array.isArray(val) ? val : [val];

    if (objValue !== undefined && srcValue !== undefined) {
      return Array.from(new Set(toArray(objValue).concat(toArray(srcValue))));
    }

    return undefined;
  });
}

export const createSystemMessage = (
  app: AppStore,
  channelId: string,
  content: string,
  flags?: bigint
) => createSystemMessageBase(app.users as Parameters<typeof createSystemMessageBase>[0], channelId, content, flags);

export const canUseCustomEmoji = (
  meId: Snowflake,
  emoji: Expression,
  currentMember?: SpaceMember | null,
  channel?: Channel | null,
  joinedSpaceIds?: readonly Snowflake[] | null
) => {
  if (emoji.type !== ExpressionType.Emoji) return false;

  if (!emoji.spaceId && meId !== emoji.authorId) return false;

  const inSpace = !!channel?.spaceId && !!currentMember;

  if (!inSpace) {
    if (!emoji.spaceId) return meId === emoji.authorId;
    return !!joinedSpaceIds?.includes(emoji.spaceId);
  }

  if (emoji.spaceId === currentMember.spaceId) return true;

  return currentMember.hasPermission("UseExternalEmojis", channel ?? undefined);
};

export const canUseSticker = (
  meId: Snowflake,
  sticker: Expression,
  currentMember?: SpaceMember | null,
  channel?: Channel | null
) => {
  if (sticker.type !== ExpressionType.Sticker) return false;
  if (!sticker.spaceId && meId !== sticker.authorId) return false;

  if (!currentMember) return true;

  if (sticker.spaceId === currentMember.spaceId) return true;

  return currentMember.hasPermission(
    "UseExternalStickers",
    channel ?? undefined
  );
};

export const generateHash = async (buffer: ArrayBuffer, animated: boolean) => {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${animated ? "a_" : ""}${hashHex}`;
};

export const formatPresenceStatus = (status: PresenceStatus) => {
  switch (status) {
    case "online":
      return i18n.t("status.online");
    case "idle":
      return i18n.t("status.idle");
    case "dnd":
      return i18n.t("status.dnd");
    case "invisible":
      return i18n.t("status.invisible");
    case "offline":
    default:
      return i18n.t("status.offline");
  }
};

export const murmur = (input: string): string =>
  MurmurHash(input).result().toString();

export const toSpotifyUri = (u: URL): string | null => {
  if (u.hostname !== "open.spotify.com") return null;

  // /track/<id>, /album/<id>, /playlist/<id>, /artist/<id>, /show/<id>, /episode/<id>
  const parts = u.pathname.split("/").filter(Boolean);
  const type = parts[0];
  const id = parts[1];

  if (!type || !id) return null;
  return `spotify:${type}:${id}`;
};

export const asAcronym = (str: string) =>
  str
    .split(" ")
    .map((str) => str[0])
    .join("");

export const getIconType = (theme: MzTheme): string => {
  const isAdaptive = theme.id !== "baseDark" && theme.id !== "baseLight";

  const filename = isAdaptive ? "icon-adaptive.png" : "icon.png";

  if (isElectron)
    return `/icons/${isAdaptive ? "adaptive" : "base"}/${filename}`;

  return `/${filename}`;
};

export const isElectron = !!window.api;

export const openExternalLink = async (url: string) => {
  if (window.api?.shell?.openExternal) {
    await window.api.shell.openExternal(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const canvasToArrayBuffer = (canvas: HTMLCanvasElement) =>
  new Promise<ArrayBuffer>((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("canvas.toBlob failed"));
      blob.arrayBuffer().then(resolve).catch(reject);
    }, "image/png")
  );

export const sortThemes = (themes: Theme[]): Theme[] => {
  const priorityOrder: string[] = ["baseDark", "baseLight"];

  const priorityThemes = themes.filter((theme) =>
    priorityOrder.includes(theme.id)
  );

  const otherThemes = themes
    .filter((theme) => !priorityOrder.includes(theme.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...priorityThemes, ...otherThemes];
};

export const preferredModePath = (app: AppStore) => {
  const mode = app.settings?.preferredMode ?? "spaces";

  switch (mode) {
    case "feed":
      return "/feed";
    case "@me":
      return "/@me";
    default:
      return "/spaces";
  }
};

export const navigateToPreferredMode = (
  app: AppStore,
  navigate: ReturnType<typeof useNavigate>,
  replace = true
) => {
  navigateToMode(app, navigate, app.settings?.preferredMode ?? "spaces", replace);
};

type NavigateFn = ReturnType<typeof useNavigate>;

export const navigateToMode = (
  app: AppStore,
  navigate: NavigateFn,
  mode: "spaces" | "feed" | "@me" | "dms",
  replace = true
) => {
  const target = resolveModeRouteTarget(
    app as Parameters<typeof resolveModeRouteTarget>[0],
    mode,
  );

  if (target.type === "feed") {
    navigate({ to: "/feed", replace });
    return;
  }

  if (target.type === "dms") {
    if (target.channelId) {
      navigate({
        to: "/@me/$channelId",
        params: { channelId: target.channelId },
        replace
      });
      return;
    }
    navigate({ to: "/@me", replace });
    return;
  }

  if (target.type === "spaces-list") {
    navigate({ to: "/spaces", replace });
    return;
  }

  if (target.channelId) {
    navigate({
      to: "/spaces/$spaceId/$channelId",
      params: { spaceId: target.spaceId, channelId: target.channelId },
      replace
    });
    return;
  }

  navigate({
    to: "/spaces/$spaceId",
    params: { spaceId: target.spaceId },
    replace
  });
};

export const navigateToSpace = (
  app: AppStore,
  navigate: NavigateFn,
  spaceId: string,
  replace = false
) => {
  app.spaces.setMostRecentSpace(spaceId);

  const channel = preferredChannelForSpace(
    app as Parameters<typeof preferredChannelForSpace>[0],
    spaceId,
  );
  if (channel) {
    navigate({
      to: "/spaces/$spaceId/$channelId",
      params: { spaceId, channelId: channel.id },
      replace
    });
    return;
  }

  app.spaces.setActive(spaceId);
  navigate({
    to: "/spaces/$spaceId",
    params: { spaceId },
    replace
  });
};

export const switchMode = (
  app: AppStore,
  navigate?: ReturnType<typeof useNavigate>
) => {
  if (!navigate) return;

  if (app.mode === "feed") {
    navigateToMode(app, navigate, "spaces");
    return;
  }

  if (app.mode === "spaces") {
    navigateToMode(app, navigate, "feed");
    return;
  }

  if ((!app.mode || app.mode === "@me") && app.account) {
    navigateToPreferredMode(app, navigate, true);
  }
};

export function reactNodeToHtml(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (Array.isArray(node)) return node.map(reactNodeToHtml).join("");

  if (isValidElement(node)) {
    const { type, props } = node;

    if (typeof type === "string") {
      // native HTML element
      const children = reactNodeToHtml((props as any).children);
      const attrs = Object.entries(props as any)
        .filter(([k]) => k !== "children")
        .map(([k, v]) => ` ${k}="${v}"`)
        .join("");
      return `<${type}${attrs}>${children}</${type}>`;
    }

    // For custom components: either recurse or bail
    return reactNodeToHtml((props as any).children);
  }

  return "";
}
