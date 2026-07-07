import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Button, Option, Select, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "@contexts/Modal.context";
import type { HttpException, ReportReason, ReportTargetType } from "@mutualzz/types";
import { reportReasons } from "@mutualzz/validators";
import { toast } from "react-toastify";

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  contentLabel: string;
  modalId: string;
}

const reasonLabels: Record<ReportReason, string> = {
  spam: "Spam",
  harassment: "Harassment or Abuse",
  hate_speech: "Hate Speech",
  nsfw: "NSFW / Inappropriate Content",
  self_harm: "Self-Harm or Suicide",
  impersonation: "Impersonation",
  misinformation: "Misinformation",
  other: "Other"
};

export const ReportContentModal = observer(
  ({ targetType, targetId, contentLabel, modalId }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
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
        toast.success("Report submitted. Thank you for helping keep things safe.");
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
          Report {contentLabel}
        </Typography>
        <Typography textColor="secondary">
          Reports are reviewed by staff. Choose the reason that best fits.
        </Typography>
        <Select
          value={reason}
          onValueChange={(v) => setReason(v as ReportReason)}
        >
          {reportReasons.map((r) => (
            <Option key={r} value={r}>
              {reasonLabels[r]}
            </Option>
          ))}
        </Select>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail (optional)"
          rows={3}
        />
        <Stack direction="row" spacing={1.25}>
          <Button
            color="neutral"
            expand
            disabled={isPending}
            onClick={() => closeModal(modalId)}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            expand
            disabled={isPending}
            onClick={() => submitReport()}
          >
            Submit Report
          </Button>
        </Stack>
      </Paper>
    );
  }
);
