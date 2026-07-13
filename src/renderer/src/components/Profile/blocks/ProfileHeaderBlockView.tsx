import { UserAvatar } from "@components/User/UserAvatar";
import { ProfileMarkdownContent } from "@components/Profile/shared/ProfileMarkdownContent";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { ImageFormat, type ProfileHeaderBlock } from "@mutualzz/types";
import {
  resolveProfileBackgroundFill,
  resolveProfileBlockCornerRadius,
} from "@mutualzz/ui-core";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";

const AVATAR_SIZE = 72;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;
const DEFAULT_BANNER_HEIGHT = 58;
const BANNER_RENDER_SIZE = 1024;

interface Props {
  user: User | AccountStore;
  profile: UserProfile;
  block?: ProfileHeaderBlock;
  bioOverride?: string | null;
  bannerOverride?: string | null;
}

export const ProfileHeaderBlockView = observer(
  ({ user, profile, block, bioOverride, bannerOverride }: Props) => {
    const app = useAppStore();

    const bannerSource =
      bannerOverride !== undefined ? bannerOverride : profile.banner;

    const bannerUrl = profile.constructBannerUrlFrom(
      bannerSource,
      ImageFormat.WebP,
      BANNER_RENDER_SIZE,
      bannerSource?.startsWith("a_")
    );
    const bio = bioOverride !== undefined ? bioOverride : profile.bio;
    const bannerHeight = block?.bannerHeight ?? DEFAULT_BANNER_HEIGHT;
    const bannerFocusY = block?.bannerFocusY ?? 50;
    const headerBackground = block?.backgroundColor?.trim() || null;
    const cornerRadius = resolveProfileBlockCornerRadius(
      block ?? { type: "header" },
      "desktop",
    );

    return (
      <Paper
        direction="column"
        width="100%"
        height="100%"
        overflow="hidden"
        borderRadius={cornerRadius}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        css={{ position: "relative" }}
      >
        {headerBackground ? (
          <Box
            css={{
              position: "absolute",
              inset: 0,
              background: resolveProfileBackgroundFill(
                headerBackground,
                "transparent",
              ),
              pointerEvents: "none",
            }}
          />
        ) : null}
        <Box
          width="100%"
          flexShrink={0}
          css={{
            height: `${bannerHeight}%`,
            minHeight: 64,
            overflow: "hidden",
            backgroundColor: bannerUrl ? undefined : user.accentColor,
            position: "relative",
            zIndex: 0,
          }}
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt=""
              draggable={false}
              css={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `center ${bannerFocusY}%`,
                display: "block"
              }}
            />
          ) : null}
        </Box>

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
            <Typography level="title-md" css={{ lineHeight: 1.25, fontSize: "var(--pcf-title)" }}>
              {user.displayName}
            </Typography>
            {bio && (
              <Typography
                flex={1}
                minHeight={0}
                level="body-sm"
                css={{
                  overflowY: "auto",
                  opacity: 0.85,
                  fontSize: "var(--pcf-sm)"
                }}
              >
                <ProfileMarkdownContent value={bio} />
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  }
);
