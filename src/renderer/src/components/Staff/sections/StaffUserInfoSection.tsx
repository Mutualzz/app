import { Button } from "@components/Button";
import { InputWithLabel } from "@components/InputWithLabel";
import { useAppStore } from "@hooks/useStores";
import { BitField, userFlags } from "@mutualzz/bitfield";
import type { APIPrivateUser, HttpException } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  user: APIPrivateUser;
  onUpdated: (user: APIPrivateUser) => void;
}

interface FieldErrors {
  username?: string;
  globalName?: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography level="body-sm" textColor="muted">
        {label}
      </Typography>
      <Typography level="body-sm">{value}</Typography>
    </Stack>
  );
}

export const StaffUserInfoSection = ({ user, onUpdated }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("staff");

  const isVerified = BitField.fromString(userFlags, user.flags.toString()).has(
    "Verified"
  );

  const [username, setUsername] = useState(user.username);
  const [globalName, setGlobalName] = useState(user.globalName ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setUsername(user.username);
    setGlobalName(user.globalName ?? "");
    setErrors({});
  }, [user.id, user.username, user.globalName]);

  const trimmedUsername = username.trim();
  const trimmedGlobalName = globalName.trim();

  const usernameChanged = trimmedUsername !== user.username;
  const globalNameChanged = trimmedGlobalName !== (user.globalName ?? "");

  const { mutate: saveProfile, isPending } = useMutation({
    mutationKey: ["staff-update-profile", user.id],
    mutationFn: () =>
      app.rest.patch<APIPrivateUser>(`/staff/users/${user.id}/profile`, {
        ...(usernameChanged ? { username: trimmedUsername } : {}),
        ...(globalNameChanged
          ? { globalName: trimmedGlobalName || null }
          : {})
      }),
    onSuccess: (updated) => {
      setErrors({});
      onUpdated(updated);
    },
    onError: (err: HttpException) => {
      const nextErrors: FieldErrors = {};
      err.errors?.forEach((e) => {
        if (e.path === "username") nextErrors.username = e.message;
        if (e.path === "globalName") nextErrors.globalName = e.message;
      });

      if (Object.keys(nextErrors).length === 0) toast.error(err.message);
      setErrors(nextErrors);
    }
  });

  const { mutate: sendVerifyReminder, isPending: sendingReminder } =
    useMutation({
      mutationKey: ["staff-verify-reminder", user.id],
      mutationFn: () =>
        app.rest.post(`/staff/users/${user.id}/verify-reminder`),
      onSuccess: () => toast.success(t("user.info.verifyReminderSent")),
      onError: (err: HttpException) => toast.error(err.message)
    });

  return (
    <Stack direction="column" spacing={2} maxWidth={480}>
      <Stack direction="column" spacing={1.25}>
        <InputWithLabel
          label={t("user.info.username")}
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          apiError={errors.username}
        />
        <InputWithLabel
          label={t("user.info.displayName")}
          name="globalName"
          placeholder={t("user.info.noDisplayName")}
          value={globalName}
          onChange={(e) => setGlobalName(e.target.value)}
          apiError={errors.globalName}
        />
        <Button
          color="primary"
          disabled={
            isPending ||
            !trimmedUsername ||
            (!usernameChanged && !globalNameChanged)
          }
          onClick={() => saveProfile()}
          css={{ alignSelf: "flex-start" }}
        >
          {t("user.info.saveChanges")}
        </Button>
      </Stack>

      <Stack direction="column" spacing={0.75}>
        <Typography level="title-sm" fontWeight={600}>
          {t("user.info.accountDetails")}
        </Typography>
        <DetailRow label={t("user.info.email")} value={user.email} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="body-sm" textColor="muted">
            {t("user.info.emailVerified")}
          </Typography>
          {isVerified ? (
            <Typography level="body-sm">{t("user.info.yes")}</Typography>
          ) : (
            <Button
              size="sm"
              color="primary"
              variant="soft"
              disabled={sendingReminder}
              onClick={() => sendVerifyReminder()}
            >
              {t("user.info.sendReminder")}
            </Button>
          )}
        </Stack>
        <DetailRow label={t("user.info.userId")} value={user.id} />
        <DetailRow
          label={t("user.info.dateOfBirth")}
          value={dayjs(user.dateOfBirth).format("MMM D, YYYY")}
        />
        <DetailRow
          label={t("user.info.created")}
          value={dayjs(user.createdAt).format("MMM D, YYYY h:mm A")}
        />
        {user.restrictedUntil &&
          new Date(user.restrictedUntil) > new Date() && (
            <DetailRow
              label={t("user.info.restrictedUntil")}
              value={dayjs(user.restrictedUntil).format(
                "MMM D, YYYY h:mm A"
              )}
            />
          )}
      </Stack>
    </Stack>
  );
};
