import { Skeleton, Stack } from "@mutualzz/ui-web";
import { pickNameWidth } from "./SkeletonGroup";

export const MemberRowSkeleton = ({ index = 0 }: { index?: number }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.75}
    p={1}
    maxWidth={224}
    aria-hidden="true"
  >
    <Skeleton variant="circular" size={36} />
    <Stack direction="column" flex={1} minWidth={0}>
      <Skeleton width={pickNameWidth(index)} maxWidth="100%" fontSize={14} />
      {index % 3 === 1 && (
        <Skeleton width={pickNameWidth(index, 2) - 16} fontSize={11} />
      )}
    </Stack>
  </Stack>
);
