import { type FC, useEffect } from "react";
import { useModal } from "@contexts/Modal.context";
import { Button, Paper, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { useTranslation } from "react-i18next";

interface Props {
  type: "muted" | "deafened";
}

export const SpaceModerated: FC<Props> = ({ type }) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("chat");

  useEffect(() => {
    if (type !== "muted" && type !== "deafened") closeModal();
  }, []);

  if (type !== "muted" && type !== "deafened") return null;

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      px={8}
      py={4}
      borderRadius={12}
      direction="column"
      spacing={2.5}
    >
      <Typography level="h5" fontWeight="bold">
        {type === "muted"
          ? t("voice.spaceModerated.mutedTitle")
          : t("voice.spaceModerated.deafenedTitle")}
      </Typography>
      <Typography>
        {type === "muted"
          ? t("voice.spaceModerated.mutedBody")
          : t("voice.spaceModerated.deafenedBody")}
      </Typography>
      <Button onClick={() => closeModal()}>
        {t("voice.spaceModerated.dismiss")}
      </Button>
    </Paper>
  );
};
