import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Textarea, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_CONTENT_LENGTH = 2000;

interface Props {
  modalId: string;
  scheduledMessageId: string;
}

export const EditScheduledMessageModal = observer(
  ({ modalId, scheduledMessageId }: Props) => {
    const app = useAppStore();
    const { closeModal } = useModal();
    const { t } = useTranslation("chat");
    const { t: tCommon } = useTranslation("common");

    const scheduled = app.scheduledMessages.get(scheduledMessageId);
    const [content, setContent] = useState(scheduled?.content ?? "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      const ack = await app.scheduledMessages.edit(scheduledMessageId, {
        content: content.trim()
      });
      setSaving(false);
      if (ack.ok) closeModal(modalId);
    };

    return (
      <Paper
        surfaceRole="modal"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        spacing={2}
        css={{ width: "min(480px, calc(100vw - 32px))" }}
      >
        <Typography level="h6" fontWeight="bold">
          {t("scheduledMessages.editTitle")}
        </Typography>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={5}
          maxLength={MAX_CONTENT_LENGTH}
        />
        <Stack direction="row" spacing={1.25}>
          <Button
            color="neutral"
            expand
            disabled={saving}
            onClick={() => closeModal(modalId)}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            color="primary"
            expand
            disabled={saving || !scheduled}
            onClick={() => void save()}
          >
            {t("scheduledMessages.save")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
