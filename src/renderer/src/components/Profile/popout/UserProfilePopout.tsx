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
import { getNonCustomActivities } from "@utils/customStatus";
import { useTranslation } from "react-i18next";
import Snowflake from "@utils/Snowflake";
import type { Editor } from "slate";
import { toast } from "react-toastify";
import { formatRestError } from "@utils/restError";

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

  const isSelf = app.account?.id === user.id;
  const relationship = app.relationships.getForMe(user.id);
  const iBlockedThem =
    !!relationship?.isBlocked && relationship.userId === app.account?.id;
  const theyBlockedMe =
    !!relationship?.isBlocked && relationship.userId !== app.account?.id;
  const denyMessaging = !!user.flags?.has("System") || iBlockedThem;
  const displayName = member?.displayName ?? user.displayName;

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

  useEffect(() => {
    app.gateway.subscribeUser(user.id);
    return () => app.gateway.unsubscribeUser(user.id);
  }, [app.gateway, user.id]);

  const { data: fetchedProfile } = useQuery({
    queryKey: ["profile-popout", user.id],
    queryFn: () => app.profiles.resolve(user.id)
  });

  const profile = app.profiles.get(user.id) ?? fetchedProfile;
  void profile?.updatedAt;
  const { fontFamily } = useGoogleFont(profile?.pageFontFamily, user.id);

  const presence = app.presence.get(user.id);
  const bannerUrl = profile?.constructBannerUrl();

  const { data: spotifyConnection } = useQuery({
    queryKey: ["user-spotify", user.id],
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

  const backgroundImageUrl = profile?.constructBackgroundUrl() ?? null;
  const profileBackground = buildProfileBackgroundCss({
    backgroundColor: profile?.backgroundColor,
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
                navigate({
                  to: "/users/$username",
                  params: { username: user.username }
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
                {(user.pronouns ?? profile?.pronouns) ? (
                  <>
                    <Typography level="body-sm" textColor="muted">
                      ·
                    </Typography>
                    <Typography level="body-sm" textColor="muted">
                      {user.pronouns ?? profile?.pronouns}
                    </Typography>
                  </>
                ) : null}
              </Stack>
              <Typography level="body-sm" css={{ opacity: 0.7 }}>
                @{user.username}
              </Typography>
              {presence && (
                <SmallActivityStatus presence={presence} customOnly />
              )}
            </Stack>
            {profile?.bio && (
              <ProfileMarkdownContent
                value={profile.bio}
                lineClamp={3}
                css={{ marginTop: 8 }}
              />
            )}
          </ProfileScrim>

          {presence && <UserPresenceCard presence={presence} />}

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
