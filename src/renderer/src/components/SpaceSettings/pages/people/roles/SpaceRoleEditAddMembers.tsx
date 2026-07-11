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
import { Button } from "@components/Button";
import { useModal } from "@contexts/Modal.context";
import { useMutation } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const MAX_BULK_MEMBERS = 30;

interface Props {
  role: Role;
}

export const SpaceRoleEditAddMembers = observer(({ role }: Props) => {
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { closeModal } = useModal();
  const { theme } = useTheme();

  const [search, setSearch] = useState("");
  const [userIds, setUserIds] = useState<string[]>([]);

  const space = role.space;
  const me = space?.members.me;

  const eligibleMembers =
    space?.members.all.filter(
      (member) =>
        !member.roles.has(role.id) &&
        (me?.canManageMember(member, "ManageRoles") ?? false)
    ) ?? [];

  const query = search.trim().toLowerCase();
  const members = query
    ? eligibleMembers.filter(
        (member) =>
          member.displayName.toLowerCase().includes(query) ||
          member.user?.username.toLowerCase().includes(query)
      )
    : eligibleMembers;

  const atSelectionLimit = userIds.length >= MAX_BULK_MEMBERS;

  const toggleUserId = (id: string) => {
    setUserIds((prev) => {
      if (prev.includes(id)) return prev.filter((id_) => id_ !== id);
      if (prev.length >= MAX_BULK_MEMBERS) return prev;
      return [...prev, id];
    });
  };

  const { mutate: addMembers, isPending } = useMutation({
    mutationKey: ["add-role-members-bulk", role.id, userIds],
    mutationFn: () => role.addMembers(userIds),
    onSuccess: () => {
      toast.success(
        t("roles.members.addSuccess", {
          count: userIds.length,
          roleName: role.name
        })
      );
      closeModal();
    },
    onError: () => {
      toast.error(t("roles.members.addFailed"));
    }
  });

  return (
    <Paper
      direction="column"
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      height="75vh"
      width="35vw"
      minWidth="22rem"
      borderRadius={12}
      justifyContent="space-between"
    >
      <Stack p={4} direction="column" spacing={2.5} flex={1} minHeight={0}>
        <Stack direction="column" spacing={1}>
          <Typography level="h4" fontWeight="bold">
            {t("actions.addMembers")}
          </Typography>
          <Typography level="body-sm" textColor="secondary">
            {t("roles.members.addDescription", {
              max: MAX_BULK_MEMBERS,
              roleName: role.name
            })}
          </Typography>
          {userIds.length > 0 && (
            <Typography level="body-xs" textColor="secondary">
              {t("roles.members.selectedCount", {
                selected: userIds.length,
                max: MAX_BULK_MEMBERS
              })}
            </Typography>
          )}
        </Stack>

        <InputDefault
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("roles.members.searchPlaceholder")}
          startDecorator={<MagnifyingGlassIcon />}
        />

        <Stack
          direction="column"
          spacing={1.25}
          flex={1}
          minHeight={0}
          overflow="auto"
        >
          {eligibleMembers.length === 0 && (
            <Typography level="body-sm" textColor="secondary">
              {t("roles.members.noEligible")}
            </Typography>
          )}

          {eligibleMembers.length > 0 && members.length === 0 && (
            <Typography level="body-sm" textColor="secondary">
              {t("roles.members.emptySearch")}
            </Typography>
          )}

          {members.map((member) => {
            const selected = userIds.includes(member.id);
            const disabled = !selected && atSelectionLimit;

            return (
              <Stack
                key={member.id}
                onClick={() => !disabled && toggleUserId(member.id)}
                p={2.5}
                borderRadius={8}
                css={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                  "&:hover": disabled
                    ? undefined
                    : {
                        background: dynamicElevation(theme.colors.surface, 6)
                      }
                }}
                alignItems="center"
                direction="row"
                spacing={2.5}
              >
                <Checkbox
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => !disabled && toggleUserId(member.id)}
                  checked={selected}
                  disabled={disabled}
                  value={member.id}
                />
                <UserAvatar user={member.user} member={member} size={36} />
                <Stack direction="column" spacing={0.25}>
                  <Typography fontWeight={500}>{member.displayName}</Typography>
                  <Typography level="body-xs" textColor="secondary">
                    @{member.user?.username}
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <Paper
        p={4}
        borderBottom="0 !important"
        borderLeft="0 !important"
        borderRight="0 !important"
        elevation={app.settings?.preferEmbossed ? 5 : 3}
        direction="row"
        spacing={2.5}
      >
        <Button
          size="lg"
          expand
          color="neutral"
          disabled={isPending}
          onClick={() => closeModal()}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          size="lg"
          expand
          color="primary"
          disabled={userIds.length === 0 || isPending}
          onClick={() => addMembers()}
        >
          {userIds.length > 0
            ? t("actions.addMembersCount", { count: userIds.length })
            : tCommon("add")}
        </Button>
      </Paper>
    </Paper>
  );
});
