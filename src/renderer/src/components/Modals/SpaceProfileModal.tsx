import { Paper } from "@components/Paper";
import { SpaceProfileEditor } from "@components/Space/SpaceProfileEditor";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const SpaceProfileModal = observer(({ space }: { space: Space }) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      spacing={2.5}
      width={460}
      maxWidth="100%"
    >
      <Stack direction="column" spacing={0.5}>
        <Typography level="h5" fontWeight="bold">
          {t("spaceProfile.title", { space: space.name })}
        </Typography>
        <Typography level="body-sm" textColor="secondary">
          {t("spaceProfile.description")}
        </Typography>
      </Stack>
      <SpaceProfileEditor space={space} onSaved={() => closeModal()} />
    </Paper>
  );
});
