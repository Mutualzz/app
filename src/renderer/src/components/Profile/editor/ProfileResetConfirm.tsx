import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  EMPTY_PROFILE_SAVE_PAYLOAD,
  getApiErrorMessage
} from "@components/Profile/editor/profileEditor.utils";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  onSuccess: () => void;
}

export const ProfileResetConfirm = observer(({ onSuccess }: Props) => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { closeModal } = useModal();

  const { mutate: resetProfile, isPending } = useMutation({
    mutationKey: ["reset-profile", app.account?.id],
    mutationFn: () =>
      app.profiles.save({
        ...EMPTY_PROFILE_SAVE_PAYLOAD,
        mobileBlocks:
          (app.account?.id
            ? app.profiles.get(app.account.id)?.mobileBlocks
            : undefined) ?? []
      }),
    onSuccess: (result) => {
      if (result) onSuccess();
      closeModal();
      toast.success(t("profile.editor.resetSuccess"));
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, t("profile.editor.failedResetProfile"))
      )
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
      maxWidth={420}
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        {t("profile.editor.resetTitle")}
      </Typography>
      <Typography mb={2.5} css={{ opacity: 0.85 }}>
        {t("profile.editor.resetDescription")}
      </Typography>
      <Stack spacing={1.25}>
        <Button color="neutral" size="lg" onClick={() => closeModal()}>
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          size="lg"
          loading={isPending}
          onClick={() => resetProfile()}
        >
          {t("profile.editor.resetToEmpty")}
        </Button>
      </Stack>
    </Paper>
  );
});
