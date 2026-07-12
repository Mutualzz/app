import { MinecraftAvatar } from "@components/Minecraft/MinecraftAvatar";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  minecraftName: string;
  minecraftUuid?: string;
}

export const UnlinkMinecraftModal = observer(
  ({ minecraftName, minecraftUuid }: Props) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const { closeModal } = useModal();
    const queryClient = useQueryClient();

    const { mutate: unlink, isPending } = useMutation({
      mutationKey: ["unlink-minecraft"],
      mutationFn: () => app.rest.delete("/@me/bridges/link"),
      onSuccess: () => {
        queryClient.setQueryData(["me", "bridges", "link"], null);
        closeModal();
      },
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        justifyContent="space-between"
        spacing={1.25}
      >
        <Stack direction="column" spacing={5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MinecraftAvatar
              uuid={minecraftUuid}
              name={minecraftName}
              size={48}
            />
            <Stack direction="column" spacing={0.5} minWidth={0}>
              <Typography level="h5" fontWeight="bold">
                {t("minecraftBridge.unlinkTitle", { name: minecraftName })}
              </Typography>
              <Typography level="body-md">
                {t("minecraftBridge.unlinkConfirm", { name: minecraftName })}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
          <Button variant="plain" onClick={() => closeModal()} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button color="danger" onClick={() => unlink()} disabled={isPending}>
            {isPending
              ? t("minecraftBridge.unlinking")
              : t("minecraftBridge.unlink")}
          </Button>
        </Stack>
      </Paper>
    );
  },
);
