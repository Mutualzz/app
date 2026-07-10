import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { SupportHeader } from "@components/Support/SupportHeader";
import { useAppStore } from "@hooks/useStores";
import type { APISupportTicketDetail } from "@mutualzz/types";
import { Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute(
  "/_authenticated/support/tickets/$ticketId"
)({
  component: SupportTicketDetailRoute
});

function SupportTicketDetailRoute() {
  const { ticketId } = Route.useParams();
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;
  const [reply, setReply] = useState("");

  const queryKey = ["support-ticket", ticketId];

  const { data: ticket, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      app.rest.get<APISupportTicketDetail>(`/support/${ticketId}`)
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationKey: ["support-reply", ticketId],
    mutationFn: () =>
      app.rest.post<APISupportTicketDetail>(`/support/${ticketId}/messages`, {
        message: reply.trim()
      }),
    onSuccess: (updated) => {
      setReply("");
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    }
  });

  const isClosed =
    ticket?.status === "closed" || ticket?.status === "resolved";

  return (
    <Stack flex={1} height="100%" overflow="hidden" width="100%" direction="column">
      <SupportHeader
        title={ticket?.subject ?? "Support ticket"}
        onBack={() => navigate({ to: "/support/tickets" })}
        backLabel="Tickets"
      />

      <Paper
        flex={1}
        overflow="auto"
        width="100%"
        spacing={1}
        direction="column"
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 3 }}
        elevation={embossed ? 2 : 0}
        borderTop="0 !important"
        borderLeft="0 !important"
        alignItems="center"
      >
        {ticket && (
          <Typography level="body-xs" textColor="muted" width="100%" maxWidth={640}>
            {ticket.category} · {ticket.status.replace("_", " ")}
          </Typography>
        )}

        <Stack direction="column" spacing={1} width="100%" maxWidth={640}>
          {isLoading && (
            <Typography level="body-sm" textColor="muted">
              Loading...
            </Typography>
          )}

          {ticket?.messages.map((message) => (
            <Paper
              key={message.id}
              variant={message.isStaff ? "soft" : "outlined"}
              color={message.isStaff ? "primary" : "neutral"}
              borderRadius={12}
              p={1.5}
              direction="column"
              spacing={0.5}
              alignSelf={message.isStaff ? "flex-start" : "flex-end"}
              width="100%"
            >
              <Typography level="body-xs" textColor="muted">
                {message.isStaff
                  ? "Support"
                  : message.author.globalName || message.author.username}{" "}
                · {dayjs(message.createdAt).format("MMM D, h:mm A")}
              </Typography>
              <Typography css={{ whiteSpace: "pre-wrap" }}>
                {message.body}
              </Typography>
            </Paper>
          ))}

          {!isClosed && ticket && (
            <Stack direction="column" spacing={1} mt={1}>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply"
                rows={4}
              />
              <Button
                disabled={sending || !reply.trim()}
                onClick={() => sendReply()}
                css={{ alignSelf: "flex-start" }}
              >
                {sending ? "Sending..." : "Send reply"}
              </Button>
            </Stack>
          )}

          {isClosed && (
            <Typography level="body-sm" textColor="muted">
              This ticket is closed. Open a new ticket if you still need help.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
