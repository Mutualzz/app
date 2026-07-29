import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: observer(OnboardingPage),
});

function OnboardingPage() {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const navigate = useNavigate();

  const finish = (to: string) => {
    app.completeOnboarding();
    navigate({ to, replace: true });
  };

  return (
    <Stack
      direction="column"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      spacing={3}
      px={3}
    >
      <Stack direction="column" spacing={1.5} maxWidth={480} width="100%">
        <Typography level="h4" textAlign="center">
          {t("onboarding.welcomeTitle")}
        </Typography>
        <Typography level="body-md" textColor="muted" textAlign="center">
          {t("onboarding.welcomeDescription")}
        </Typography>
      </Stack>
      <Stack direction="column" spacing={1.5} width="100%" maxWidth={360}>
        <Button onClick={() => finish("/profile")}>
          {t("onboarding.setupProfile")}
        </Button>
        <Button variant="soft" onClick={() => finish("/feed")}>
          {t("onboarding.exploreFeed")}
        </Button>
        <Button variant="plain" onClick={() => finish("/spaces")}>
          {t("onboarding.skipToSpaces")}
        </Button>
      </Stack>
    </Stack>
  );
}
