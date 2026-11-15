import { InputWithLabel } from "@components/InputWithLabel";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { SPACE_NICKNAME_MAX_LENGTH } from "@mutualzz/validators";
import type { Space } from "@stores/objects/Space";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  space: Space;
  member: SpaceMember;
}

export const MemberNicknameModal = observer(({ space, member }: Props) => {
  const app = useAppStore();
  const { closeModal } = useModal();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const [nickname, setNickname] = useState(member.nickname ?? "");
  const name = member.user?.displayName ?? member.user?.username ?? "";

  const { mutate: save, isPending: saving } = useMutation({
    mutationKey: ["member-nickname", space.id, member.userId],
    mutationFn: async (nextNickname: string) => {
      const ack = await app.gateway.updateSpaceMemberProfile(
        space.id,
        { nickname: nextNickname },
        member.userId
      );
      if (!ack.ok) throw new Error(ack.message);
      return ack;
    },
    onSuccess: () => {
      toast.success(t("spaceProfile.nicknameChanged", { name }));
      closeModal();
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t("spaceProfile.failed")
      )
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 1}
      p={5}
      borderRadius={12}
      direction="column"
      spacing={2.5}
      width={420}
      maxWidth="100%"
    >
      <Typography level="h5" fontWeight="bold">
        {t("spaceProfile.changeNicknameTitle", { name })}
      </Typography>
      <InputWithLabel
        name="memberNickname"
        label={t("spaceProfile.nickname")}
        value={nickname}
        maxLength={SPACE_NICKNAME_MAX_LENGTH}
        placeholder={member.user?.displayName ?? ""}
        onChange={(event) => setNickname(event.target.value)}
      />
      <Stack direction="row" spacing={1.25}>
        <Button
          color="neutral"
          expand
          disabled={saving}
          onClick={() => closeModal()}
        >
          {tCommon("cancel")}
        </Button>
        {member.nickname && (
          <Button
            color="neutral"
            expand
            disabled={saving}
            onClick={() => save("")}
          >
            {t("spaceProfile.resetNickname")}
          </Button>
        )}
        <Button
          color="primary"
          expand
          loading={saving}
          onClick={() => save(nickname)}
        >
          {t("spaceProfile.save")}
        </Button>
      </Stack>
    </Paper>
  );
});
