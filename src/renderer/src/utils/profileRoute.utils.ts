import type { APIUser, APIUserProfile } from "@mutualzz/types";
import { CDNRoutes, ImageFormat } from "@mutualzz/types";
import { REST } from "@stores/REST.store";

export const fetchUserByIdentifier = async (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  const response = await fetch(REST.makeAPIUrl(`users/${encodeURIComponent(normalized)}`));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Failed to load user");
  }
  return (await response.json()) as APIUser;
};

export const fetchUserProfileByIdentifier = async (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  const response = await fetch(
    REST.makeAPIUrl(`users/${encodeURIComponent(normalized)}/profile`),
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Failed to load profile");
  }
  return (await response.json()) as APIUserProfile;
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
      "social profile"
    ]
  };
};
