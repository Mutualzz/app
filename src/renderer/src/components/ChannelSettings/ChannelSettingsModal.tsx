import { type Channel } from "@stores/objects/Channel";
import { type ChannelSettingsPage, ChannelSettingsProvider } from "@components/ChannelSettings/ChannelSettings.context";
import { observer } from "mobx-react-lite";
import { type Space } from "@stores/objects/Space";
import { useAppStore } from "@hooks/useStores";
import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { ChannelSettingsSidebar } from "@components/ChannelSettings/ChannelSettingsSidebar.";
import { ChannelSettingsContent } from "@components/ChannelSettings/ChannelSettingsContent";

interface ChannelSettingsModalProps {
  space: Space;
  channel: Channel;
  redirectTo?: ChannelSettingsPage;
}

export const ChannelSettingsModal = observer(
  ({ space, channel, redirectTo }: ChannelSettingsModalProps) => {
    const app = useAppStore();
    return (
      <ChannelSettingsProvider>
        <AnimatedPaper
          surfaceRole="modal"
          width="60vw"
          height="75vh"
          borderRadius="1.5rem"
          overflow="auto"
          justifyContent="center"
          alignItems="center"
          elevation={app.settings?.preferEmbossed ? 3 : 1}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <ChannelSettingsSidebar space={space} channel={channel} />
          <ChannelSettingsContent
            space={space}
            channel={channel}
            redirectTo={redirectTo}
          />
        </AnimatedPaper>
      </ChannelSettingsProvider>
    );
  }
);
