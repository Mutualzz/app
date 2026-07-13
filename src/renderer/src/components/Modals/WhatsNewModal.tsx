import { Button } from "@components/Button";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import type { APIChangelog } from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const WHATS_NEW_MODAL_ID = "whats-new";

interface WhatsNewModalProps {
  changelog: APIChangelog;
  onAck: () => Promise<void> | void;
}

export const WhatsNewModal = observer(
  ({ changelog, onAck }: WhatsNewModalProps) => {
    const { t } = useTranslation("common");
    const { closeModal } = useModal();

    const handleAck = async () => {
      await onAck();
      closeModal(WHATS_NEW_MODAL_ID);
    };

    return (
      <Paper
        p={0}
        overflow="hidden"
        maxWidth={520}
        width="100%"
        direction="column"
        variant="elevation"
        elevation={2}
      >
        {changelog.imageUrl ? (
          <img
            src={changelog.imageUrl}
            alt=""
            css={{
              display: "block",
              width: "100%",
              maxHeight: 220,
              objectFit: "cover"
            }}
          />
        ) : null}

        <Stack direction="column" spacing={1.5} p={2.5}>
          <Stack direction="column" spacing={0.35}>
            <Typography level="body-xs" textColor="muted">
              {t("whatsNew.title")} ·{" "}
              {dayjs(changelog.publishedAt).format("MMM D, YYYY")}
            </Typography>
            <Typography level="h5" fontWeight={700}>
              {changelog.title}
            </Typography>
          </Stack>

          <Stack
            maxHeight={320}
            overflow="auto"
            direction="column"
            css={{ width: "100%" }}
          >
            <MarkdownRenderer value={changelog.body} />
          </Stack>

          <Button
            variant="solid"
            color="primary"
            onClick={() => void handleAck()}
          >
            {t("gotIt")}
          </Button>
        </Stack>
      </Paper>
    );
  }
);
