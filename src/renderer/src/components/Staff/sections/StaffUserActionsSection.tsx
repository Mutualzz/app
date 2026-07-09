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
  const isDisabled = BitField.fromString(userFlags, user.flags.toString()).has(
    "Disabled"
  );
  const isDeleted = BitField.fromString(userFlags, user.flags.toString()).has(
    "Deleted"
  );
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
          err instanceof Error ? err.message : "Failed to lift restriction"
        );
      }
    });

  return (
    <Stack direction="column" spacing={1.25}>
      {isDeleted ? (
        <Typography level="body-sm" textColor="muted">
          This account is soft deleted. The user cannot log in, but their data
          is retained.
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
        {isDisabled ? "Enable Account" : "Disable Account"}
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
        Force Logout
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
        Warn User
      </Button>
      {isRestricted ? (
        <Button
          color="warning"
          variant="soft"
          disabled={liftingRestriction}
          onClick={() => liftRestriction()}
        >
          Lift Restriction
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
          Restrict User
        </Button>
      )}
        </Stack>
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
          Soft Delete Account
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
          Hard Delete Account
        </Button>
      )}
    </Stack>
  );
};
