import {
  getMutualSpaces,
  isProfileFriend
} from "@components/Profile/shared/profileBlockData.utils";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { useAppStore } from "@hooks/useStores";
import type { ProfileMutualBlock } from "@mutualzz/types";
import type { Snowflake } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { Paper } from "@renderer/components/Paper";
import { observer } from "mobx-react-lite";

interface Props {
  block: ProfileMutualBlock;
  userId: Snowflake;
}

export const ProfileMutualBlockView = observer(({ block, userId }: Props) => {
  const app = useAppStore();
  const maxItems = block.maxItems ?? 6;

  const mutualSpaces =
    block.mode === "spaces" ? getMutualSpaces(app, userId, maxItems) : [];
  const isFriend = block.mode === "friends" && isProfileFriend(app, userId);
  const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");

  return (
    <Paper
      flexDirection="column"
      width="100%"
      spacing={1.25}
      height="100%"
      p={1.75}
      borderRadius={cornerRadius}
      overflow="auto"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <UsersThreeIcon size={18} weight="fill" />
        <Typography level="body-sm" fontWeight={700} css={{ fontSize: "var(--pcf-sm)" }}>
          {block.mode === "spaces" ? "Mutual Spaces" : "Friends"}
        </Typography>
      </Stack>

      {block.mode === "friends" ? (
        <Typography level="body-sm" css={{ opacity: isFriend ? 1 : 0.6, fontSize: "var(--pcf-sm)" }}>
          {isFriend ? "You are friends" : "Not friends yet"}
        </Typography>
      ) : mutualSpaces.length === 0 ? (
        <Typography level="body-sm" css={{ opacity: 0.6, fontSize: "var(--pcf-sm)" }}>
          No mutual spaces
        </Typography>
      ) : (
        <Stack direction="column" spacing={0.75}>
          {mutualSpaces.map((space) => (
            <Stack
              key={space.id}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <SpaceIcon space={space} size={24} />
              <Typography level="body-sm" css={{ minWidth: 0, fontSize: "var(--pcf-sm)" }}>
                {space.name}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
});
