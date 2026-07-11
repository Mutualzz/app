import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  Button,
  Option,
  Radio,
  Select,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import { SpaceMember } from "@stores/objects/SpaceMember";
import { Space } from "@stores/objects/Space";
import { useMemo, useState } from "react";
import { InputWithLabel } from "@components/InputWithLabel";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import { HttpException } from "@mutualzz/types";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
  member: SpaceMember;
}

export const MemberBan = observer(({ space, member }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("space");
  const { t: tCommon } = useTranslation("common");
  const [reason, setReason] = useState<string | null>(null);
  const [deleteMessageTimeframe, setDeleteMessageTimeframe] =
    useState<number>(3600);
  const [otherSelected, setOtherSelected] = useState(false);
  const [errors, setErrors] = useState<{
    reason: string | null;
  }>({
    reason: null
  });

  const { closeModal } = useModal();

  const banReasons = useMemo(
    () => ({
      suspicious: t("moderation.banReasons.suspicious"),
      compromised: t("moderation.banReasons.compromised"),
      breakingRules: t("moderation.banReasons.breakingRules"),
      other: t("moderation.banReasons.other")
    }),
    [t]
  );

  const deleteMessageOptions = useMemo(
    () => [
      { label: t("moderation.deleteMessages.dontDeleteMessages"), value: 0 },
      { label: t("moderation.deleteMessages.lastHour"), value: 3600 },
      { label: t("moderation.deleteMessages.last24Hours"), value: 86400 },
      { label: t("moderation.deleteMessages.last7Days"), value: 604800 },
      { label: t("moderation.deleteMessages.deleteAllMessages"), value: -1 }
    ],
    [t]
  );

  const { mutate: banMember, isPending: isBanning } = useMutation({
    mutationKey: ["ban_member", space.id, member.id],
    mutationFn: () =>
      app.rest.put(`/spaces/${space.id}/members/${member.id}/ban`, {
        reason,
        deleteMessageTimeframe
      }),
    onSuccess: () => {
      closeModal();
    },
    onError: (err: HttpException) => {
      err.errors?.forEach((e) => {
        setErrors((prev) => ({ ...prev, [e.path]: e.message }));
      });
    }
  });

  const name = member.user?.displayName ?? member.user?.username ?? "";

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
        <Typography level="h6" textColor="secondary" fontWeight="bold">
          {t("moderation.banTitle", { name })}
        </Typography>
        <Typography fontWeight="bold">{t("moderation.reasonForBan")}</Typography>
        <Stack direction="column" justifyContent="center" spacing={2.5}>
          <Radio
            color="neutral"
            value={banReasons.suspicious}
            label={banReasons.suspicious}
            checked={reason === banReasons.suspicious}
            onChange={() => {
              setReason(banReasons.suspicious);
              setOtherSelected(false);
            }}
            size={18}
          />
          <Radio
            color="neutral"
            value={banReasons.compromised}
            label={banReasons.compromised}
            checked={reason === banReasons.compromised}
            onChange={() => {
              setReason(banReasons.compromised);
              setOtherSelected(false);
            }}
            size={18}
          />
          <Radio
            color="neutral"
            value={banReasons.breakingRules}
            label={banReasons.breakingRules}
            checked={reason === banReasons.breakingRules}
            onChange={() => {
              setReason(banReasons.breakingRules);
              setOtherSelected(false);
            }}
            size={18}
          />
          <Radio
            color="neutral"
            value={banReasons.other}
            label={banReasons.other}
            checked={otherSelected}
            onChange={() => {
              setReason("");
              setOtherSelected(true);
            }}
            size={18}
          />
          {otherSelected && (
            <InputWithLabel
              onChange={(e) => setReason(e.target.value)}
              type="text"
              name="reason"
              value={reason || ""}
            />
          )}
          {errors.reason && (
            <Typography variant="plain" color="danger">
              {errors.reason}
            </Typography>
          )}
        </Stack>
        <Stack direction="column" spacing={2.5}>
          <Typography>{t("moderation.deleteRecentMessages")}</Typography>
          <Select
            value={deleteMessageTimeframe}
            onValueChange={(v) => setDeleteMessageTimeframe(Number(v))}
          >
            {deleteMessageOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Stack>
        <Stack direction="row" spacing={1.25}>
          <Button
            color="neutral"
            expand
            disabled={isBanning}
            onClick={() => closeModal()}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            onClick={() => banMember()}
            disabled={isBanning}
          >
            {t("actions.ban")}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
});
