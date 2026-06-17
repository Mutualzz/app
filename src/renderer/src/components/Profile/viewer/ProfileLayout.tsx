import { FeedSidebar } from "@components/Feed/FeedSidebar";
import { UserBar } from "@components/User/UserBar";
import { useWindowTitleBar } from "@contexts/WindowTitleBar.context";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, type ReactNode, useEffect } from "react";

interface Props extends PropsWithChildren {
  title: string;
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showFeedSidebar?: boolean;
}

export const ProfileLayout = observer(
  ({ title, actions, onBack, backLabel, showFeedSidebar, children }: Props) => {
    const { setConfig } = useWindowTitleBar();

    useEffect(() => {
      setConfig({ title, onBack, backLabel, end: actions, hideModeLabel: true });
      return () => setConfig(null);
    }, [title, onBack, backLabel, actions, setConfig]);

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
