import {
  findMemberForUser,
  getMemberRoles
} from "@components/Profile/shared/profileBlockData.utils";
import { useAppStore } from "@hooks/useStores";
import type { ProfileRolesBlock } from "@mutualzz/types";
import type { Snowflake } from "@mutualzz/types";
import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { Paper } from "@renderer/components/Paper";
import { observer } from "mobx-react-lite";

interface Props {
  block: ProfileRolesBlock;
  userId: Snowflake;
}

export const ProfileRolesBlockView = observer(({ block, userId }: Props) => {
  const app = useAppStore();
  const member = findMemberForUser(app, userId);
  const roles = getMemberRoles(member, block.maxRoles ?? 6);

  return (
    <Paper
      direction="column"
      spacing={1.25}
      width="100%"
      height="100%"
      p={1.75}
      borderRadius={12}
      overflow="auto"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <ShieldCheckIcon size={18} weight="fill" />
        <Typography level="body-sm" fontWeight={700}>
          Roles
        </Typography>
      </Stack>

      {roles.length === 0 ? (
        <Typography level="body-sm" css={{ opacity: 0.6 }}>
          {member ? "No roles to show" : "Join a shared space to display roles"}
        </Typography>
      ) : (
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          {roles.map((role) => (
            <Box
              key={role.id}
              px={1}
              py={0.5}
              borderRadius={999}
              css={{
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${role.color ?? "rgba(255,255,255,0.14)"}`,
                color: role.color ?? "inherit"
              }}
            >
              <Typography level="body-xs" fontWeight={600}>
                {role.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
});
