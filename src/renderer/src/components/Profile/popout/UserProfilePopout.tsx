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
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AccountStore } from "@stores/Account.store";
import { UserPresenceCard } from "@components/Profile/popout/UserPresenceCard";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { useGoogleFont } from "@hooks/useGoogleFont";
import { Box, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ProfileConnectionsChips } from "@components/Profile/shared/ProfileConnectionsChips";
import { RecentActivitiesSection } from "@components/Profile/shared/RecentActivitiesSection";
import { getNonCustomActivities } from "@mutualzz/client";
import { useTranslation } from "react-i18next";
import { Snowflake } from "@mutualzz/client";
import type { Editor } from "slate";
import { toast } from "react-toastify";
import { formatRestError } from "@mutualzz/client";

interface Props {
  user: User | AccountStore;
  member?: SpaceMember;
}

export const UserProfilePopout = observer(({ user, member }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const inputRef = useRef<MarkdownInputHandle>(null);
  const [content, setContent] = useState("");

  const isSelf =
    app.account?.id != null &&
    String(app.account.id) === String(user.id);
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
    enabled: !!user.id,
    queryFn: () => app.profiles.resolve(user.id, true)
  });

  const profileRestricted =
    !isSelf && profileFetchDone && fetchedProfile === undefined;
  const displayProfile = profileRestricted
    ? undefined
    : (fetchedProfile ?? app.profiles.get(user.id));
  void displayProfile?.updatedAt;

  useEffect(() => {
    if (profileRestricted) return;
    app.gateway.subscribeUser(user.id);
    return () => app.gateway.unsubscribeUser(user.id);
  }, [app.gateway, user.id, profileRestricted]);

  const { fontFamily } = useGoogleFont(
    displayProfile?.pageFontFamily,
    user.id
  );

  const presence = profileRestricted ? undefined : app.presence.get(user.id);
  const bannerUrl = profileRestricted
    ? undefined
    : displayProfile?.constructBannerUrl();

  const { data: spotifyConnection } = useQuery({
    queryKey: ["user-spotify", user.id],
    enabled: !profileRestricted,
    queryFn: async () => {
      try {
        return await app.rest.get<{
          displayName: string | null;
          externalUrl: string | null;
        }>(`/users/${user.id}/spotify`);
      } catch {
        return null;
      }
    },
    staleTime: 60_000
  });

  const { data: userConnections } = useQuery({
    queryKey: ["user-connections-public", user.id],
    enabled: !profileRestricted,
    queryFn: async () => {
      try {
        return await app.rest.get<{
          connections: Array<{
            provider: string;
            displayName: string | null;
            externalUrl: string | null;
          }>;
        }>(`/users/${user.id}/connections`);
      } catch {
        return { connections: [] };
      }
    },
    staleTime: 60_000
  });

  const backgroundImageUrl = profileRestricted
    ? null
    : (displayProfile?.constructBackgroundUrl() ?? null);
  const profileBackground = profileRestricted
    ? theme.colors.surface
    : buildProfileBackgroundCss({
        backgroundColor: displayProfile?.backgroundColor,
        backgroundImageUrl,
        fallback: theme.colors.surface
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
    <Paper
      width={320}
      direction="column"
      borderRadius={12}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      position="relative"
      overflow="hidden"
      css={{ whiteSpace: "normal" }}
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
                <Typography level="title-md">{displayName}</Typography>
                {!profileRestricted && (user.pronouns ?? displayProfile?.pronouns) ? (
                  <>
                    <Typography level="body-sm" textColor="muted">
                      ·
                    </Typography>
                    <Typography level="body-sm" textColor="muted">
                      {user.pronouns ?? displayProfile?.pronouns}
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
            {!profileRestricted && displayProfile?.bio && (
              <ProfileMarkdownContent
                value={displayProfile.bio}
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
              connections={[
                ...(spotifyConnection?.externalUrl
                  ? [
                      {
                        provider: "spotify",
                        displayName: spotifyConnection.displayName,
                        externalUrl: spotifyConnection.externalUrl
                      }
                    ]
                  : []),
                ...(userConnections?.connections ?? [])
              ]}
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
  );
});
