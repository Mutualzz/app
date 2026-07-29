import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { MessageAttachment } from "@components/Message/MessageAttachment";
import { MessageEmbed } from "@components/Message/MessageEmbed";
import { CodedLinkPreview } from "@components/Space/CodedLinkPreview";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage } from "@mutualzz/types";
import { ExpressionType } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { styled } from "@mutualzz/ui-core";
import { Expression } from "@stores/objects/Expression";
import { shouldHideInviteUrlContent } from "@mutualzz/client";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const MessageBody = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "preview",
})<{ preview?: boolean }>(({ preview }) => ({
  minWidth: 0,
  maxWidth: "100%",
  overflow: "hidden",
  wordBreak: "break-word",

  "& img, & video, & iframe": {
    maxWidth: "100%",
  },

  ...(preview ? { pointerEvents: "none" } : null),
}));

const AttachmentWrap = styled(Stack)({
  maxWidth: "100%",
  "& > *": {
    maxWidth: "100%",
  },
});

interface Props {
  message: APIMessage;
  emptyLabel?: string;
  preview?: boolean;
}

export const MessagePreviewContent = observer(({ message, emptyLabel, preview }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const showLinkEmbeds = app.settings?.showLinkEmbeds ?? true;
  const stickers =
    message.expressions?.filter((item) => item.type === ExpressionType.Sticker) ??
    [];

  const hideInviteUrl = shouldHideInviteUrlContent(
    message.content ?? "",
    message.codedLinks?.length ?? 0,
  );

  const hasContent =
    (message.content && !hideInviteUrl) ||
    stickers.length > 0 ||
    (message.attachments?.length ?? 0) > 0 ||
    (showLinkEmbeds && (message.embeds?.length ?? 0) > 0) ||
    (message.codedLinks?.length ?? 0) > 0;

  return (
    <MessageBody direction="column" spacing={0.75} preview={preview}>
      {stickers.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {stickers.map((sticker) => (
            <img
              key={sticker.id}
              src={Expression.constructUrl(
                sticker.id,
                sticker.animated,
                sticker.assetHash,
                128,
              )}
              alt={sticker.name}
              draggable={false}
              css={{
                width: 160,
                height: 160,
                objectFit: "contain",
              }}
            />
          ))}
        </Stack>
      ) : null}

      {message.content && !hideInviteUrl ? (
        <MarkdownRenderer value={message.content} />
      ) : null}

      {message.attachments && message.attachments.length > 0 ? (
        <AttachmentWrap direction="column" spacing={1}>
          {message.attachments.map((attachment) => (
            <MessageAttachment key={attachment.id} attachment={attachment} />
          ))}
        </AttachmentWrap>
      ) : null}

      {showLinkEmbeds && message.embeds && message.embeds.length > 0 ? (
        <Stack spacing={0.75} maxWidth="100%">
          {message.embeds.map((embed, index) => (
            <MessageEmbed key={index} embed={embed} compact />
          ))}
        </Stack>
      ) : null}

      {message.codedLinks && message.codedLinks.length > 0 ? (
        <Stack spacing={0.75}>
          {message.codedLinks.map((link) => (
            <CodedLinkPreview key={link.code} link={link} />
          ))}
        </Stack>
      ) : null}

      {!hasContent ? (
        <Typography level="body-sm" textColor="muted">
          {emptyLabel ?? t("search.noText")}
        </Typography>
      ) : null}
    </MessageBody>
  );
});
