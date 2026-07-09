import { CustomStatusCard } from "@components/CustomStatus/CustomStatusCard";
import {
  CUSTOM_STATUS_MODAL_ID,
  CustomStatusModal
} from "@components/Modals/CustomStatusModal";
import type { AccountStore } from "@stores/Account.store";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { Divider, Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

interface Props {
  account: AccountStore;
}

export const AccountContextMenuHeader = observer(({ account }: Props) => {
  const app = useAppStore();
  const { clearMenu } = useMenu();
  const { openModal } = useModal();

  const customText = app.customStatus.effectiveText;
  const customEmoji = app.customStatus.effectiveEmoji;

  return (
    <Stack direction="column" px={0.5} pt={0.25} pb={1} mb={0.5}>
      <CustomStatusCard
        account={account}
        text={customText}
        emoji={customEmoji}
        showName
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
      <Divider
        lineColor="muted"
        css={{
          opacity: 0.5,
          marginTop: 16
        }}
      />
    </Stack>
  );
});
