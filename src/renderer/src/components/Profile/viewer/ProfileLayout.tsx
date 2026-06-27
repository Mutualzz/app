import { FeedSidebar } from "@components/Feed/FeedSidebar";
import { ProfileMusicTitleBarButton } from "@components/Profile/shared/ProfileMusicTitleBarButton";
import { UserBar } from "@components/User/UserBar";
import { useWindowTitleBar } from "@contexts/WindowTitleBar.context";
import type { APIProfileMusic } from "@mutualzz/types";
import type { UserProfile } from "@stores/objects/UserProfile";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, type ReactNode, useEffect } from "react";

interface Props extends PropsWithChildren {
  title: string;
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showFeedSidebar?: boolean;
  music?: APIProfileMusic | null;
  musicProfile?: UserProfile;
  musicAutoPlay?: boolean;
}

export const ProfileLayout = observer(
  ({ title, actions, onBack, backLabel, showFeedSidebar, music, musicProfile, musicAutoPlay, children }: Props) => {
    const { setConfig } = useWindowTitleBar();

    useEffect(() => {
      const centerExtra =
        music && musicProfile ? (
          <ProfileMusicTitleBarButton
            music={music}
            profile={musicProfile}
            autoPlay={musicAutoPlay}
          />
        ) : undefined;
      setConfig({ title, onBack, backLabel, end: actions, centerExtra, hideModeLabel: true });
      return () => setConfig(null);
    }, [title, onBack, backLabel, actions, music, musicProfile, musicAutoPlay, setConfig]);

    return (
      <Stack width="100%" height="100%" direction="row" minHeight={0}>
        {showFeedSidebar && (
          <Stack
            position="relative"
            maxWidth="5rem"
            width="100%"
            direction="column"
            height="100%"
          >
            <FeedSidebar />
            <UserBar />
          </Stack>
        )}

        <Stack flex={1} height="100%" direction="column" minWidth={0} minHeight={0}>
          {children}
        </Stack>
      </Stack>
    );
  }
);
