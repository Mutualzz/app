import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import { useAppStore } from "@hooks/useStores";
import type { User } from "@stores/objects/User";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { Stack, Typography, Box, useTheme } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AccountStore } from "@stores/Account.store";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { useGoogleFont } from "@hooks/useGoogleFont";

interface Props {
  user: User | AccountStore;
  member?: SpaceMember;
}

export const UserProfilePopout = observer(({ user, member }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    app.gateway.subscribeUser(user.id);
    return () => app.gateway.unsubscribeUser(user.id);
  }, [app.gateway, user.id]);

  const { data: fetchedProfile, isLoading } = useQuery({
    queryKey: ["profile-popout", user.id],
    queryFn: () => app.profiles.resolve(user.id)
  });

  const profile = app.profiles.get(user.id) ?? fetchedProfile;
  void profile?.updatedAt;
  const { fontFamily } = useGoogleFont(profile?.pageFontFamily, user.id);

  const presence = app.presence.get(user.id);
  const isSelf = app.account?.id === user.id;
  const bannerUrl = profile?.constructBannerUrl();

  const backgroundImageUrl = profile?.constructBackgroundUrl() ?? null;
  const resolvedBackgroundColor =
    profile?.backgroundColor ?? theme.colors.surface;
  const profileBackground = backgroundImageUrl
    ? `url("${backgroundImageUrl}") center / cover no-repeat, ${resolvedBackgroundColor}`
    : resolvedBackgroundColor;

  return (
    <Paper
      width={320}
      direction="column"
      borderRadius={12}
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        css={{ background: profileBackground }}
      />

      <Box position="relative" css={{ zIndex: 1, ...(fontFamily ? { fontFamily } : {}) }}>
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
              popout={false}
            />
          </Box>
        </Box>

        <Stack direction="column" spacing={1} px={2} pb={2}>
          {isLoading ? (
            <></>
          ) : (
            <>
              <Stack direction="column" spacing={0.25}>
                <Typography level="title-md">
                  {member?.displayName ?? user.displayName}
                </Typography>
                <Typography level="body-sm" css={{ opacity: 0.7 }}>
                  @{user.username}
                </Typography>
                {presence && <SmallActivityStatus presence={presence} />}
              </Stack>

              {profile?.bio && (
                <ProfileMarkdownContent
                  value={profile.bio}
                  lineClamp={3}
                  css={{ opacity: 0.85 }}
                />
              )}

              <Stack direction="row" spacing={1} pt={0.5}>
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    navigate({
                      to: "/users/$username",
                      params: { username: user.username }
                    });
                  }}
                >
                  View Profile
                </Button>
                {isSelf && (
                  <Button
                    size="sm"
                    color="neutral"
                    onClick={() => {
                      navigate({ to: "/profile" });
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  );
});
