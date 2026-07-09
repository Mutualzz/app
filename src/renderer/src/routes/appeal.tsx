import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Paper } from "@components/Paper";
import { Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { Button } from "@components/Button";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@hooks/useStores";
import { HttpException } from "@mutualzz/types";

export const Route = createFileRoute("/appeal")({
  component: RouteComponent,
  validateSearch: (search) => ({
    token: search.token as string | undefined
  })
});

function RouteComponent() {
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
            Submit an Appeal
          </Typography>

          {isSuccess ? (
            <Typography textAlign="center" textColor="secondary">
              Your appeal has been submitted. Our staff team will review it and
              follow up by email.
            </Typography>
          ) : (
            <>
              <Typography textColor="secondary">
                Explain why you believe this decision should be reconsidered. A
                staff member will review your appeal.
              </Typography>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us why this decision should be reconsidered"
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
                Submit Appeal
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
