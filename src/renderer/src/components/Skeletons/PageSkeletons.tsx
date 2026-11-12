import { Paper } from "@components/Paper";
import { Skeleton, Stack } from "@mutualzz/ui-web";
import { MessageListSkeleton } from "./MessageSkeleton";
import { SkeletonGroup } from "./SkeletonGroup";

const TILE_HEIGHTS = [100, 140, 120, 90, 130, 110, 95, 125];

export const TileGridSkeleton = ({
  label,
  count = 8,
  columns = 2,
  gap = 4
}: {
  label: string;
  count?: number;
  columns?: number;
  gap?: number;
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-label={label}
    css={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      padding: "4px 0 8px"
    }}
  >
    {Array.from({ length: count }, (_tile, index) => (
      <Skeleton
        key={index}
        variant="rounded"
        height={TILE_HEIGHTS[index % TILE_HEIGHTS.length]}
      />
    ))}
  </div>
);

export const ChannelViewSkeleton = ({ label }: { label: string }) => (
  <Paper
    surfaceRole="content"
    elevation={0}
    direction="column"
    flex="1 1 auto"
    overflow="hidden"
  >
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      px={2}
      height={48}
      flexShrink={0}
      aria-hidden="true"
    >
      <Skeleton variant="rounded" size={20} />
      <Skeleton width={140} fontSize={15} />
    </Stack>
    <Stack
      direction="column"
      flex={1}
      justifyContent="flex-end"
      overflow="hidden"
      px={1}
      pb={2}
    >
      <MessageListSkeleton label={label} count={8} />
    </Stack>
    <Stack px={2} pb={2} flexShrink={0} aria-hidden="true">
      <Skeleton variant="rounded" height={44} />
    </Stack>
  </Paper>
);

export const ProfilePageSkeleton = ({ label }: { label: string }) => (
  <Stack
    flex={1}
    direction="column"
    alignItems="center"
    overflow="hidden"
    p={3}
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    <Stack direction="column" width="100%" maxWidth={760} aria-hidden="true">
      <Skeleton variant="rounded" height={200} css={{ borderRadius: 16 }} />
      <Stack
        direction="row"
        alignItems="flex-end"
        spacing={2}
        px={3}
        css={{ marginTop: -48 }}
      >
        <Skeleton
          variant="circular"
          size={112}
          css={{ outline: "6px solid var(--mz-background)" }}
        />
        <Stack direction="column" flex={1} minWidth={0} pb={1}>
          <Skeleton width="40%" fontSize={24} />
          <Skeleton width="22%" fontSize={14} />
        </Stack>
      </Stack>
      <div
        css={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginTop: 32
        }}
      >
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={110} />
        <Skeleton variant="rounded" height={110} />
      </div>
    </Stack>
  </Stack>
);

export const InviteCardSkeleton = ({ label }: { label: string }) => (
  <Stack
    direction="column"
    flex={1}
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    <Stack
      direction="column"
      flex={1}
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      aria-hidden="true"
    >
      <Skeleton variant="rounded" size={48} css={{ borderRadius: 14 }} />
      <Skeleton width={200} fontSize={14} />
      <Skeleton width={160} fontSize={26} />
    </Stack>
    <Stack px={10} mb={4} aria-hidden="true">
      <Skeleton variant="rounded" height={36} />
    </Stack>
  </Stack>
);

export const StaffUserSkeleton = ({ label }: { label: string }) => (
  <Stack
    flex={1}
    direction="column"
    spacing={3}
    p={3}
    width="100%"
    role="status"
    aria-busy="true"
    aria-label={label}
  >
    <Stack direction="row" alignItems="center" spacing={2} aria-hidden="true">
      <Skeleton variant="circular" size={64} />
      <Stack direction="column" flex={1} minWidth={0}>
        <Skeleton width="30%" fontSize={20} />
        <Skeleton width="18%" fontSize={13} />
      </Stack>
    </Stack>
    <SkeletonGroup
      label={label}
      count={4}
      spacing={1}
      render={() => (
        <Skeleton variant="rounded" height={72} aria-hidden="true" />
      )}
    />
  </Stack>
);
