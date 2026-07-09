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

export const StaffUserWarnConfirm = observer(
  ({ userId, username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const [reason, setReason] = useState("");

    const { mutate: warnUser, isPending } = useMutation({
      mutationKey: ["staff-warn-user", userId],
      mutationFn: () =>
        app.rest.post<{ success: boolean; emailSent: boolean }>(
          `/staff/users/${userId}/warn`,
          { reason: reason.trim() }
        ),
      onSuccess: (data) => {
        onSuccess();
        closeModal();
        toast.success(
          data.emailSent
            ? "Warning sent and emailed to the user"
            : "Warning recorded, but the email failed to send"
        );
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to warn user");
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
          Warn User
        </Typography>
        <Typography>
          This sends <b>@{username}</b> a warning email and logs it to their
          audit trail. It doesn't change their account state.
        </Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">Reason (required)</Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what the warning is for"
            rows={3}
          />
        </Stack>
        <Stack spacing={1.25} direction="row">
          <Button color="neutral" expand size="lg" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => warnUser()}
            disabled={isPending || !reason.trim()}
            size="lg"
          >
            Send Warning
          </Button>
        </Stack>
      </Paper>
    );
  }
);
