import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/register/discord")({
  component: observer(RegisterDiscordPage),
  validateSearch: (search: Record<string, unknown>) => ({
    pending: (search.pending as string) ?? "",
  }),
});

function RegisterDiscordPage() {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const navigate = useNavigate();
  const { pending } = Route.useSearch();
  const [username, setUsername] = useState("");
  const [globalName, setGlobalName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      app.rest.post<{ token: string }>("auth/discord/complete", {
        pendingId: pending,
        username,
        globalName: globalName || undefined,
        dateOfBirth,
      }),
    onSuccess: ({ token }) => {
      app.setToken(token);
      navigate({ to: "/", replace: true });
    },
    onError: (err: HttpException) => setError(err.message),
  });

  if (!pending) {
    return (
      <Typography textAlign="center" p={4}>
        {t("discordAuth.invalidCallback")}
      </Typography>
    );
  }

  return (
    <Stack width="100%" height="100%" alignItems="center" justifyContent="center">
      <AnimatedPaper
        direction="column"
        spacing={2}
        px={4}
        py={4}
        maxWidth={480}
        width="100%"
      >
        <Typography level="h5">{t("discordAuth.completeTitle")}</Typography>
        <Typography level="body-sm" textColor="muted">
          {t("discordAuth.completeDescription")}
        </Typography>
        <Stack spacing={1.5}>
          <Stack spacing={0.75}>
            <Typography fontWeight={500} level="body-sm">
              {t("discordAuth.username")}
            </Typography>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Stack>
          <Stack spacing={0.75}>
            <Typography fontWeight={500} level="body-sm">
              {t("discordAuth.displayName")}
            </Typography>
            <Input
              value={globalName}
              onChange={(e) => setGlobalName(e.target.value)}
            />
          </Stack>
          <Stack spacing={0.75}>
            <Typography fontWeight={500} level="body-sm">
              {t("discordAuth.dateOfBirth")}
            </Typography>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </Stack>
          {error && (
            <Typography color="danger" level="body-sm">
              {error}
            </Typography>
          )}
          <Button
            disabled={isPending || !username || !dateOfBirth}
            onClick={() => mutate()}
          >
            {t("discordAuth.finishSignup")}
          </Button>
        </Stack>
      </AnimatedPaper>
    </Stack>
  );
}
