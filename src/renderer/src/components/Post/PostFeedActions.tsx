import { IconButton } from "@components/IconButton";
import { SharePostModal } from "@components/Post/SharePostModal";
import { useModal } from "@contexts/Modal.context";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { Post } from "@stores/objects/Post";
import {
  BookmarkSimpleIcon,
  ChatCircleIcon,
  HeartIcon,
  RepeatIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

const Action = ({
  icon,
  count,
  onClick
}: {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
}) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <IconButton size="sm" variant="plain" onClick={onClick}>
      {icon}
    </IconButton>
    {count != null && <Typography level="body-sm">{count}</Typography>}
  </Stack>
);

export const PostFeedActions = observer(
  ({
    post,
    commentsActive,
    onOpenComments
  }: {
    post: Post;
    commentsActive?: boolean;
    onOpenComments?: () => void;
  }) => {
    const { openModal } = useModal();

    return (
      <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
        <Action
          icon={<HeartIcon weight={post.liked ? "fill" : "regular"} />}
          count={post.likeCount}
          onClick={() => {
            post.toggleLike().catch(() => {});
          }}
        />
        <Action
          icon={
            <ChatCircleIcon weight={commentsActive ? "fill" : "regular"} />
          }
          count={post.commentCount}
          onClick={onOpenComments}
        />
        <Action
          icon={<RepeatIcon weight={post.shared ? "fill" : "regular"} />}
          count={post.shareCount}
          onClick={() =>
            openModal(`share-post-${post.id}`, <SharePostModal post={post} />)
          }
        />
        <Action
          icon={
            <BookmarkSimpleIcon weight={post.saved ? "fill" : "regular"} />
          }
          onClick={() => {
            post.toggleSave().catch(() => {});
          }}
        />
      </Stack>
    );
  }
);
