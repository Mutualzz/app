import { observer } from "mobx-react-lite";
import { Role } from "@stores/objects/Role";
import { Button, InputDefault, Stack, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { UserAvatar } from "@renderer/components/User/UserAvatar";
import { IconButton } from "@components/IconButton";
import { useModal } from "@contexts/Modal.context";
import { SpaceRoleEditAddMembers } from "@components/SpaceSettings/pages/people/roles/SpaceRoleEditAddMembers";
import { useTranslation } from "react-i18next";

interface Props {
  role: Role;
}

export const SpaceRoleEditManageMembers = observer(({ role }: Props) => {
  const { t } = useTranslation("space");
  const { openModal } = useModal();

  const [search, setSearch] = useState("");

  const members = search
    ? role.members?.filter(
        (m) =>
          m.displayName.includes(search) || m.user?.username?.includes(search)
      )
    : role.members;

  return (
    <Stack direction="column" spacing={2.5}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={5}
        justifyContent="space-between"
      >
        <InputDefault
          type="text"
          placeholder={t("roles.members.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<MagnifyingGlassIcon />}
          fullWidth
        />
        <Button
          onClick={() =>
            openModal(
              "add-members-roles",
              <SpaceRoleEditAddMembers role={role} />
            )
          }
        >
          {t("actions.addMembers")}
        </Button>
      </Stack>
      <Stack direction="column" spacing={2.5} maxHeight="50vh" height="100%">
        {(!members || members.length === 0) && !search && (
          <Typography>{t("roles.members.emptyAssigned")}</Typography>
        )}
        {(!members || members.length === 0) && search && (
          <Typography>{t("roles.members.emptySearch")}</Typography>
        )}
        {members &&
          members.map((member) => (
            <Stack
              justifyContent="space-between"
              direction="row"
              alignItems="center"
              key={member.id}
            >
              <Stack alignItems="center" direction="row" spacing={1.25}>
                <UserAvatar user={member.user} member={member} />
                <Typography>{member.displayName}</Typography>
                <Typography textColor="muted">
                  {member.user?.username}
                </Typography>
              </Stack>
              <IconButton
                onClick={() => member.removeRole(role)}
                variant="solid"
                color="neutral"
                size={8}
              >
                <XIcon />
              </IconButton>
            </Stack>
          ))}
      </Stack>
    </Stack>
  );
});
