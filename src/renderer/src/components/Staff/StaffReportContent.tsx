import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import type { APIReportContent, APIUser } from "@mutualzz/types";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface Props {
  content: APIReportContent;
  reportedMessageId?: string;
}

export function StaffReportContent({ content, reportedMessageId }: Props) {
  const { t } = useTranslation("staff");
  const { theme } = useTheme();

  if (content.type === "unavailable") {
    return (
      <Typography level="body-sm" textColor="muted">
        {content.message}
      </Typography>
    );
  }

  if (content.type === "message") {
    const { context, isDirectMessage } = content.data;

    return (
      <Stack direction="column" spacing={0.75}>
        <Typography level="body-xs" textColor="muted">
          {isDirectMessage
            ? t("report.content.dmContext")
            : t("report.content.messageContext")}
          {isDirectMessage && ` — ${t("report.content.dmContextHint")}`}
        </Typography>
        {context.map((message) => {
          const isReported = message.id === reportedMessageId;
          const authorName =
            message.author?.globalName ||
            message.author?.username ||
            t("report.content.unknown");

          return (
            <Paper
              key={message.id}
              variant={isReported ? "solid" : "soft"}
              borderRadius={8}
              p={1}
              boxShadow="none !important"
              direction="column"
              spacing={0.25}
              css={
                isReported
                  ? { border: `1px solid ${theme.colors.danger}` }
                  : undefined
              }
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {message.author && (
                  <UserAvatar user={message.author} size={20} />
                )}
                <Typography level="body-xs" fontWeight={600}>
                  {authorName}
                </Typography>
                <Typography level="body-xs" textColor="muted">
                  {dayjs(message.createdAt).format("MMM D, h:mm A")}
                </Typography>
                {isReported && (
                  <Typography
                    level="body-xs"
                    color="danger"
                    fontWeight={700}
                    css={{ marginLeft: "auto" }}
                  >
                    {t("report.content.reported")}
                  </Typography>
                )}
              </Stack>
              <Typography level="body-sm" css={{ whiteSpace: "pre-wrap" }}>
                {message.content?.trim() || t("report.content.noText")}
              </Typography>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  if (content.type === "post") {
    const { post } = content.data;
    const authorName =
      post.author?.globalName ||
      post.author?.username ||
      t("report.content.unknown");

    return (
      <Stack direction="column" spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {post.author && <UserAvatar user={post.author} size={24} />}
          <Typography level="body-sm" fontWeight={600}>
            {authorName}
          </Typography>
          <Typography level="body-xs" textColor="muted">
            {dayjs(post.createdAt).format("MMM D, YYYY h:mm A")}
          </Typography>
        </Stack>
        <Typography level="body-sm" css={{ whiteSpace: "pre-wrap" }}>
          {post.content?.trim() || t("report.content.noText")}
        </Typography>
      </Stack>
    );
  }

  if (content.type === "comment") {
    const { comment } = content.data;
    const authorName =
      comment.author?.globalName ||
      comment.author?.username ||
      t("report.content.unknown");

    return (
      <Stack direction="column" spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {comment.author && <UserAvatar user={comment.author} size={24} />}
          <Typography level="body-sm" fontWeight={600}>
            {authorName}
          </Typography>
          <Typography level="body-xs" textColor="muted">
            {dayjs(comment.createdAt).format("MMM D, YYYY h:mm A")}
          </Typography>
        </Stack>
        <Typography level="body-sm" css={{ whiteSpace: "pre-wrap" }}>
          {comment.content?.trim() || t("report.content.noText")}
        </Typography>
      </Stack>
    );
  }

  if (content.type === "user") {
    const { user } = content.data;

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <UserAvatar user={user as APIUser} size={36} />
        <Stack direction="column" spacing={0.1}>
          <Typography level="body-sm" fontWeight={600}>
            {user.globalName || user.username}
          </Typography>
          <Typography level="body-xs" textColor="muted">
            @{user.username}
          </Typography>
        </Stack>
      </Stack>
    );
  }

  if (content.type === "space") {
    const { space } = content.data;
    const ownerName =
      space.owner?.globalName ||
      space.owner?.username ||
      t("report.content.unknown");

    return (
      <Stack direction="column" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SpaceIcon space={space} size={40} />
          <Stack direction="column" spacing={0.1}>
            <Typography level="body-md" fontWeight={700}>
              {space.name}
            </Typography>
            <Typography level="body-xs" textColor="muted">
              {t("report.content.membersOwnedBy", {
                count: space.memberCount,
                owner: ownerName
              })}
            </Typography>
          </Stack>
        </Stack>
        {space.description && (
          <Typography level="body-sm" css={{ whiteSpace: "pre-wrap" }}>
            {space.description}
          </Typography>
        )}
      </Stack>
    );
  }

  return null;
}
