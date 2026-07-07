import { Button } from "@components/Button";
import { StaffUserDisableConfirm } from "@components/Modals/StaffUserDisableConfirm";
import { StaffUserForceLogoutConfirm } from "@components/Modals/StaffUserForceLogoutConfirm";
import { useModal } from "@contexts/Modal.context";
import { BitField, userFlags } from "@mutualzz/bitfield";
import type { APIPrivateUser } from "@mutualzz/types";
import { Stack } from "@mutualzz/ui-web";

interface Props {
  user: APIPrivateUser;
  onUpdated: (user: APIPrivateUser) => void;
  onForcedLogout: () => void;
}

export const StaffUserActionsSection = ({
  user,
  onUpdated,
  onForcedLogout
}: Props) => {
  const { openModal } = useModal();
  const isDisabled = BitField.fromString(userFlags, user.flags.toString()).has(
    "Disabled"
  );

  return (
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
    </Stack>
  );
};
