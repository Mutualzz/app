import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { UserAvatar } from "@components/User/UserAvatar";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { useModal } from "@contexts/Modal.context";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import { calendarStrings } from "@mutualzz/client";
import dayjs from "dayjs";
import { FlagIcon, TrashIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useTranslation } from "react-i18next";

export const PostFeedHeader = observer(({ post }: { post: Post }) => {
  const app = useAppStore();
  const { openModal } = useModal();
  const { t } = useTranslation("chat");

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
        <UserAvatar user={post.author} size="md" badge />
        <Stack direction="column" spacing={0} minWidth={0}>
          <Typography
            fontWeight={600}
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {post.author?.displayName ?? t("unknownUser")}
          </Typography>
          <Tooltip
            content={dayjs(post.createdAt).format(
              "dddd, MMMM D, YYYY h:mm A"
            )}
          >
            <Typography level="body-sm" textColor="secondary">
              {dayjs(post.createdAt).calendar(undefined, calendarStrings)}
            </Typography>
          </Tooltip>
        </Stack>
      </Stack>

      {post.authorId === app.account?.id && (
        <Tooltip content={t("feed.actions.deletePost")}>
          <IconButton
            size="sm"
            color="danger"
            onClick={() => {
              post.delete().catch(() => {});
            }}
          >
            <TrashIcon />
          </IconButton>
        </Tooltip>
      )}

      {post.authorId !== app.account?.id && (
        <Tooltip content={t("feed.actions.reportPost")}>
          <IconButton
            size="sm"
            color="danger"
            onClick={() =>
              openModal(
                `report-post-${post.id}`,
                <ReportContentModal
                  targetType="post"
                  targetId={post.id}
                  contentLabel={t("feed.report.thisPost")}
                  modalId={`report-post-${post.id}`}
                />
              )
            }
          >
            <FlagIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
});
