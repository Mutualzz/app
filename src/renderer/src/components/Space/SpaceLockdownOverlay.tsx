import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { Space } from "@stores/objects/Space";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  getSpaceLockdownMessage,
  notifySpaceLockdownBlocked
} from "@utils/spaceLockdown";
import { observer } from "mobx-react-lite";
import type { SyntheticEvent } from "react";

interface Props {
  space: Space;
  showMessage?: boolean;
  reserveBottom?: string | number;
}

export const SpaceLockdownOverlay = observer(
  ({ space, showMessage = true, reserveBottom }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();

    const isOwner = space.ownerId === app.account?.id;

    if (!space.isInLockdown) return null;

    const blockInteraction = (event: SyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();
      notifySpaceLockdownBlocked();
    };

    return (
      <Stack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={reserveBottom ?? 0}
        alignItems="center"
        justifyContent="center"
        css={{
          zIndex: theme.zIndex.modal - 2,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(1px)",
          cursor: "not-allowed"
        }}
        onPointerDown={blockInteraction}
        onClick={blockInteraction}
        onContextMenu={blockInteraction}
        onDoubleClick={blockInteraction}
      >
        {showMessage && (
          <Paper
            variant="soft"
            color="warning"
            borderRadius={12}
            px={2}
            py={1.75}
            boxShadow="none !important"
            direction="column"
            spacing={0.75}
            alignItems="center"
            css={{
              maxWidth: "min(22rem, calc(100% - 2rem))",
              pointerEvents: "none",
              textAlign: "center"
            }}
          >
            <LockSimpleIcon size={28} weight="fill" />
            <Typography level="title-sm" fontWeight={700}>
              This space is in lockdown
            </Typography>
            <Typography level="body-sm">
              {getSpaceLockdownMessage(space, isOwner)}
            </Typography>
          </Paper>
        )}
      </Stack>
    );
  }
);
