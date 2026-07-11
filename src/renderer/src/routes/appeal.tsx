import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { Button } from "@components/Button";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@hooks/useStores";
import { HttpException } from "@mutualzz/types";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/appeal")({
  component: RouteComponent,
  validateSearch: (search) => ({
    token: search.token as string | undefined
  })
});

function RouteComponent() {
  const { t } = useTranslation("auth");
  const app = useAppStore();
  const { token } = Route.useSearch();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const {
    mutate: submitAppeal,
    isPending,
    isSuccess
  } = useMutation({
    mutationKey: ["submit-appeal", token],
    mutationFn: () =>
      app.rest.post("/appeals", {
        token,
        message: message.trim()
      }),
    onError: (err: HttpException) => {
      setError(err.message);
    }
  });

  if (!token) return <Navigate to="/login" replace />;

  return (
    <Stack
      direction="column"
      width="100%"
      minHeight="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Paper
        direction="column"
        alignItems="center"
        width={{
          xs: "100%",
          sm: "90%",
          md: "70%",
          lg: "50%",
          xl: "40%"
        }}
        maxWidth={{
          xs: "100%",
          sm: "500px",
          md: "400px",
          lg: "500px"
        }}
        py={{ xs: "1.5rem", sm: "2rem", md: "2rem" }}
        px={{ xs: "1rem", sm: "2rem", md: "2.5rem" }}
        borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        boxShadow={{ xs: 2, sm: 5, md: 8 }}
      >
        <Stack direction="column" spacing={2.5} width="100%">
          <Typography
            level={{ xs: "h5", sm: "h4", md: "h3" }}
            fontSize={{
              xs: "1.25rem",
              sm: "1.5rem",
              md: "1.75rem"
            }}
            textAlign="center"
          >
            {t("appeal.title")}
          </Typography>

          {isSuccess ? (
            <Typography textAlign="center" textColor="secondary">
              {t("appeal.success")}
            </Typography>
          ) : (
            <>
              <Typography textColor="secondary">
                {t("appeal.description")}
              </Typography>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("appeal.placeholder")}
                rows={5}
              />
              {error && (
                <Typography color="danger" level="body-sm">
                  {error}
                </Typography>
              )}
              <Button
                size="lg"
                onClick={() => submitAppeal()}
                disabled={isPending || !message.trim()}
                fullWidth
              >
                {t("actions.submitAppeal")}
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
