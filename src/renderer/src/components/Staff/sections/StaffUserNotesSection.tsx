import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APIStaffNote } from "@mutualzz/types";
import { Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { NotePencilIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
}

const PAGE_LIMIT = 50;

export const StaffUserNotesSection = ({ userId }: Props) => {
  const app = useAppStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation("staff");
  const [content, setContent] = useState("");

  const queryKey = ["staff-notes", userId];

  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      app.rest.get<APIStaffNote[]>(`/staff/users/${userId}/notes`, {
        ...(pageParam ? { before: pageParam } : {}),
        limit: PAGE_LIMIT
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_LIMIT
        ? lastPage[lastPage.length - 1].id
        : undefined
  });

  const notes = data?.pages.flat() ?? [];

  const { mutate: addNote, isPending: adding } = useMutation({
    mutationKey: ["staff-add-note", userId],
    mutationFn: () =>
      app.rest.post<APIStaffNote>(`/staff/users/${userId}/notes`, {
        content: content.trim()
      }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("user.notes.errorAdd")
      );
    }
  });

  return (
    <Stack direction="column" spacing={1.5} maxWidth={560}>
      <Stack direction="column" spacing={0.75}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("user.notes.placeholder")}
          rows={3}
        />
        <Button
          color="primary"
          variant="soft"
          disabled={adding || !content.trim()}
          onClick={() => addNote()}
          css={{ alignSelf: "flex-start" }}
        >
          {adding ? t("user.notes.adding") : t("user.notes.add")}
        </Button>
      </Stack>

      {!isFetching && notes.length === 0 && (
        <Typography level="body-sm" textColor="muted">
          {t("user.notes.empty")}
        </Typography>
      )}

      <Stack direction="column" spacing={0.75}>
        {notes.map((note) => (
          <Paper
            key={note.id}
            variant="soft"
            borderRadius={10}
            p={1.5}
            boxShadow="none !important"
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            elevation={app.settings?.preferEmbossed ? 1 : 0}
          >
            <NotePencilIcon
              size={16}
              css={{ marginTop: "0.2rem", flexShrink: 0, opacity: 0.6 }}
            />
            <Stack direction="column" spacing={0.1}>
              <Typography level="body-sm" css={{ whiteSpace: "pre-wrap" }}>
                {note.content}
              </Typography>
              <Typography level="body-xs" textColor="muted">
                {note.author.globalName || note.author.username}
                {" · "}
                {dayjs(note.createdAt).format("MMM D, YYYY h:mm A")}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {hasNextPage && (
        <Button
          color="neutral"
          variant="soft"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          css={{ alignSelf: "center", marginTop: "0.5rem" }}
        >
          {isFetchingNextPage ? t("home.loading") : t("home.loadMore")}
        </Button>
      )}
    </Stack>
  );
};
