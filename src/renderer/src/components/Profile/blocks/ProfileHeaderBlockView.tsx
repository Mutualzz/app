import { UserAvatar } from "@components/User/UserAvatar";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import type { ProfileHeaderBlock } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

const AVATAR_SIZE = 72;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;
const DEFAULT_BANNER_HEIGHT = 58;

interface Props {
  user: User | AccountStore;
  profile: UserProfile;
  block?: ProfileHeaderBlock;
  bioOverride?: string | null;
  bannerOverride?: string | null;
}

export const ProfileHeaderBlockView = observer(
  ({ user, profile, block, bioOverride, bannerOverride }: Props) => {
    void profile.updatedAt;

    const bannerSource =
      bannerOverride !== undefined ? bannerOverride : profile.banner;

    const bannerUrl = profile.constructBannerUrlFrom(bannerSource);
    const bio = bioOverride !== undefined ? bioOverride : profile.bio;
    const bannerHeight = block?.bannerHeight ?? DEFAULT_BANNER_HEIGHT;
    const bannerFocusY = block?.bannerFocusY ?? 50;

    return (
      <Stack direction="column" width="100%" height="100%" overflow="hidden">
        <Box
          width="100%"
          flexShrink={0}
          css={{
            height: `${bannerHeight}%`,
            minHeight: 64,
            background: bannerUrl
              ? `url("${bannerUrl}") center ${bannerFocusY}% / cover no-repeat`
              : user.accentColor
          }}
        />

        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={1.5}
          px={2}
          pb={1.5}
          flex={1}
          minHeight={0}
          minWidth={0}
          css={{
            marginTop: -AVATAR_OVERLAP,
            position: "relative",
            zIndex: 1
          }}
        >
          <Box flexShrink={0}>
            <UserAvatar user={user} size={AVATAR_SIZE} badge />
          </Box>

          <Stack
            direction="column"
            spacing={bio ? 0.5 : 0}
            flex={1}
            minWidth={0}
            minHeight={0}
            css={{ paddingTop: AVATAR_OVERLAP }}
          >
            <Typography level="title-md" css={{ lineHeight: 1.25 }}>
              {user.displayName}
            </Typography>
            {bio && (
              <Box
                flex={1}
                minHeight={0}
                css={{
                  overflowY: "auto",
                  opacity: 0.85,
                  fontSize: "var(--mz-fontSize-sm, 0.875rem)"
                }}
              >
                <ProfileMarkdownContent value={bio} />
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>
    );
  }
);
