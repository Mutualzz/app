import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Option, Select, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import type { HttpException, ReportReason, ReportTargetType } from "@mutualzz/types";
import { reportReasons } from "@mutualzz/validators";
import { reportReasonKeys } from "@mutualzz/i18n";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  contentLabel: string;
  modalId: string;
}

export const ReportContentModal = observer(
  ({ targetType, targetId, contentLabel, modalId }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("common");
    const [reason, setReason] = useState<ReportReason>("spam");
    const [description, setDescription] = useState("");

    const { mutate: submitReport, isPending } = useMutation({
      mutationKey: ["create-report", targetType, targetId],
      mutationFn: () =>
        app.rest.post("/reports", {
          targetType,
          targetId,
          reason,
          description: description.trim() || undefined
        }),
      onSuccess: () => {
        toast.success(t("report.success"));
        closeModal(modalId);
      },
      onError: (err: HttpException) => {
        toast.error(err.message);
      }
    });

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        spacing={1.25}
        width="25vw"
      >
        <Typography level="h6" fontWeight="bold">
          {t("report.title", { label: contentLabel })}
        </Typography>
        <Typography textColor="secondary">
          {t("report.description")}
        </Typography>
        <Select
          value={reason}
          onValueChange={(v) => setReason(v as ReportReason)}
        >
          {reportReasons.map((r) => (
            <Option key={r} value={r}>
              {t(reportReasonKeys[r])}
            </Option>
          ))}
        </Select>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("report.detailsPlaceholder")}
          rows={3}
        />
        <Stack direction="row" spacing={1.25}>
          <Button
            color="neutral"
            expand
            disabled={isPending}
            onClick={() => closeModal(modalId)}
          >
            {t("cancel")}
          </Button>
          <Button
            color="danger"
            expand
            disabled={isPending}
            onClick={() => submitReport()}
          >
            {t("report.submit")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
