import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

export const CategoryDeleteModal = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-category", channel.id],
    mutationFn: async (parentOnly: boolean) => channel.delete(parentOnly),
    onSuccess: () => {
      closeModal();
    }
  });

  return (
    <AnimatedPaper
      borderRadius={12}
      direction="column"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      justifyContent="center"
      spacing={5}
      alignItems="center"
      p="1rem"
      transparency={65}
      width="25vw"
    >
      <Stack
        width="100%"
        flex={1}
        position="relative"
        direction="column"
        alignItems="center"
        justifyContent="center"
        mt={10}
      >
        <Typography level="h6">
          {t("channels.deleteCategory.title", { name: channel.name })}
        </Typography>
      </Stack>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
        spacing={2.5}
      >
        <Stack direction="row" spacing={2.5}>
          <Button
            variant="solid"
            color="danger"
            onClick={() => deleteCategory(true)}
            disabled={isDeleting}
          >
            {t("channels.deleteCategory.categoryOnly")}
          </Button>
          <Button
            variant="soft"
            color="danger"
            onClick={() => deleteCategory(false)}
            disabled={isDeleting}
          >
            {t("channels.deleteCategory.categoryAndChannels")}
          </Button>
        </Stack>
        <Button
          variant="solid"
          fullWidth
          color="success"
          onClick={() => closeModal()}
          disabled={isDeleting}
        >
          {tCommon("cancel")}
        </Button>
      </Stack>
    </AnimatedPaper>
  );
});
