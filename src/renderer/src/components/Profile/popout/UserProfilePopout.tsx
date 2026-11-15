import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import { ProfileScrim } from "@components/Profile/shared/ProfileScrim";
import {
  MarkdownInput,
  type MarkdownInputHandle
} from "@components/Markdown/MarkdownInput/MarkdownInput";
import { useAppStore } from "@hooks/useStores";
import type { User } from "@stores/objects/User";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { buildProfileBackgroundCss } from "@mutualzz/ui-core";
import type { APIDisplayNameStyle, APIProfileTheme } from "@mutualzz/types";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AccountStore } from "@stores/Account.store";
import { UserPresenceCard } from "@components/Profile/popout/UserPresenceCard";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { useGoogleFont } from "@hooks/useGoogleFont";
import { Box, Skeleton, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ProfileConnectionsChips } from "@components/Profile/shared/ProfileConnectionsChips";
import { RecentActivitiesSection } from "@components/Profile/shared/RecentActivitiesSection";
import { getNonCustomActivities } from "@mutualzz/client";
import { useTranslation } from "react-i18next";
import { Snowflake } from "@mutualzz/client";
import type { Editor } from "slate";
import { toast } from "react-toastify";
import { formatRestError } from "@mutualzz/client";
import { ProfileDisplayName } from "../shared/ProfileDisplayName";
import {
  getScopedThemeCss,
  ProfileThemeScope,
  useProfileScopedTheme
} from "../shared/ProfileThemeScope";

export interface ProfilePopoutPreview {
  bio: string;
  pronouns: string;
  banner: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  pageFontFamily: string | null;
  theme: APIProfileTheme | null;
  displayNameStyle: APIDisplayNameStyle | null;
}

interface Props {
  user: User | AccountStore;
  member?: SpaceMember;
  preview?: ProfilePopoutPreview;
}

export const UserProfilePopout = observer(
  ({ user, member, preview }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const inputRef = useRef<MarkdownInputHandle>(null);
    const [content, setContent] = useState("");

    const isSelf =
      app.account?.id != null && String(app.account.id) === String(user.id);
    const relationship = app.relationships.getForMe(user.id);
    const iBlockedThem =
      !!relationship?.isBlocked && relationship.userId === app.account?.id;
    const theyBlockedMe =
      !!relationship?.isBlocked && relationship.userId !== app.account?.id;
    const denyMessaging =
      !!user.flags?.has("System") ||
      iBlockedThem ||
      ("viewerCanDm" in user && user.viewerCanDm === false);
    const displayName = member?.displayName ?? user.displayName;
    const isPreview = !!preview;

    useEffect(() => {
      if (isSelf) return;
      void app.users.resolve(user.id);
    }, [app.users, isSelf, user.id]);

    const { mutate: sendMessage, isPending: sending } = useMutation({
      mutationKey: ["profile-popout-dm", user.id],
      mutationFn: async (messageContent: string) => {
        if (theyBlockedMe) throw new Error(t("cannotMessagePerson"));
        const channel = await app.channels.openDM(user.id);
        await channel.sendMessage({
          content: messageContent,
          nonce: Snowflake.generate()
        });
        return channel;
      },
      onSuccess: (channel) => {
        setContent("");
        const editor = inputRef.current?.editor;
        if (editor) {
          editor.select({ anchor: editor.start([]), focus: editor.end([]) });
          editor.removeNodes();
          editor.delete();
          editor.insertNode({ type: "line", children: [{ text: "" }] });
        }
        navigate({
          to: "/@me/$channelId",
          params: { channelId: channel.id },
          replace: true
        });
      },
      onError: (err) => {
        toast.error(formatRestError(err, t("cannotMessagePerson")));
      }
    });

    const { data: fetchedProfile, isFetched: profileFetchDone } = useQuery({
      queryKey: ["profile-popout", user.id, app.account?.id],
      enabled: !!user.id && !isPreview,
      queryFn: () => app.profiles.resolve(user.id, true)
    });

    const profileRestricted =
      !isSelf && profileFetchDone && fetchedProfile === undefined;
    const displayProfile = profileRestricted
      ? undefined
      : (fetchedProfile ?? app.profiles.get(user.id));
    void displayProfile?.updatedAt;
    const profileSource = preview ?? displayProfile;
    const shownPronouns =
      (isPreview ? null : member?.pronouns) ??
      user.pronouns ??
      profileSource?.pronouns;
    const shownBio = (isPreview ? null : member?.bio) ?? profileSource?.bio;

    useEffect(() => {
      if (profileRestricted || isPreview) return;
      app.gateway.subscribeUser(user.id);
      return () => app.gateway.unsubscribeUser(user.id);
    }, [app.gateway, user.id, profileRestricted, isPreview]);

    const { fontFamily } = useGoogleFont(
      profileSource?.pageFontFamily,
      user.id
    );

    const presence = profileRestricted ? undefined : app.presence.get(user.id);
    const bannerUrl = profileRestricted
      ? undefined
      : preview
        ? displayProfile?.constructBannerUrlFrom(preview.banner)
        : (member?.constructBannerUrl() ?? displayProfile?.constructBannerUrl());

    const { data: userConnections } = useQuery({
      queryKey: ["user-connections-public", user.id],
      enabled: !profileRestricted,
      queryFn: async () => {
        try {
          return await app.rest.get<{
            connections: {
              provider: string;
              displayName: string | null;
              externalUrl: string | null;
            }[];
          }>(`/users/${user.id}/connections`);
        } catch {
          return { connections: [] };
        }
      },
      staleTime: 60_000
    });

    const scopedTheme = useProfileScopedTheme(
      profileRestricted ? null : profileSource?.theme
    );
    const surfaceFallback = scopedTheme
      ? String(scopedTheme.colors.background)
      : theme.colors.surface;

    const backgroundImageUrl = profileRestricted
      ? null
      : ((preview
          ? displayProfile?.constructBackgroundUrlFrom(preview.backgroundImage)
          : displayProfile?.constructBackgroundUrl()) ?? null);
    const profileBackground = profileRestricted
      ? theme.colors.surface
      : buildProfileBackgroundCss({
          backgroundColor: profileSource?.backgroundColor,
          backgroundImageUrl,
          fallback: surfaceFallback
        });

    const canSubmit = !!content.trim() && !denyMessaging && !sending;

    const handleSubmit = () => {
      if (!canSubmit) return;
      sendMessage(content.trim());
    };

    const onKeyDown = (e: KeyboardEvent, _editor: Editor) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <ProfileThemeScope scopedTheme={scopedTheme}>
        <Paper
          width={320}
          direction="column"
          borderRadius={12}
          elevation={app.settings?.preferEmbossed ? 5 : 2}
          position="relative"
          overflow="hidden"
          css={{ whiteSpace: "normal", ...getScopedThemeCss(scopedTheme) }}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            css={{ background: profileBackground }}
          />

          <Box
            position="relative"
            css={{ zIndex: 1, ...(fontFamily ? { fontFamily } : {}) }}
          >
            <Box position="relative" css={{ marginBottom: 36 }}>
              <Box
                height={96}
                css={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  overflow: "hidden",
                  background: bannerUrl
                    ? `url("${bannerUrl}") center / cover no-repeat`
                    : user.accentColor
                }}
              />

              <Box
                position="absolute"
                left={2.5}
                bottom={0}
                css={{ transform: "translateY(50%)", zIndex: 1 }}
              >
                <UserAvatar
                  user={user}
                  member={member}
                  size={72}
                  badge
                  disableContextMenu
                  css={{
                    ":hover": {
                      filter: "brightness(0.9)",
                      cursor: "pointer",
                      transition: "filter 0.2s ease-in-out"
                    }
                  }}
                  onClick={() => {
                    if (isPreview) return;
                    void app.profiles.resolve(user.id, true).finally(() => {
                      navigate({
                        to: "/users/$username",
                        params: { username: user.username.toLowerCase() }
                      });
                    });
                  }}
                />
              </Box>
            </Box>

            <Stack direction="column" spacing={1.25} px={2} pb={2}>
              <ProfileScrim>
                <Stack direction="column" spacing={0.25}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    minWidth={0}
                    flexWrap="wrap"
                  >
                    <Typography level="title-md">
                      <ProfileDisplayName
                        nameStyle={profileSource?.displayNameStyle}
                        ownerUserId={user.id}
                      >
                        {displayName}
                      </ProfileDisplayName>
                    </Typography>
                    {!profileRestricted && shownPronouns ? (
                      <>
                        <Typography level="body-sm" textColor="muted">
                          ·
                        </Typography>
                        <Typography level="body-sm" textColor="muted">
                          {shownPronouns}
                        </Typography>
                      </>
                    ) : null}
                  </Stack>
                  <Typography level="body-sm" css={{ opacity: 0.7 }}>
                    @{user.username}
                  </Typography>
                  {!profileRestricted && presence && (
                    <SmallActivityStatus
                      userId={user.id}
                      presence={presence}
                      customOnly
                    />
                  )}
                </Stack>
                {!isPreview && !profileFetchDone && !displayProfile && (
                  <Skeleton lines={2} fontSize={13} css={{ marginTop: 8 }} />
                )}
                {!profileRestricted && shownBio && (
                  <ProfileMarkdownContent
                    value={shownBio}
                    lineClamp={3}
                    css={{ marginTop: 8 }}
                  />
                )}
              </ProfileScrim>

              {!profileRestricted && presence && (
                <UserPresenceCard presence={presence} />
              )}

              {!profileRestricted && (
                <RecentActivitiesSection
                  userId={user.id}
                  liveActivities={
                    presence &&
                    (presence.status === "online" ||
                      presence.status === "idle" ||
                      presence.status === "dnd")
                      ? getNonCustomActivities(presence)
                      : []
                  }
                  iconSize={28}
                  compact
                />
              )}

              {!profileRestricted && (
                <ProfileConnectionsChips
                  connections={userConnections?.connections ?? []}
                />
              )}

              {!isSelf && (
                <MarkdownInput
                  ref={inputRef}
                  variant="soft"
                  value={content}
                  onChange={setContent}
                  onKeyDown={onKeyDown}
                  disabled={denyMessaging || sending}
                  emojiPicker={!denyMessaging}
                  mentions={false}
                  gifPicker={false}
                  stickerPicker={false}
                  placeholder={
                    denyMessaging
                      ? t("composer.placeholder.blocked")
                      : t("composer.placeholder.dm", { name: displayName })
                  }
                />
              )}
            </Stack>
          </Box>
        </Paper>
      </ProfileThemeScope>
    );
  }
);
