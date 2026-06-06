import { observer } from "mobx-react-lite";
import { Role } from "@stores/objects/Role";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  Checkbox,
  InputDefault,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar";
import { dynamicElevation } from "@mutualzz/ui-core";

interface Props {
  role: Role;
}

export const SpaceRoleEditAddMembers = observer(({ role }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [userIds, setUserIds] = useState<string[]>([]);

  const space = role.space;

  const members = search
    ? space?.members.all.filter(
        (mem) =>
          mem.displayName.includes(search) ||
          mem.user?.username.includes(search)
      )
    : space?.members.all;

  const toggleUserId = (id: string) => {
    if (userIds.includes(id)) {
      setUserIds((prev) => prev.filter((id_) => id_ !== id));
    } else {
      setUserIds((prev) => [...prev, id]);
    }
  };

  return (
    <Paper
      direction="column"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      height="75vh"
      width="35vw"
      borderRadius={8}
      spacing={2.5}
      p={4}
    >
      <Stack direction="column" spacing={2.5}>
        <Typography level="h4">Add Members</Typography>
        <Typography level="h6">
          Add up to 30 members to role {role.name}
        </Typography>
      </Stack>
      <InputDefault
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members"
      />

      <Stack direction="column" spacing={1.75}>
        {members?.map((member) => (
          <Stack
            onClick={() => toggleUserId(member.id)}
            p={2.5}
            borderRadius={4}
            css={{
              cursor: "pointer",
              "&:hover": {
                background: dynamicElevation(theme.colors.surface, 6)
              }
            }}
            alignItems="center"
            direction="row"
            spacing={1.25}
          >
            <Checkbox
              onChange={() => toggleUserId(member.id)}
              checked={userIds.includes(member.id)}
              value={member.id}
            />
            <UserAvatar user={member.user} size={30} disableContextMenu />
            <Stack spacing={2.5}>
              <Typography>{member.displayName}</Typography>
              <Typography textColor="muted">{member.user?.username}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
});
