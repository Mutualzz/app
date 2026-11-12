import { Skeleton, Stack } from "@mutualzz/ui-web";
import { pickNameWidth, pickTextWidth, SkeletonGroup } from "./SkeletonGroup";

export const MessageGroupSkeleton = ({ index = 0 }: { index?: number }) => {
  const lineCount = (index % 3) + 1;
  const hasMedia = index % 5 === 3;

  return (
    <Stack direction="row" py={0.5} aria-hidden="true">
      <Stack width={62} flexShrink={0} justifyContent="center" pt="2px">
        <Skeleton variant="circular" size={40} />
      </Stack>
      <Stack direction="column" flex={1} minWidth={0} pr={6} spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Skeleton width={pickNameWidth(index)} fontSize={15} />
          <Skeleton width={56} fontSize={11} />
        </Stack>
        {Array.from({ length: lineCount }, (_line, lineIndex) => (
          <Skeleton
            key={lineIndex}
            width={pickTextWidth(index, lineIndex)}
            fontSize={14}
          />
        ))}
        {hasMedia && (
          <Skeleton
            variant="rounded"
            width={280}
            maxWidth="100%"
            height={160}
          />
        )}
      </Stack>
    </Stack>
  );
};

export const MessageListSkeleton = ({
  label,
  count = 6
}: {
  label: string;
  count?: number;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    spacing={1.5}
    render={(index) => <MessageGroupSkeleton index={index} />}
  />
);
