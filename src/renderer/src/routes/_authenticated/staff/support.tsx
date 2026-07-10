import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type {
  APISupportTicket,
  APISupportTicketDetail,
  SupportTicketStatus
} from "@mutualzz/types";
import { Option, Select, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { LifebuoyIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/support")({
  component: StaffSupportRoute
});

const PAGE_LIMIT = 50;
const ANY = "any";

const statusOptions = [
  { value: ANY, label: "Any status" },
  { value: "open", label: "Open" },
  { value: "awaiting_reply", label: "Awaiting reply" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];

const statusColors: Record<string, "warning" | "success" | "neutral" | "info"> =
  {
    open: "warning",
    awaiting_reply: "info",
    resolved: "success",
    closed: "neutral"
  };

function StaffSupportRoute() {
  const app = useAppStore();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;

  const [status, setStatus] = useState<string>("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const effectiveStatus = status === ANY ? undefined : status;
  const listQueryKey = ["staff-support", effectiveStatus];

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: listQueryKey,
      queryFn: ({ pageParam }) =>
        app.rest.get<APISupportTicket[]>("/staff/support", {
          ...(effectiveStatus ? { status: effectiveStatus } : {}),
          ...(pageParam ? { before: pageParam } : {}),
          limit: PAGE_LIMIT
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].id
          : undefined
    });

  const tickets = data?.pages.flat() ?? [];
  const activeId = selectedId ?? tickets[0]?.id ?? null;

  const { data: activeTicket, isLoading: loadingTicket } = useQuery({
    queryKey: ["staff-support-ticket", activeId],
    queryFn: () =>
      app.rest.get<APISupportTicketDetail>(`/staff/support/${activeId}`),
    enabled: !!activeId
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationKey: ["staff-support-reply", activeId],
    mutationFn: () =>
      app.rest.post<APISupportTicketDetail>(
        `/staff/support/${activeId}/messages`,
        { message: reply.trim() }
      ),
    onSuccess: (updated) => {
      setReply("");
      queryClient.setQueryData(["staff-support-ticket", activeId], updated);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    }
  });

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationKey: ["staff-support-status", activeId],
    mutationFn: (newStatus: SupportTicketStatus) =>
      app.rest.patch<APISupportTicketDetail>(`/staff/support/${activeId}`, {
        status: newStatus
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["staff-support-ticket", activeId], updated);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update ticket"
      );
    }
  });

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="hidden"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title="Support"
        icon={<LifebuoyIcon size={22} weight="fill" />}
        trailing={
          <Stack direction="row" spacing={1.25}>
            <Select value={status} onValueChange={(v) => setStatus(String(v))}>
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Stack>
        }
      />

      <Stack flex={1} direction="row" overflow="hidden" width="100%">
        <Paper
          width={360}
          overflow="auto"
          spacing={0.75}
          direction="column"
          px={1.5}
          py={1.5}
          elevation={embossed ? 2 : 0}
          borderTop="0 !important"
          borderLeft="0 !important"
        >
          {isFetching && !isFetchingNextPage && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              Loading...
            </Typography>
          )}

          {!isFetching && tickets.length === 0 && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              No tickets found
            </Typography>
          )}

          {tickets.map((ticket) => (
            <Paper
              key={ticket.id}
              variant={ticket.id === activeId ? "soft" : "elevation"}
              color={ticket.id === activeId ? "primary" : "neutral"}
              borderRadius={10}
              p={1.25}
              direction="column"
              spacing={0.5}
              css={{ cursor: "pointer" }}
              onClick={() => setSelectedId(ticket.id)}
            >
              <Typography fontWeight={600}>{ticket.subject}</Typography>
              <Typography level="body-xs" textColor="muted">
                @{ticket.user.username} · {ticket.category}
              </Typography>
              <Typography
                level="body-xs"
                color={statusColors[ticket.status] ?? "neutral"}
                fontWeight={700}
              >
                {ticket.status.replace("_", " ").toUpperCase()}
              </Typography>
            </Paper>
          ))}

          {hasNextPage && (
            <Button
              size="sm"
              variant="soft"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          )}
        </Paper>

        <Paper
          flex={1}
          overflow="auto"
          spacing={1}
          direction="column"
          px={{ xs: 1.5, sm: 3 }}
          py={1.5}
          elevation={embossed ? 2 : 0}
          borderTop="0 !important"
          borderLeft="0 !important"
        >
          {!activeId && (
            <Typography level="body-sm" textColor="muted">
              Select a ticket
            </Typography>
          )}

          {activeId && loadingTicket && (
            <Typography level="body-sm" textColor="muted">
              Loading ticket...
            </Typography>
          )}

          {activeTicket && (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="column" spacing={0.25}>
                  <Typography level="title-sm" fontWeight={700}>
                    {activeTicket.subject}
                  </Typography>
                  <Typography level="body-xs" textColor="muted">
                    @{activeTicket.user.username}
                    {activeTicket.platform ? ` · ${activeTicket.platform}` : ""}
                    {activeTicket.appVersion
                      ? ` v${activeTicket.appVersion}`
                      : ""}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75}>
                  <Button
                    size="sm"
                    variant="soft"
                    disabled={updating}
                    onClick={() => updateStatus("resolved")}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    disabled={updating}
                    onClick={() => updateStatus("closed")}
                  >
                    Close
                  </Button>
                </Stack>
              </Stack>

              {activeTicket.messages.map((message) => (
                <Paper
                  key={message.id}
                  variant={message.isStaff ? "soft" : "outlined"}
                  color={message.isStaff ? "primary" : "neutral"}
                  borderRadius={12}
                  p={1.25}
                  direction="column"
                  spacing={0.5}
                >
                  <Typography level="body-xs" textColor="muted">
                    {message.isStaff
                      ? "Staff"
                      : message.author.globalName ||
                        message.author.username}{" "}
                    · {dayjs(message.createdAt).format("MMM D, h:mm A")}
                  </Typography>
                  <Typography css={{ whiteSpace: "pre-wrap" }}>
                    {message.body}
                  </Typography>
                </Paper>
              ))}

              {activeTicket.status !== "closed" &&
                activeTicket.status !== "resolved" && (
                  <Stack direction="column" spacing={1}>
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Reply to user"
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
            </>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
}
