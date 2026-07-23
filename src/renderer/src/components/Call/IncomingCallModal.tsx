import { CallRingingAvatar } from "@components/Call/CallRingingAvatar";
import { INCOMING_CALL_MODAL_ID } from "@components/Call/incomingCallIds";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { dynamicElevation } from "@mutualzz/ui-core";
import { IconButton } from "@components/IconButton";
import {
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { PhoneIcon, PhoneSlashIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  channelId: string;
}

export const IncomingCallModal = observer(({ channelId }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const { closeModal } = useModal();
  const navigate = useNavigate();

  const call = app.calls.getCall(channelId);
  const initiator = call
    ? app.users.get(String(call.initiatorId))
    : null;

  const decline = () => {
    closeModal(INCOMING_CALL_MODAL_ID);
    void app.calls.decline(channelId);
  };

  const accept = () => {
    closeModal(INCOMING_CALL_MODAL_ID);
    void navigate({
      to: "/@me/$channelId",
      params: { channelId }
    });
    void app.calls.accept(channelId);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 6 : 3}
      direction="column"
      alignItems="center"
      spacing={2.5}
      px={5}
      pt={4}
      pb={4}
      borderRadius={16}
      css={{
        width: 340,
        background: dynamicElevation(
          theme.colors.surface,
          app.settings?.preferEmbossed ? 5 : 3
        )
      }}
    >
      <CallRingingAvatar user={initiator} size={112} pulsing dimmed />
      <Stack direction="column" alignItems="center" spacing={0.5}>
        <Typography
          level="title-lg"
          textColor="primary"
          fontWeight={700}
          css={{ textAlign: "center" }}
        >
          {initiator?.displayName ?? t("deletedUser")}
        </Typography>
        <Typography level="body-md" textColor="secondary">
          {t("call.incoming")}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
        spacing={5}
        pt={1}
      >
        <Stack direction="column" alignItems="center" spacing={1}>
          <IconButton
            color="danger"
            variant="solid"
            onClick={decline}
            css={{
              width: 56,
              height: 56,
              borderRadius: 999
            }}
          >
            <PhoneSlashIcon size={26} weight="fill" />
          </IconButton>
          <Typography level="label-sm" textColor="secondary">
            {t("call.decline")}
          </Typography>
        </Stack>
        <Stack direction="column" alignItems="center" spacing={1}>
          <IconButton
            color="success"
            variant="solid"
            onClick={accept}
            css={{
              width: 56,
              height: 56,
              borderRadius: 999
            }}
          >
            <PhoneIcon size={26} weight="fill" />
          </IconButton>
          <Typography level="label-sm" textColor="secondary">
            {t("call.accept")}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
});
