import { observer } from "mobx-react-lite";
import { Paper } from "../Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { SpaceMember } from "@stores/objects/SpaceMember";
import { InputWithLabel } from "@components/InputWithLabel";
import { useModal } from "@contexts/Modal.context";
import { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  space: Space;
  member: SpaceMember;
}

export const MemberKick = observer(({ space, member }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();

  const [reason, setReason] = useState<string | null>(null);

  const { mutate: kickMember, isPending: kickingMember } = useMutation({
    mutationKey: ["member-kick", member.id],
    mutationFn: () =>
      app.rest.post(`/spaces/${space.id}/members/${member.id}/kick`, {
        reason: reason ?? "No reason provided"
      }),
    onSuccess: () => {
      toast.success(`Kicked ${member.user?.username} from space`);
      closeModal();
    }
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      justifyContent="space-between"
      spacing={1.25}
    >
      <Stack direction="column" spacing={5}>
        <Typography level="h5" fontWeight="bold">
          Kick {member.user?.username} from space
        </Typography>
        <Typography level="body-sm" color="text.secondary">
          Are you sure you want to kick @{member.user?.username} from the space?
          They will need an invite to rejoin.
        </Typography>

        <InputWithLabel
          onChange={(e) => setReason(e.target.value)}
          value={reason || ""}
          name="reason"
          label="Reason for Kick"
          type="text"
        />
      </Stack>
      <Stack direction="row" spacing={1.25}>
        <Button
          color="neutral"
          expand
          disabled={kickingMember}
          onClick={() => closeModal()}
        >
          Cancel
        </Button>
        <Button
          color="danger"
          expand
          onClick={() => kickMember()}
          disabled={kickingMember}
        >
          Kick
        </Button>
      </Stack>
    </Paper>
  );
});
