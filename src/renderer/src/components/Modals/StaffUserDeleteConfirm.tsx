import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import {
  Button,
  Input,
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

type DeleteMode = "soft" | "hard";

interface Props {
  userId: string;
  username: string;
  isFounder: boolean;
  allowHardDeleteOnly?: boolean;
  onSoftDeleted: (user: APIPrivateUser) => void;
  onHardDeleted: () => void;
}

export const StaffUserDeleteConfirm = observer(
  ({
    userId,
    username,
    isFounder,
    allowHardDeleteOnly = false,
    onSoftDeleted,
    onHardDeleted
  }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("staff");
    const { t: tCommon } = useTranslation("common");
    const [mode, setMode] = useState<DeleteMode>(
      allowHardDeleteOnly ? "hard" : "soft"
    );
    const [reason, setReason] = useState("");
    const [confirmUsername, setConfirmUsername] = useState("");

    const { mutate: deleteUser, isPending } = useMutation({
      mutationKey: ["staff-delete-user", userId, mode],
      mutationFn: async () =>
        app.rest.post<APIPrivateUser | { success: true; hard: true }>(
          `/staff/users/${userId}/delete`,
          {
            mode,
            reason: reason.trim(),
            confirmUsername: confirmUsername.trim().toLowerCase()
          }
        ),
      onSuccess: (result) => {
        if ("hard" in result && result.hard) onHardDeleted();
        else onSoftDeleted(result as APIPrivateUser);
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : t("user.actions.errors.deleteAccount")
        );
      }
    });

    const usernameMatches =
      confirmUsername.trim().toLowerCase() === username.toLowerCase();
    const isHardDelete = mode === "hard";

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={4.75}
        borderRadius={12}
        direction="column"
        width="25vw"
        spacing={2.5}
      >
        <Typography level="h5" fontWeight="bold">
          {isHardDelete
            ? t("user.modals.delete.hardTitle")
            : t("user.modals.delete.softTitle")}
        </Typography>
        <Typography>
          {isHardDelete
            ? t("user.modals.delete.hardBody", { username })
            : t("user.modals.delete.softBody", { username })}
        </Typography>
        {isFounder && !allowHardDeleteOnly && (
          <Stack direction="column" spacing={1}>
            <Typography fontWeight="bold">
              {t("user.modals.delete.type")}
            </Typography>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as DeleteMode)}
            >
              <Option value="soft">{t("user.modals.delete.softOption")}</Option>
              <Option value="hard">{t("user.modals.delete.hardOption")}</Option>
            </Select>
          </Stack>
        )}
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.reasonRequired")}
          </Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              isHardDelete
                ? t("user.modals.delete.placeholderHard")
                : t("user.modals.delete.placeholderSoft")
            }
            rows={3}
          />
        </Stack>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">
            {t("user.modals.delete.confirmUsername", { username })}
          </Typography>
          <Input
            value={confirmUsername}
            onChange={(e) => setConfirmUsername(e.target.value)}
            placeholder={username}
            autoCapitalize="none"
          />
        </Stack>
        <Stack spacing={1.25} direction="row">
          <Button color="neutral" expand size="lg" onClick={() => closeModal()}>
            {tCommon("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => deleteUser()}
            disabled={isPending || !reason.trim() || !usernameMatches}
            size="lg"
          >
            {isHardDelete
              ? t("user.modals.delete.hardTitle")
              : t("user.modals.delete.softTitle")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
