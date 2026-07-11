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
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  space: Space;
  member: SpaceMember;
}

export const MemberKick = observer(({ space, member }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");

  const [reason, setReason] = useState<string | null>(null);
  const name = member.user?.username ?? "";

  const { mutate: kickMember, isPending: kickingMember } = useMutation({
    mutationKey: ["member-kick", member.id],
    mutationFn: () =>
      app.rest.post(`/spaces/${space.id}/members/${member.id}/kick`, {
        reason: reason ?? t("bans.noReason")
      }),
    onSuccess: () => {
      toast.success(t("moderation.kickSuccess", { name }));
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
          {t("moderation.kickFromSpaceTitle", { name })}
        </Typography>
        <Typography level="body-sm" textColor="secondary">
          {t("moderation.kickBody", { name })}
        </Typography>

        <InputWithLabel
          onChange={(e) => setReason(e.target.value)}
          value={reason || ""}
          name="reason"
          label={t("moderation.reasonForKick")}
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
          {tCommon("cancel")}
        </Button>
        <Button
          color="danger"
          expand
          onClick={() => kickMember()}
          disabled={kickingMember}
        >
          {t("actions.kick")}
        </Button>
      </Stack>
    </Paper>
  );
});
