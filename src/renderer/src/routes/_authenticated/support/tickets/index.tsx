import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { SupportHeader } from "@components/Support/SupportHeader";
import { useAppStore } from "@hooks/useStores";
import type {
  APISupportTicket,
  APISupportTicketDetail,
  SupportTicketCategory
} from "@mutualzz/types";
import {
  Input,
  Option,
  Select,
  Stack,
  Textarea,
  Typography
} from "@mutualzz/ui-web";
import { LifebuoyIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

const searchSchema = z.object({
  new: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === true || val === "true";
    })
});

export const Route = createFileRoute("/_authenticated/support/tickets/")({
  validateSearch: searchSchema,
  component: SupportTicketsRoute
});

const PAGE_LIMIT = 50;

const categoryOptions: { value: SupportTicketCategory; label: string }[] = [
  { value: "account", label: "Account & login" },
  { value: "bug", label: "Bug or crash" },
  { value: "donations", label: "Donations" },
  { value: "feature", label: "Feature request" },
  { value: "other", label: "Other" }
];

const statusColors: Record<string, "warning" | "success" | "neutral" | "info"> =
  {
    open: "warning",
    awaiting_reply: "info",
    resolved: "success",
    closed: "neutral"
  };

function SupportTicketsRoute() {
  const app = useAppStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const embossed = app.settings?.preferEmbossed;
  const { new: showNew } = Route.useSearch();

  const [category, setCategory] = useState<SupportTicketCategory>("account");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const queryKey = ["support-tickets"];

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        app.rest.get<APISupportTicket[]>("/support", {
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

  const { mutate: createTicket, isPending: creating } = useMutation({
    mutationKey: ["support-create-ticket"],
    mutationFn: () =>
      app.rest.post<APISupportTicketDetail>("/support", {
        category,
        subject: subject.trim(),
        message: message.trim(),
        platform: "web"
      }),
    onSuccess: (ticket) => {
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey });
      navigate({
        to: "/support/tickets/$ticketId",
        params: { ticketId: ticket.id }
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    }
  });

  return (
    <Stack flex={1} height="100%" overflow="hidden" width="100%" direction="column">
      <SupportHeader
        title="Support tickets"
        icon={<LifebuoyIcon size={22} weight="fill" />}
        onBack={() => navigate({ to: "/support" })}
        backLabel="Help"
      />

      <Paper
        flex={1}
        overflow="auto"
        width="100%"
        spacing={1.5}
        direction="column"
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 3 }}
        elevation={embossed ? 2 : 0}
        borderTop="0 !important"
        borderLeft="0 !important"
        alignItems="center"
      >
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={640}>
          {(showNew || tickets.length === 0) && (
            <Paper
              variant="soft"
              borderRadius={12}
              p={2}
              direction="column"
              spacing={1.25}
              elevation={embossed ? 2 : 0}
              boxShadow="none !important"
            >
              <Typography level="title-sm" fontWeight={600}>
                Contact support
              </Typography>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as SupportTicketCategory)}
              >
                {categoryOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue"
                rows={5}
              />
              <Button
                disabled={creating || !subject.trim() || !message.trim()}
                onClick={() => createTicket()}
                css={{ alignSelf: "flex-start" }}
              >
                {creating ? "Submitting..." : "Submit ticket"}
              </Button>
            </Paper>
          )}

          {!showNew && tickets.length > 0 && (
            <Button
              variant="soft"
              css={{ alignSelf: "flex-start" }}
              onClick={() =>
                navigate({ to: "/support/tickets", search: { new: true } })
              }
            >
              New ticket
            </Button>
          )}

          {isFetching && !isFetchingNextPage && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              Loading tickets...
            </Typography>
          )}

          {!isFetching && tickets.length === 0 && !showNew && (
            <Typography level="body-sm" textColor="muted" textAlign="center">
              No tickets yet
            </Typography>
          )}

          {tickets.map((ticket) => (
            <Paper
              key={ticket.id}
              variant="elevation"
              elevation={embossed ? 2 : 0}
              borderRadius={12}
              p={1.5}
              direction="column"
              spacing={0.75}
              css={{ cursor: "pointer" }}
              onClick={() =>
                navigate({
                  to: "/support/tickets/$ticketId",
                  params: { ticketId: ticket.id }
                })
              }
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={600}>{ticket.subject}</Typography>
                <Typography
                  level="body-xs"
                  color={statusColors[ticket.status] ?? "neutral"}
                  fontWeight={700}
                >
                  {ticket.status.replace("_", " ").toUpperCase()}
                </Typography>
              </Stack>
              <Typography level="body-sm" textColor="muted">
                {ticket.category} · updated{" "}
                {dayjs(ticket.lastMessageAt).format("MMM D, h:mm A")}
              </Typography>
            </Paper>
          ))}

          {hasNextPage && (
            <Button
              color="neutral"
              variant="soft"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              css={{ alignSelf: "center" }}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
