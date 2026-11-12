import { Paper } from "@components/Paper";
import { Skeleton, Stack } from "@mutualzz/ui-web";
import { pickTextWidth, SkeletonGroup } from "./SkeletonGroup";

export type ListRowSkeletonLeading = "avatar" | "icon" | "none";

interface ListRowSkeletonProps {
  index?: number;
  leading?: ListRowSkeletonLeading;
  lines?: number;
  action?: boolean;
}

export const ListRowSkeleton = ({
  index = 0,
  leading = "none",
  lines = 2,
  action = false
}: ListRowSkeletonProps) => (
  <Paper
    variant="soft"
    borderRadius={10}
    p={1.5}
    boxShadow="none !important"
    direction="row"
    alignItems="center"
    spacing={1.5}
    aria-hidden="true"
  >
    {leading === "avatar" && <Skeleton variant="circular" size={36} />}
    {leading === "icon" && <Skeleton variant="rounded" size={36} />}
    <Stack direction="column" flex={1} minWidth={0}>
      {Array.from({ length: lines }, (_line, lineIndex) => (
        <Skeleton
          key={lineIndex}
          width={
            lineIndex === 0
              ? pickTextWidth(index, 3)
              : pickTextWidth(index, lineIndex)
          }
          maxWidth={lineIndex === 0 ? "50%" : undefined}
          fontSize={lineIndex === 0 ? 14 : 12}
        />
      ))}
    </Stack>
    {action && <Skeleton variant="rounded" width={72} height={28} />}
  </Paper>
);

export const ListSkeleton = ({
  label,
  count = 4,
  maxWidth,
  ...rowProps
}: Omit<ListRowSkeletonProps, "index"> & {
  label: string;
  count?: number;
  maxWidth?: number | string;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    spacing={0.75}
    maxWidth={maxWidth}
    render={(index) => <ListRowSkeleton index={index} {...rowProps} />}
  />
);
