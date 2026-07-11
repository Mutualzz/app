import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import {
  Button,
  Option,
  Select,
  Stack,
  Textarea,
  Typography
} from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import type { APIPrivateUser } from "@mutualzz/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  onSuccess: (user: APIPrivateUser) => void;
}

const durationOptions = [
  { value: 1, labelKey: "user.modals.restrict.durations.1h" },
  { value: 6, labelKey: "user.modals.restrict.durations.6h" },
  { value: 24, labelKey: "user.modals.restrict.durations.1d" },
  { value: 72, labelKey: "user.modals.restrict.durations.3d" },
  { value: 168, labelKey: "user.modals.restrict.durations.7d" },
  { value: 720, labelKey: "user.modals.restrict.durations.30d" }
] as const;

export const StaffUserRestrictConfirm = observer(
  ({ userId, username: _username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [hours, setHours] = useState(24);
    const [reason, setReason] = useState("");

    const { mutate: restrictUser, isPending } = useMutation({
      mutationKey: ["staff-restrict-user", userId],
      mutationFn: () =>
        app.rest.patch<APIPrivateUser>(`/staff/users/${userId}/restrict`, {
          hours,
          reason: reason.trim()
        }),
      onSuccess: (user) => {
        onSuccess(user);
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("user.actions.errors.restrictUser")
        );
      }
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        width="25vw"
        spacing={2.5}
      >
        <Typography level="h5" fontWeight="bold">
          {t("user.modals.restrict.title")}
        </Typography>
        <Typography>{t("user.modals.restrict.body")}</Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.restrict.duration")}
          </Typography>
          <Select value={hours} onValueChange={(v) => setHours(Number(v))}>
            {durationOptions.map((o) => (
              <Option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </Option>
            ))}
          </Select>
        </Stack>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.reasonRequired")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("user.modals.restrict.placeholder")}
            rows={3}
          />
        </Stack>
        <Stack spacing={1.25} direction="row">
          <Button color="neutral" expand size="lg" onClick={() => closeModal()}>
            {tCommon("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => restrictUser()}
            disabled={isPending || !reason.trim()}
            size="lg"
          >
            {t("user.modals.restrict.submit")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
