import { Button } from "@components/Button";
import { StaffUserDeleteConfirm } from "@components/Modals/StaffUserDeleteConfirm";
import { StaffUserDisableConfirm } from "@components/Modals/StaffUserDisableConfirm";
import { StaffUserForceLogoutConfirm } from "@components/Modals/StaffUserForceLogoutConfirm";
import { StaffUserRestrictConfirm } from "@components/Modals/StaffUserRestrictConfirm";
import { StaffUserWarnConfirm } from "@components/Modals/StaffUserWarnConfirm";
import { useModal } from "@contexts/Modal.context";
import { BitField, userFlags } from "@mutualzz/bitfield";
import type { APIPrivateUser } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@hooks/useStores";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  user: APIPrivateUser;
  onUpdated: (user: APIPrivateUser) => void;
  onForcedLogout: () => void;
  onWarned: () => void;
  onHardDeleted: () => void;
}

export const StaffUserActionsSection = ({
  user,
  onUpdated,
  onForcedLogout,
  onWarned,
  onHardDeleted
}: Props) => {
  const app = useAppStore();
  const { openModal } = useModal();
  const { t } = useTranslation("staff");
  const flags = BitField.fromString(userFlags, user.flags.toString());
  const isDisabled = flags.has("Disabled");
  const isDeleted = flags.has("Deleted");
  const isTargetFounder = flags.has("Founder");
  const isRestricted =
    !!user.restrictedUntil && new Date(user.restrictedUntil) > new Date();

  const { mutate: liftRestriction, isPending: liftingRestriction } =
    useMutation({
      mutationKey: ["staff-lift-restriction", user.id],
      mutationFn: () =>
        app.rest.delete<APIPrivateUser>(`/staff/users/${user.id}/restrict`),
      onSuccess: onUpdated,
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("user.actions.errors.liftRestriction")
        );
      }
    });

  if (isTargetFounder) {
    return (
      <Typography level="body-sm" textColor="muted">
        {t("user.actions.founderProtectedBanner")}
      </Typography>
    );
  }

  return (
    <Stack direction="column" spacing={1.25}>
      {isDeleted ? (
        <Typography level="body-sm" textColor="muted">
          {t("user.actions.softDeletedBanner")}
        </Typography>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button
            color="danger"
            variant="soft"
            onClick={() =>
              openModal(
                `staff-disable-user-${user.id}`,
                <StaffUserDisableConfirm
                  userId={user.id}
                  username={user.username}
                  disable={!isDisabled}
                  onSuccess={onUpdated}
                />
              )
            }
          >
            {isDisabled
              ? t("user.actions.enableAccount")
              : t("user.actions.disableAccount")}
          </Button>
          <Button
            color="danger"
            variant="soft"
            onClick={() =>
              openModal(
                `staff-force-logout-user-${user.id}`,
                <StaffUserForceLogoutConfirm
                  userId={user.id}
                  username={user.username}
                  onSuccess={onForcedLogout}
                />
              )
            }
          >
            {t("user.actions.forceLogout")}
          </Button>
          <Button
            color="warning"
            variant="soft"
            onClick={() =>
              openModal(
                `staff-warn-user-${user.id}`,
                <StaffUserWarnConfirm
                  userId={user.id}
                  username={user.username}
                  onSuccess={onWarned}
                />
              )
            }
          >
            {t("user.actions.warnUser")}
          </Button>
          {isRestricted ? (
            <Button
              color="warning"
              variant="soft"
              disabled={liftingRestriction}
              onClick={() => liftRestriction()}
            >
              {t("user.actions.liftRestriction")}
            </Button>
          ) : (
            <Button
              color="warning"
              variant="soft"
              onClick={() =>
                openModal(
                  `staff-restrict-user-${user.id}`,
                  <StaffUserRestrictConfirm
                    userId={user.id}
                    username={user.username}
                    onSuccess={onUpdated}
                  />
                )
              }
            >
              {t("user.actions.restrictUser")}
            </Button>
          )}
          {!isDeleted && (
            <Button
              color="danger"
              variant="soft"
              onClick={() =>
                openModal(
                  `staff-delete-user-${user.id}`,
                  <StaffUserDeleteConfirm
                    userId={user.id}
                    username={user.username}
                    isFounder={!!app.account?.isFounder}
                    onSoftDeleted={onUpdated}
                    onHardDeleted={onHardDeleted}
                  />
                )
              }
            >
              {t("user.actions.softDeleteAccount")}
            </Button>
          )}
          {app.account?.isFounder && (
            <Button
              color="danger"
              variant="soft"
              onClick={() =>
                openModal(
                  `staff-hard-delete-user-${user.id}`,
                  <StaffUserDeleteConfirm
                    userId={user.id}
                    username={user.username}
                    isFounder
                    allowHardDeleteOnly
                    onSoftDeleted={onUpdated}
                    onHardDeleted={onHardDeleted}
                  />
                )
              }
            >
              {t("user.actions.hardDeleteAccount")}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
};
