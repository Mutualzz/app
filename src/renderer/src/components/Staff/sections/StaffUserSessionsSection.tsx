import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffSession } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
}

export const StaffUserSessionsSection = ({ userId }: Props) => {
  const app = useAppStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation("staff");

  const sessionsQueryKey = ["staff-sessions", userId];

  const { data: sessions = [] } = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: () =>
      app.rest.get<APIStaffSession[]>(`/staff/users/${userId}/sessions`)
  });

  const { mutate: revokeSession, isPending: revokingSession } = useMutation({
    mutationKey: ["staff-revoke-session", userId],
    mutationFn: (sessionId: string) =>
      app.rest.delete(`/staff/users/${userId}/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["staff-actions", userId] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("user.sessions.errorRevoke")
      );
    }
  });

  if (sessions.length === 0) {
    return (
      <Typography level="body-sm" textColor="muted">
        {t("user.sessions.empty")}
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={0.75} maxWidth={480}>
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
          <Stack direction="column" spacing={0.1}>
            <Typography level="body-sm">
              {t("user.sessions.created", {
                relative: dayjs(session.createdAt).fromNow()
              })}
            </Typography>
            <Typography level="body-xs" textColor="muted">
              {t("user.sessions.lastUsed", {
                relative: dayjs(session.lastUsedAt).fromNow()
              })}
            </Typography>
          </Stack>
          <Button
            size="sm"
            color="danger"
            variant="soft"
            disabled={revokingSession}
            onClick={() => revokeSession(session.sessionId)}
          >
            {t("user.sessions.revoke")}
          </Button>
        </Paper>
      ))}
    </Stack>
  );
};
