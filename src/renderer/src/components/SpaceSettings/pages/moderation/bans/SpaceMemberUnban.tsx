import { observer } from "mobx-react-lite";
import { SpaceBan } from "@stores/objects/SpaceBan";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { Button } from "@components/Button";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useModal } from "@contexts/Modal.context";
import { Tooltip } from "@components/Tooltip";

interface Props {
  ban: SpaceBan;
}

export const SpaceMemberUnban = observer(({ ban }: Props) => {
  const { t } = useTranslation("space");
  const { t: tSettings } = useTranslation("settings");
  const app = useAppStore();
  const { closeModal } = useModal();

  const { mutate: revokeBan, isPending: isRevoking } = useMutation({
    mutationKey: [ban.userId, "revoke"],
    mutationFn: () =>
      app.rest.delete(`/spaces/${ban.spaceId}/members/${ban.userId}/unban`),
    onSuccess: () => {
      toast.success(
        t("bans.unbanSuccess", { name: ban.user?.displayName ?? "" })
      );
      closeModal();
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={5}
    >
      <Stack direction="row" alignItems="center" flex={1} spacing={1.25}>
        <UserAvatar
          user={ban.user}
          member={app.spaces.active?.members.get(ban.userId)}
        />
        <Stack direction="column">
          {ban.user?.globalName && (
            <Typography>{ban.user.globalName}</Typography>
          )}
          <Typography textColor="muted">{ban.user?.username}</Typography>
        </Stack>
      </Stack>
      <Stack
        flex={1}
        spacing={10}
        direction="row"
        justifyContent="space-between"
      >
        <Stack direction="column" spacing={1.25}>
          <Typography level="body-sm" textColor="secondary">
            {t("bans.reason")}
          </Typography>
          <Typography level="body-xs">
            {ban.reason || t("bans.noReason")}
          </Typography>
        </Stack>
        <Stack direction="column" spacing={1.25}>
          <Typography level="body-sm" textColor="secondary">
            {t("bans.bannedBy")}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <UserAvatar
              user={ban.bannedBy}
              member={app.spaces.active?.members.get(ban.bannedById)}
            />
            <Stack direction="column">
              {ban.bannedBy?.globalName && (
                <Typography>{ban.bannedBy.globalName}</Typography>
              )}
              <Typography textColor="muted">
                {ban.bannedBy?.username}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="column" spacing={1.25}>
          <Typography level="body-sm" textColor="secondary">
            {t("bans.bannedAt")}
          </Typography>
          <Tooltip content={dayjs(ban.createdAt).toString()}>
            <Typography level="body-xs">
              {dayjs(ban.createdAt).fromNow()}
            </Typography>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2.5}>
        <Button
          size="lg"
          disabled={isRevoking}
          expand
          variant="soft"
          color="danger"
          onClick={() => revokeBan()}
        >
          {t("actions.revokeBan")}
        </Button>
        <Button
          expand
          size="lg"
          disabled={isRevoking}
          onClick={() => closeModal()}
          color="primary"
        >
          {tSettings("profile.done")}
        </Button>
      </Stack>
    </Paper>
  );
});
