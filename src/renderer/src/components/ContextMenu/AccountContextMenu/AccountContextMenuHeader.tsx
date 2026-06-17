import { CustomStatusCard } from "@components/CustomStatus/CustomStatusCard";
import {
  CUSTOM_STATUS_MODAL_ID,
  CustomStatusModal
} from "@components/Modals/CustomStatusModal";
import type { AccountStore } from "@stores/Account.store";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { formatColor } from "@mutualzz/ui-core";
import { observer } from "mobx-react-lite";

interface Props {
  account: AccountStore;
}

export const AccountContextMenuHeader = observer(({ account }: Props) => {
  const app = useAppStore();
  const { clearMenu } = useMenu();
  const { openModal } = useModal();
  const { theme } = useTheme();

  const customText = app.customStatus.effectiveText;
  const customEmoji = app.customStatus.effectiveEmoji;

  return (
    <Stack
      direction="column"
      px={0.5}
      pt={0.25}
      pb={1}
      css={{
        borderBottom: `1px solid ${formatColor(theme.typography.colors.muted, {
          alpha: 0.35
        })}`,
        marginBottom: theme.spacing(0.5)
      }}
    >
      <CustomStatusCard
        account={account}
        text={customText}
        emoji={customEmoji}
        size="compact"
        interactive
        onEdit={() => {
          clearMenu();
          openModal(CUSTOM_STATUS_MODAL_ID, <CustomStatusModal />);
        }}
        onClear={() => {
          app.gateway.clearScheduledCustomStatus();
          app.gateway.clearCustomStatus();
        }}
      />
    </Stack>
  );
});
