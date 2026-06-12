import type { Theme as MzTheme } from "@emotion/react";
import type { AppStore } from "@stores/App.store";
import { Theme } from "@stores/objects/Theme";
import type { useNavigate } from "@tanstack/react-router";
import mergeWith from "lodash-es/mergeWith";
import { isValidElement, type ReactNode } from "react";
import MurmurHash from "imurmurhash";
import { APIMessage, MessageType, PresenceStatus } from "@mutualzz/types";
import type { Expression } from "@stores/objects/Expression";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { Channel } from "@stores/objects/Channel";
import Snowflake from "@utils/Snowflake";

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

export const createSystemMessage = async (
  app: AppStore,
  channelId: string,
  content: string,
  flags?: bigint
): Promise<APIMessage | null> => {
  const systemUser = await app.users.resolveSystem();
  if (!systemUser) return null;

  return {
    author: systemUser.toJSON(),
    authorId: systemUser.id,
    channelId,
    embeds: [],
    content,
    edited: false,
    id: Snowflake.generate(),
    nonce: null,
    spaceId: null,
    type: MessageType.System,
    flags: flags || 0n,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const canUseCustomEmoji = (
  meId: Snowflake,
  emoji: Expression,
  currentMember?: SpaceMember | null,
  channel?: Channel | null
) => {
  if (!emoji.spaceId && meId !== emoji.authorId) return false;

  if (!currentMember) return true;

  if (emoji.spaceId === currentMember.spaceId) return true;

  return currentMember.hasPermission("UseExternalEmojis", channel ?? undefined);
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
      return "Online";
    case "idle":
      return "Idle";
    case "dnd":
      return "Do Not Disturb";
    case "invisible":
      return "Invisible";
    case "offline":
    default:
      return "Offline";
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

/**
 * Returns a boolean indicating if we are running in a electron context
 */
export const isElectron = !!window.api;

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

export const switchMode = (
  app: AppStore,
  navigate?: ReturnType<typeof useNavigate>
) => {
  if (app.mode === "feed") {
    if (navigate) {
      navigate({
        to: "/spaces",
        replace: true
      });
    }
  }

  if (app.mode === "spaces") {
    if (navigate)
      navigate({
        to: "/feed",
        replace: true
      });
  }

  if ((!app.mode || app.mode === "@me") && app.account) {
    const preferredMode = app.settings?.preferredMode;
    if (navigate)
      navigate({
        to: preferredMode === "feed" ? "/feed" : "/spaces",
        replace: true
      });
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
