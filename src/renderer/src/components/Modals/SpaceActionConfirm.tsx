import { observer } from "mobx-react-lite";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, ButtonGroup, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";

interface Props {
  space: Space;
  action: "leave" | "delete";
}

export const SpaceActionConfirm = observer(({ space, action }: Props) => {
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const navigate = useNavigate();
  const { closeModal, closeAllModals } = useModal();

  const { mutate: deleteSpace, isPending } = useMutation({
    mutationKey: ["delete-space", space.id],
    mutationFn: async () => space.delete(),
    onSuccess: () => {
      navigate({ to: "/" });
      closeAllModals();
    }
  });

  const { mutate: leaveSpace, isPending: isLeaving } = useMutation({
    mutationKey: ["leave-space", space.id],
    mutationFn: async () => space.leave(),
    onSuccess: () => {
      navigate({ to: "/" });
      closeAllModals();
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      padding={5}
      borderRadius={12}
      direction="column"
      width="25vw"
    >
      <Typography level="h5" fontWeight="bold" marginBottom={2}>
        {action === "delete"
          ? t("confirm.deleteSpaceTitle", { name: space.name })
          : t("confirm.leaveSpaceTitle", { name: space.name })}
      </Typography>
      <Typography mb={2.5}>
        {action === "delete"
          ? t("confirm.deleteSpaceBody", { name: space.name })
          : t("confirm.leaveSpaceBody", { name: space.name })}
      </Typography>
      <ButtonGroup expand size="lg" spacing={5}>
        <Button color="neutral" onClick={() => closeModal()}>
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          onClick={() => (action === "delete" ? deleteSpace() : leaveSpace())}
          disabled={isPending || isLeaving}
        >
          {action === "delete"
            ? t("actions.deleteSpace")
            : t("actions.leaveSpace")}
        </Button>
      </ButtonGroup>
    </Paper>
  );
});
