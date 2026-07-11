import { observer } from "mobx-react-lite";
import type { Channel } from "@stores/objects/Channel";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const ChannelActionConfirm = observer(({ channel }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");

  const { mutate: deleteChannel, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-channel", channel.id],
    mutationFn: async () => channel.delete(false),
    onSuccess: () => {
      if (app.channels.activeId === channel.id && channel.space)
        navigate({
          to: "/spaces",
          replace: true
        });

      closeModal();
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      width="25vw"
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        {t("channels.delete.title")}
      </Typography>
      <Typography mb={2.5}>
        {t("channels.delete.body", { name: channel.name })}
      </Typography>
      <Stack spacing={1.25} direction="row">
        <Button color="neutral" expand size="lg" onClick={() => closeModal()}>
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          expand
          onClick={() => deleteChannel()}
          disabled={isDeleting}
          size="lg"
        >
          {t("channels.delete.confirm")}
        </Button>
      </Stack>
    </Paper>
  );
});
