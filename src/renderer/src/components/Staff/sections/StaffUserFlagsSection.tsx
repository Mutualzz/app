import { useAppStore } from "@hooks/useStores";
import {
  BitField,
  staffToggleableUserFlags,
  userFlags
} from "@mutualzz/bitfield";
import type { APIPrivateUser } from "@mutualzz/types";
import { Checkbox, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  user: APIPrivateUser;
  onUpdated: (user: APIPrivateUser) => void;
}

export const StaffUserFlagsSection = ({ user, onUpdated }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("staff");
  const flags = BitField.fromString(userFlags, user.flags.toString());

  const { mutate: setFlag, isPending: settingFlag } = useMutation({
    mutationKey: ["staff-set-flag", user.id],
    mutationFn: ({ flag, enabled }: { flag: string; enabled: boolean }) =>
      app.rest.patch<APIPrivateUser>(`/staff/users/${user.id}/flags/${flag}`, {
        enabled
      }),
    onSuccess: onUpdated,
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : t("user.actions.errors.updateUser")
      );
    }
  });

  return (
    <Stack direction="column" spacing={2} maxWidth={480}>
      <Stack direction="column" spacing={0.75}>
        <Typography level="title-sm" fontWeight={600}>
          {t("user.flags.current")}
        </Typography>
        <Typography level="body-sm" css={{ opacity: 0.75 }}>
          {flags.toArray().length
            ? flags.toArray().join(", ")
            : t("user.flags.none")}
        </Typography>
      </Stack>

      {app.account?.isFounder &&
        (flags.has("Founder") ? (
          <Typography level="body-sm" textColor="muted">
            {t("user.actions.founderProtectedBanner")}
          </Typography>
        ) : (
          <Stack direction="column" spacing={0.75}>
            <Typography level="title-sm" fontWeight={600}>
              {t("user.flags.manage")}
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
        ))}
    </Stack>
  );
};
