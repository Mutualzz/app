import type { APIUser, APIUserProfile } from "@mutualzz/types";
import { CDNRoutes, ImageFormat } from "@mutualzz/types";
import { REST } from "@stores/REST.store";

async function fetchWithAuth(path: string) {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (typeof localStorage !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return fetch(REST.makeAPIUrl(path), { headers });
}

async function fetchOwnUserIfMatch(normalized: string) {
  const response = await fetchWithAuth("@me");
  if (!response.ok) return null;

  const user = (await response.json()) as APIUser;
  if (
    user.username.toLowerCase() === normalized ||
    String(user.id) === normalized
  ) {
    return user;
  }

  return null;
}

export const fetchUserByIdentifier = async (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  const response = await fetchWithAuth(
    `users/${encodeURIComponent(normalized)}`,
  );

  if (response.ok) {
    return (await response.json()) as APIUser;
  }

  if (response.status === 404) {
    return fetchOwnUserIfMatch(normalized);
  }

  throw new Error("Failed to load user");
};

export const fetchUserProfileByIdentifier = async (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  const response = await fetchWithAuth(
    `users/${encodeURIComponent(normalized)}/profile`,
  );

  if (response.ok) {
    return (await response.json()) as APIUserProfile;
  }

  if (response.status === 404) {
    const me = await fetchOwnUserIfMatch(normalized);
    if (!me) return null;

    const ownResponse = await fetchWithAuth("@me/profile");
    if (ownResponse.ok) {
      return (await ownResponse.json()) as APIUserProfile;
    }

    return null;
  }

  throw new Error("Failed to load profile");
};

export const getUserDisplayName = (user: APIUser) =>
  user.globalName?.trim() || user.username;

export const buildProfileAvatarUrl = (user: APIUser) => {
  if (user.avatar) {
    return REST.makeCDNUrl(
      CDNRoutes.userAvatar(user.id, user.avatar, ImageFormat.WebP, 256, true),
    );
  }

  return REST.makeCDNUrl(
    CDNRoutes.defaultUserAvatar(
      user.defaultAvatar.type,
      "light",
      256,
      ImageFormat.WebP,
    ),
  );
};

export const buildProfilePageUrl = (username: string) => {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://mutualzz.com";
  return `${origin}/users/${encodeURIComponent(username.toLowerCase())}`;
};

export const buildProfileSeo = (user: APIUser, profile: APIUserProfile) => {
  const displayName = getUserDisplayName(user);
  const title = `${displayName} (@${user.username}) | Mutualzz`;
  const description =
    profile.bio?.trim() ||
    (profile.configured
      ? `View ${displayName}'s customized profile on Mutualzz.`
      : `${displayName} on Mutualzz — connect with people who share your interests.`);

  return {
    title,
    description: description.slice(0, 160),
    image: buildProfileAvatarUrl(user),
    url: buildProfilePageUrl(user.username),
    keywords: [
      user.username,
      displayName,
      "Mutualzz profile",
      "user profile",
      "social profile",
    ],
  };
};
