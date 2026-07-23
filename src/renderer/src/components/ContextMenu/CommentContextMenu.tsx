import { ContextMenu } from "@components/ContextMenu";
import { ContextItem } from "@components/ContextItem";
import { ReportContentModal } from "@components/Modals/ReportContentModal";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Divider } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import type { PostComment } from "@stores/objects/PostComment";
import { getCommentPlainText } from "@utils/postComments";
import { isElectron } from "@utils/index";
import {
  ArrowBendUpLeftIcon,
  CopyIcon,
  FlagIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

interface Props {
  post: Post;
  comment: PostComment;
  onReply: (comment: PostComment) => void;
}

export const CommentContextMenu = observer(
  ({ post, comment, onReply }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const { clearMenu } = useMenu();
    const { openModal } = useModal();

    const canDelete =
      comment.authorId === app.account?.id || post.authorId === app.account?.id;
    const canReport = comment.authorId !== app.account?.id;
    const plainText = getCommentPlainText(comment);

    const copyText = () => {
      if (!plainText) return;
      if (isElectron) window.api.clipboard.write(plainText);
      else navigator.clipboard.writeText(plainText);
    };

    return (
      <ContextMenu
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        id={generateMenuIDs.comment(post.id, comment.id)}
        key={comment.id}
      >
        <ContextItem
          endDecorator={<ArrowBendUpLeftIcon weight="fill" />}
          onClick={() => {
            onReply(comment);
            clearMenu();
          }}
        >
          {t("feed.comments.reply")}
        </ContextItem>

        {plainText && (
          <>
            <Divider orientation="horizontal" css={{ opacity: 0.5 }} />
            <ContextItem
              endDecorator={<CopyIcon weight="fill" />}
              onClick={() => {
                copyText();
                clearMenu();
              }}
            >
              {t("actions.copyText")}
            </ContextItem>
          </>
        )}

        {(canDelete || canReport) && (
          <Divider orientation="horizontal" css={{ opacity: 0.5 }} />
        )}

        {canDelete && (
          <ContextItem
            color="danger"
            onClick={() => {
              comment.delete().catch(() => {});
              clearMenu();
            }}
            endDecorator={<TrashIcon weight="fill" />}
          >
            {t("feed.actions.deleteComment")}
          </ContextItem>
        )}

        {canReport && (
          <ContextItem
            color="danger"
            onClick={() => {
              openModal(
                `report-comment-${comment.id}`,
                <ReportContentModal
                  targetType="comment"
                  targetId={comment.id}
                  contentLabel={t("feed.report.thisComment")}
                  modalId={`report-comment-${comment.id}`}
                />
              );
              clearMenu();
            }}
            endDecorator={<FlagIcon weight="fill" />}
          >
            {t("feed.actions.reportComment")}
          </ContextItem>
        )}
      </ContextMenu>
    );
  }
);
