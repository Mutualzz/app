import { ProfileMusicTitleBarButton } from "@components/Profile/shared/ProfileMusicTitleBarButton";
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
  music?: APIProfileMusic | null;
  musicProfile?: UserProfile;
  musicAutoPlay?: boolean;
}

export const ProfileLayout = observer(
  ({
    title,
    actions,
    onBack,
    backLabel,
    music,
    musicProfile,
    musicAutoPlay,
    children
  }: Props) => {
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
      setConfig({
        title,
        onBack,
        backLabel,
        end: actions,
        centerExtra,
        hideModeLabel: true
      });
      return () => setConfig(null);
    }, [
      title,
      onBack,
      backLabel,
      actions,
      music,
      musicProfile,
      musicAutoPlay,
      setConfig
    ]);

    return (
      <Stack
        flex={1}
        width="100%"
        height="100%"
        direction="column"
        minWidth={0}
        minHeight={0}
      >
        {children}
      </Stack>
    );
  }
);
