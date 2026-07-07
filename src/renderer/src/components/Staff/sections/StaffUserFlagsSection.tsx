import { useAppStore } from "@hooks/useStores";
import {
  BitField,
  staffToggleableUserFlags,
  userFlags
} from "@mutualzz/bitfield";
import type { APIPrivateUser } from "@mutualzz/types";
import { Checkbox, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface Props {
  user: APIPrivateUser;
  onUpdated: (user: APIPrivateUser) => void;
}

export const StaffUserFlagsSection = ({ user, onUpdated }: Props) => {
  const app = useAppStore();
  const flags = BitField.fromString(userFlags, user.flags.toString());

  const { mutate: setFlag, isPending: settingFlag } = useMutation({
    mutationKey: ["staff-set-flag", user.id],
    mutationFn: ({ flag, enabled }: { flag: string; enabled: boolean }) =>
      app.rest.patch<APIPrivateUser>(`/staff/users/${user.id}/flags/${flag}`, {
        enabled
      }),
    onSuccess: onUpdated,
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update flag");
    }
  });

  return (
    <Stack direction="column" spacing={2} maxWidth={480}>
      <Stack direction="column" spacing={0.75}>
        <Typography level="title-sm" fontWeight={600}>
          Current Flags
        </Typography>
        <Typography level="body-sm" css={{ opacity: 0.75 }}>
          {flags.toArray().length ? flags.toArray().join(", ") : "No flags set"}
        </Typography>
      </Stack>

      {app.account?.isFounder && (
        <Stack direction="column" spacing={0.75}>
          <Typography level="title-sm" fontWeight={600}>
            Manage Flags
          </Typography>
          <Stack direction="column" spacing={0.75}>
            {staffToggleableUserFlags.map((f) => (
              <Checkbox
                key={f}
                label={f}
                checked={flags.has(f)}
                disabled={settingFlag}
                onChange={(e) =>
                  setFlag({ flag: f, enabled: e.target.checked })
                }
              />
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
