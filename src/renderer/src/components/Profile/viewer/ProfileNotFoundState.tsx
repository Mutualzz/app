import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UserCircleDashedIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

interface Props {
  onBack?: () => void;
}

export function ProfileNotFoundState({ onBack }: Props) {
  const { t } = useTranslation("settings");

  return (
    <Stack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Paper
        variant="outlined"
        borderRadius={12}
        p={4}
        maxWidth={480}
        direction="column"
        spacing={1.5}
        alignItems="center"
      >
        <UserCircleDashedIcon size={40} weight="duotone" />
        <Typography level="title-md" textAlign="center">
          {t("profile.viewer.userNotFoundTitle")}
        </Typography>
        <Typography level="body-sm" textAlign="center" css={{ opacity: 0.75 }}>
          {t("profile.viewer.userNotFoundDescription")}
        </Typography>
        {onBack ? (
          <Button color="primary" onClick={onBack}>
            {t("profile.viewer.userNotFoundAction")}
          </Button>
        ) : null}
      </Paper>
    </Stack>
  );
}
