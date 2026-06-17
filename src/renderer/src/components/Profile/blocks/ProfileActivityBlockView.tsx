import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { useAppStore } from "@hooks/useStores";
import type { ProfileActivityBlock } from "@mutualzz/types";
import type { Snowflake } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { CustomStatusDisplay } from "@components/CustomStatus/CustomStatusDisplay";
import { PulseIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

interface Props {
  block: ProfileActivityBlock;
  userId: Snowflake;
}

export const ProfileActivityBlockView = observer(({ block, userId }: Props) => {
  const app = useAppStore();
  const presence = app.presence.get(userId);
  const activity = presence?.activities?.[0];
  const customActivity = presence?.activities?.find((a) => a.type === "custom");

  return (
    <Stack
      direction="column"
      spacing={1}
      width="100%"
      height="100%"
      p={1.5}
      borderRadius={12}
      css={{
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <PulseIcon size={18} weight="fill" />
        <Typography level="body-sm" fontWeight={700}>
          Activity
        </Typography>
      </Stack>

      {presence?.status && (
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <Typography
            level="body-xs"
            css={{ opacity: 0.75, textTransform: "capitalize" }}
          >
            {presence.status}
          </Typography>
          {customActivity && block.showCustomStatus !== false && (
            <>
              <Typography level="body-xs" css={{ opacity: 0.5 }}>
                —
              </Typography>
              <CustomStatusDisplay activity={customActivity} fontSize={12} textColor="primary" />
            </>
          )}
        </Stack>
      )}

      {activity ? (
        <SmallActivityStatus presence={presence} />
      ) : (
        <Box>
          <Typography level="body-sm" css={{ opacity: 0.6 }}>
            No activity right now
          </Typography>
        </Box>
      )}
    </Stack>
  );
});
