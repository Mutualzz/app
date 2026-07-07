import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import type { APIPrivateUser } from "@mutualzz/types";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  disable: boolean;
  onSuccess: (user: APIPrivateUser) => void;
}

export const StaffUserDisableConfirm = observer(
  ({ userId, username, disable, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const [reason, setReason] = useState("");

    const { mutate: setDisabled, isPending } = useMutation({
      mutationKey: ["staff-set-disabled", userId, disable],
      mutationFn: async () =>
        app.rest.patch<APIPrivateUser>(`/staff/users/${userId}/disabled`, {
          disabled: disable,
          reason: reason.trim() || undefined
        }),
      onSuccess: (user) => {
        onSuccess(user);
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to update user"
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
      >
        <Typography level="h5" fontWeight="bold" marginBottom={2}>
          {disable ? "Disable Account" : "Enable Account"}
        </Typography>
        <Typography mb={2.5}>
          Are you sure you want to {disable ? "disable" : "re-enable"}{" "}
          <b>@{username}</b>&apos;s account?
          {disable &&
            " They will be signed out and unable to log back in until re-enabled."}
        </Typography>
        <Typography fontWeight="bold" mb={1}>
          Reason (optional)
        </Typography>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add context for the audit log"
          rows={3}
          css={{ marginBottom: "1.25rem" }}
        />
        <Stack spacing={1.25} direction="row">
          <Button
            color="neutral"
            expand
            size="lg"
            onClick={() => closeModal()}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => setDisabled()}
            disabled={isPending}
            size="lg"
          >
            {disable ? "Disable Account" : "Enable Account"}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
