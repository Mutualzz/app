import { Button } from "@components/Button";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Paper } from "@components/Paper";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIChangelog } from "@mutualzz/types";
import { Input, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { NewspaperIcon, TrashIcon } from "@phosphor-icons/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const Route = createFileRoute("/_authenticated/staff/changelogs")({
  component: observer(StaffChangelogsRoute)
});

const PAGE_LIMIT = 25;

function StaffChangelogsRoute() {
  const app = useAppStore();
  const queryClient = useQueryClient();
  const { t } = useTranslation("staff");
  const embossed = app.settings?.preferEmbossed;
  const isDeveloper = !!app.account?.isDeveloper;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [desktopVersion, setDesktopVersion] = useState("");
  const [mobileVersion, setMobileVersion] = useState("");

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["staff-changelogs"],
      queryFn: ({ pageParam }) =>
        app.rest.get<APIChangelog[]>("/staff/changelogs", {
          ...(pageParam ? { before: pageParam } : {}),
          limit: PAGE_LIMIT
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length === PAGE_LIMIT
          ? lastPage[lastPage.length - 1].id
          : undefined,
      enabled: isDeveloper
    });

  const changelogs = data?.pages.flat() ?? [];

  const publishMutation = useMutation({
    mutationFn: () =>
      app.rest.post<APIChangelog>("/staff/changelogs", {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || null,
        desktopVersion: desktopVersion.trim() || null,
        mobileVersion: mobileVersion.trim() || null
      }),
    onSuccess: async () => {
      toast.success(t("changelogs.published"));
      setTitle("");
      setBody("");
      setImageUrl("");
      setDesktopVersion("");
      setMobileVersion("");
      await queryClient.invalidateQueries({ queryKey: ["staff-changelogs"] });
    },
    onError: () => {
      toast.error(t("changelogs.errors.publish"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => app.rest.delete(`/staff/changelogs/${id}`),
    onSuccess: async () => {
      toast.success(t("changelogs.deleted"));
      await queryClient.invalidateQueries({ queryKey: ["staff-changelogs"] });
    },
    onError: () => {
      toast.error(t("changelogs.errors.delete"));
    }
  });

  if (!isDeveloper) {
    return <Navigate to="/staff" replace />;
  }

  const canPublish =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    (!!desktopVersion.trim() || !!mobileVersion.trim()) &&
    !publishMutation.isPending;

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="auto"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title={t("pages.changelogs")}
        icon={<NewspaperIcon size={22} weight="fill" />}
      />

      <Paper
        flex={1}
        height="100%"
        overflow="auto"
        width="100%"
        spacing={2}
        alignItems="stretch"
        borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        borderBottomRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        elevation={embossed ? 2 : 0}
        direction="column"
        px={{ xs: "0.5rem", sm: 3 }}
        py={{ xs: "0.5rem", sm: 3 }}
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
      >
        <Stack direction="column" spacing={0.5} maxWidth={720}>
          <Typography level="h6">{t("changelogs.title")}</Typography>
          <Typography level="body-sm" textColor="muted">
            {t("changelogs.description")}
          </Typography>
        </Stack>

        <Stack direction="column" spacing={1.25} maxWidth={720} width="100%">
          <Input
            placeholder={t("changelogs.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <Textarea
            placeholder={t("changelogs.bodyPlaceholder")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />
          <Input
            placeholder={t("changelogs.imageUrlPlaceholder")}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Stack direction="column" spacing={0.35} flex={1}>
              <Typography level="body-xs" textColor="muted">
                {t("changelogs.desktopVersion")}
              </Typography>
              <Input
                placeholder={t("changelogs.versionPlaceholder")}
                value={desktopVersion}
                onChange={(e) => setDesktopVersion(e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack direction="column" spacing={0.35} flex={1}>
              <Typography level="body-xs" textColor="muted">
                {t("changelogs.mobileVersion")}
              </Typography>
              <Input
                placeholder={t("changelogs.versionPlaceholder")}
                value={mobileVersion}
                onChange={(e) => setMobileVersion(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
          <Button
            variant="solid"
            color="primary"
            disabled={!canPublish}
            onClick={() => {
              if (!desktopVersion.trim() && !mobileVersion.trim()) {
                toast.error(t("changelogs.errors.versionRequired"));
                return;
              }
              publishMutation.mutate();
            }}
          >
            {publishMutation.isPending
              ? t("changelogs.publishing")
              : t("changelogs.publish")}
          </Button>
        </Stack>

        <Stack direction="column" spacing={1} maxWidth={720} width="100%" mt={1}>
          {changelogs.length === 0 && !isFetching ? (
            <Typography textColor="muted">{t("changelogs.empty")}</Typography>
          ) : null}

          {changelogs.map((entry) => (
            <Paper
              key={entry.id}
              p={1.5}
              variant="soft"
              borderRadius={10}
              direction="column"
              spacing={0.75}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Stack direction="column" spacing={0.25} minWidth={0}>
                  <Typography fontWeight={600}>{entry.title}</Typography>
                  <Typography level="body-xs" textColor="muted">
                    {dayjs(entry.publishedAt).format("MMM D, YYYY h:mm A")}
                    {entry.desktopVersion
                      ? ` · ${t("changelogs.desktop", { version: entry.desktopVersion })}`
                      : ""}
                    {entry.mobileVersion
                      ? ` · ${t("changelogs.mobile", { version: entry.mobileVersion })}`
                      : ""}
                  </Typography>
                </Stack>
                <Button
                  size="sm"
                  variant="soft"
                  color="danger"
                  startDecorator={<TrashIcon />}
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  {t("changelogs.delete")}
                </Button>
              </Stack>
              <MarkdownRenderer value={entry.body} />
            </Paper>
          ))}

          {hasNextPage ? (
            <Button
              variant="soft"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? t("working") : t("home.loadMore")}
            </Button>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
