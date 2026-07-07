import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { useMutation } from "@tanstack/react-query";
import { Paper } from "@components/Paper";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useModal } from "@contexts/Modal.context";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  onSuccess: () => void;
}

export const StaffUserForceLogoutConfirm = observer(
  ({ userId, username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const [reason, setReason] = useState("");

    const { mutate: forceLogout, isPending } = useMutation({
      mutationKey: ["staff-force-logout", userId],
      mutationFn: async () =>
        app.rest.post(`/staff/users/${userId}/force-logout`, {
          reason: reason.trim() || undefined
        }),
      onSuccess: () => {
        onSuccess();
        closeModal();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to force logout user"
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
          Force Logout
        </Typography>
        <Typography mb={2.5}>
          Are you sure you want to sign <b>@{username}</b> out of every
          session? They will need to log back in, but the account stays
          enabled.
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
            onClick={() => forceLogout()}
            disabled={isPending}
            size="lg"
          >
            Force Logout
          </Button>
        </Stack>
      </Paper>
    );
  }
);
