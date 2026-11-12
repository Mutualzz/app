import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Skeleton, Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { pickNameWidth, pickTextWidth, SkeletonGroup } from "./SkeletonGroup";

const PostHeaderSkeleton = ({ index }: { index: number }) => (
  <Stack direction="row" alignItems="center" spacing={1.25}>
    <Skeleton variant="circular" size={40} />
    <Stack direction="column" flex={1} minWidth={0}>
      <Skeleton width={pickNameWidth(index)} fontSize={15} />
      <Skeleton width={72} fontSize={11} />
    </Stack>
  </Stack>
);

export const PostCardSkeleton = observer(
  ({ index = 0 }: { index?: number }) => {
    const app = useAppStore();
    const hasMedia = index % 2 === 1;

    return (
      <Paper
        direction="column"
        elevation={app.settings?.preferEmbossed ? 4 : 0}
        width="100%"
        overflow="hidden"
        borderRadius={12}
        aria-hidden="true"
      >
        <Stack direction="column" spacing={2.5} p={3} width="100%">
          <PostHeaderSkeleton index={index} />
          <Stack direction="column">
            <Skeleton width={pickTextWidth(index, 6)} fontSize={15} />
            <Skeleton width={pickTextWidth(index, 2)} fontSize={15} />
            {!hasMedia && (
              <Skeleton width={pickTextWidth(index, 3)} fontSize={15} />
            )}
          </Stack>
          {hasMedia && <Skeleton variant="rounded" height={240} />}
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={56} height={28} />
            <Skeleton variant="rounded" width={56} height={28} />
            <Skeleton variant="rounded" width={40} height={28} />
          </Stack>
        </Stack>
      </Paper>
    );
  }
);

export const PostListSkeleton = ({
  label,
  count = 3
}: {
  label: string;
  count?: number;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    spacing={1.5}
    render={(index) => <PostCardSkeleton index={index} />}
  />
);

export const PostEmbedSkeleton = () => (
  <Stack direction="column" spacing={1.25} aria-hidden="true">
    <PostHeaderSkeleton index={0} />
    <Stack direction="column">
      <Skeleton width="90%" fontSize={13} />
      <Skeleton width="60%" fontSize={13} />
    </Stack>
  </Stack>
);

export const CommentSkeleton = ({ index = 0 }: { index?: number }) => (
  <Stack direction="row" spacing={1.25} aria-hidden="true">
    <Skeleton variant="circular" size={32} />
    <Stack direction="column" flex={1} minWidth={0}>
      <Skeleton width={pickNameWidth(index, 1)} fontSize={13} />
      <Skeleton width={pickTextWidth(index)} fontSize={13} />
      {index % 2 === 0 && (
        <Skeleton width={pickTextWidth(index, 4)} fontSize={13} />
      )}
    </Stack>
  </Stack>
);

export const CommentListSkeleton = ({
  label,
  count = 3
}: {
  label: string;
  count?: number;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    spacing={2}
    render={(index) => <CommentSkeleton index={index} />}
  />
);
