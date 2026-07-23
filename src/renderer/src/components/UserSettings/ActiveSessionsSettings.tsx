import { Button } from "@components/Button";
import { LogoutOtherSessionsConfirm } from "@components/Modals/LogoutOtherSessionsConfirm";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  fetchMeSessions,
  formatRestError,
  ME_SESSIONS_QUERY_KEY,
  revokeMeSession,
  revokeOtherMeSessions,
} from "@mutualzz/client";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const ActiveSessionsSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ME_SESSIONS_QUERY_KEY,
    queryFn: () => fetchMeSessions(app),
  });

  const { mutate: revokeSession, isPending: revokingSession } = useMutation({
    mutationFn: (sessionId: string) => revokeMeSession(app, sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_SESSIONS_QUERY_KEY });
      toast.success(t("account.sessionRevoked"));
    },
    onError: (error) => {
      toast.error(formatRestError(error, t("account.sessionRevokeError")));
    },
  });

  const { mutateAsync: revokeOthers, isPending: revokingOthers } = useMutation({
    mutationFn: () => revokeOtherMeSessions(app),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ME_SESSIONS_QUERY_KEY });
      toast.success(t("account.otherSessionsRevoked"));
    },
    onError: (error) => {
      toast.error(formatRestError(error, t("account.otherSessionsRevokeError")));
    },
  });

  const otherSessions = sessions.filter((session) => !session.current);
  const isPending = revokingSession || revokingOthers;

  const handleRevokeOthers = () => {
    openModal(
      "logout-other-sessions",
      <LogoutOtherSessionsConfirm
        onConfirm={async () => {
          await revokeOthers();
        }}
      />
    );
  };

  return (
    <>
      {isLoading ? (
        <Typography level="body-sm" textColor="muted">
          {t("account.loadingSessions")}
        </Typography>
      ) : sessions.length === 0 ? (
        <Typography level="body-sm" textColor="muted">
          {t("account.noSessions")}
        </Typography>
      ) : (
        <Stack direction="column" spacing={1.25}>
          {otherSessions.length > 0 && (
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              disabled={isPending}
              onClick={handleRevokeOthers}
              css={{ alignSelf: "flex-start" }}
            >
              {t("account.logoutOtherSessions")}
            </Button>
          )}
          {sessions.map((session) => (
            <Paper
              key={session.sessionId}
              variant="soft"
              borderRadius={10}
              p={1.5}
              boxShadow="none !important"
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              elevation={app.settings?.preferEmbossed ? 1 : 0}
            >
              <Stack direction="column" spacing={0.25} minWidth={0}>
                <Typography level="body-sm" fontWeight="bold">
                  {session.current
                    ? t("account.currentSession")
                    : t("account.otherSession")}
                </Typography>
                <Typography level="body-xs" textColor="muted">
                  {t("account.sessionLastActive", {
                    time: dayjs(session.lastUsedAt).fromNow(),
                  })}
                </Typography>
              </Stack>
              {!session.current && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  disabled={isPending}
                  onClick={() => revokeSession(session.sessionId)}
                >
                  {t("account.revokeSession")}
                </Button>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
});
