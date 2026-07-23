export {
  buildCommentThreads,
  COMMENTS_PAGE_SIZE,
  getCommentPlainText,
  getOldestCommentId,
  REPLY_PREVIEW_COUNT,
  type CommentLike,
  type CommentSort,
  type CommentThread,
} from "@mutualzz/client";
import { ExpressionType } from "@mutualzz/types";
import type { PostComment } from "@stores/objects/PostComment";

export function isGifPrimaryComment(comment: PostComment) {
  const hasGifEmbed = comment.embeds.some((embed) => embed.type === "gifv");
  if (!hasGifEmbed) return false;

  const hasStickers = comment.expressions.some(
    (expression) => expression.type === ExpressionType.Sticker,
  );
  if (hasStickers) return false;

  const content = comment.content?.trim() ?? "";
  if (!content) return true;

  return comment.embeds.length === 1 && comment.expressions.length === 0;
}
