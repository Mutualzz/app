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
import { toast } from "react-toastify";

interface Props {
  userId: string;
  username: string;
  onSuccess: (user: APIPrivateUser) => void;
}

const durationOptions = [
  { value: 1, label: "1 hour" },
  { value: 6, label: "6 hours" },
  { value: 24, label: "1 day" },
  { value: 72, label: "3 days" },
  { value: 168, label: "7 days" },
  { value: 720, label: "30 days" }
];

export const StaffUserRestrictConfirm = observer(
  ({ userId, username, onSuccess }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
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
          err instanceof Error ? err.message : "Failed to restrict user"
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
          Restrict User
        </Typography>
        <Typography>
          <b>@{username}</b> won&apos;t be able to send messages, create
          posts, or comment until the restriction expires or is lifted early.
        </Typography>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">Duration</Typography>
          <Select
            value={hours}
            onValueChange={(v) => setHours(Number(v))}
          >
            {durationOptions.map((o) => (
              <Option key={o.value} value={o.value}>
                {o.label}
              </Option>
            ))}
          </Select>
        </Stack>
        <Stack direction="column" spacing={1.25}>
          <Typography fontWeight="bold">Reason (required)</Typography>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what this restriction is for"
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
            onClick={() => restrictUser()}
            disabled={isPending || !reason.trim()}
            size="lg"
          >
            Restrict
          </Button>
        </Stack>
      </Paper>
    );
  }
);
