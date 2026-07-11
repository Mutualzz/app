import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  isSelf?: boolean;
}

export const ProfileEmptyState = observer(({ isSelf }: Props) => {
  const { t } = useTranslation("settings");
  const navigate = useNavigate();

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
        <Typography level="title-md" textAlign="center">
          {isSelf
            ? t("profile.viewer.emptySelfTitle")
            : t("profile.viewer.emptyOtherTitle")}
        </Typography>
        <Typography level="body-sm" textAlign="center" css={{ opacity: 0.75 }}>
          {isSelf
            ? t("profile.viewer.emptySelfDescription")
            : t("profile.viewer.emptyOtherDescription")}
        </Typography>
        {isSelf && (
          <Button color="primary" onClick={() => navigate({ to: "/profile" })}>
            {t("profile.customizeProfile")}
          </Button>
        )}
      </Paper>
    </Stack>
  );
});
