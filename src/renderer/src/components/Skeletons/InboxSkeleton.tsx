import { Paper } from "@components/Paper";
import { Skeleton, Stack, useTheme } from "@mutualzz/ui-web";
import { pickTextWidth, SkeletonGroup } from "./SkeletonGroup";

export const InboxCardSkeleton = ({ index = 0 }: { index?: number }) => {
  const { theme } = useTheme();

  return (
    <Paper
      direction="column"
      borderRadius={10}
      css={{ border: `1px solid ${theme.colors.neutral}40`, flexShrink: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} px={2} py={1.5}>
        <Skeleton variant="circular" size={32} />
        <Stack direction="column" flex={1} minWidth={0}>
          <Skeleton
            width={pickTextWidth(index, 3)}
            maxWidth="45%"
            fontSize={13}
          />
          <Skeleton width="25%" fontSize={11} />
        </Stack>
      </Stack>
      <Stack direction="column" px={2} pb={1.75}>
        <Skeleton width={pickTextWidth(index)} fontSize={13} />
        {index % 2 === 0 && (
          <Skeleton width={pickTextWidth(index, 1)} fontSize={13} />
        )}
      </Stack>
    </Paper>
  );
};

export const InboxListSkeleton = ({
  label,
  count = 4
}: {
  label: string;
  count?: number;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    render={(index) => <InboxCardSkeleton index={index} />}
  />
);

export const NotificationRowSkeleton = ({ index = 0 }: { index?: number }) => (
  <Stack direction="row" alignItems="center" spacing={1.25} px={1} py={0.75}>
    <Skeleton variant="circular" size={32} />
    <Stack direction="column" flex={1} minWidth={0}>
      <Skeleton width={pickTextWidth(index, 2)} fontSize={13} />
      <Skeleton width={48} fontSize={11} />
    </Stack>
  </Stack>
);

export const NotificationListSkeleton = ({
  label,
  count = 5
}: {
  label: string;
  count?: number;
}) => (
  <SkeletonGroup
    label={label}
    count={count}
    spacing={0.25}
    render={(index) => <NotificationRowSkeleton index={index} />}
  />
);
