import { CustomStatusEmojiPicker } from "@components/CustomStatus/CustomStatusEmojiPicker";
import { CustomStatusModalPreview } from "@components/CustomStatus/CustomStatusModalPreview";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import {
  Button,
  Input,
  Option,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { STATUS_DURATION_OPTIONS } from "@utils/statusDurations";
import {
  formatCustomStatusClearLabel,
  hasCustomStatusContent
} from "@utils/customStatus";
import type { PresenceActivityEmoji } from "@mutualzz/types";
import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const CUSTOM_STATUS_MODAL_ID = "custom-status";

const MAX_CUSTOM_STATUS_LENGTH = 128;
const STATUS_PLACEHOLDER = "Today I learned...";

const toDurationValue = (durationMs: number | null) =>
  durationMs == null ? "forever" : String(durationMs);

export const CustomStatusModal = observer(() => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { closeModal } = useModal();

  const [text, setText] = useState(app.customStatus.effectiveText);
  const [emoji, setEmoji] = useState<PresenceActivityEmoji | null>(
    app.customStatus.effectiveEmoji
  );
  const [durationValue, setDurationValue] = useState(
    toDurationValue(STATUS_DURATION_OPTIONS[4]?.durationMs ?? 24 * 60 * 60_000)
  );

  const trimmedText = text.trim();
  const canSave =
    hasCustomStatusContent(trimmedText, emoji) &&
    trimmedText.length <= MAX_CUSTOM_STATUS_LENGTH;

  const inputBorder = formatColor(theme.typography.colors.muted, {
    alpha: 0.28
  });
  const inputFocusBorder = formatColor(theme.colors.primary);

  const save = () => {
    if (!canSave) return;

    if (durationValue === "forever") {
      app.gateway.clearScheduledCustomStatus();
      app.gateway.setCustomStatus(trimmedText, {
        persist: true,
        emoji
      });
      closeModal(CUSTOM_STATUS_MODAL_ID);
      return;
    }

    app.gateway.scheduleCustomStatus({
      text: trimmedText,
      emoji,
      durationMs: Number(durationValue)
    });
    closeModal(CUSTOM_STATUS_MODAL_ID);
  };

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 2}
      width="27.5rem"
      maxWidth="calc(100vw - 2rem)"
      borderRadius={14}
      direction="column"
      overflow="hidden"
      color="neutral"
      transparency={0}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        pt={2.5}
        pb={1.25}
      >
        <Typography level="h5" fontWeight={700}>
          Set your status
        </Typography>
        <IconButton
          variant="plain"
          color="neutral"
          size="sm"
          onClick={() => closeModal(CUSTOM_STATUS_MODAL_ID)}
          aria-label="Close"
          css={{ opacity: 0.7 }}
        >
          <XIcon size={18} />
        </IconButton>
      </Stack>

      <Stack direction="column" px={2.5} spacing={2.5} pb={2.5}>
        <CustomStatusModalPreview text={text} emoji={emoji} />

        <Stack direction="column" spacing={0.75}>
          <Typography level="body-sm" fontWeight={700}>
            Status
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            px={0.75}
            py={0.25}
            borderRadius={8}
            css={{
              border: `1px solid ${inputBorder}`,
              transition: "border-color 0.15s ease",
              "&:focus-within": {
                borderColor: inputFocusBorder
              }
            }}
          >
            <CustomStatusEmojiPicker value={emoji} onChange={setEmoji} />
            <Input
              variant="plain"
              placeholder={STATUS_PLACEHOLDER}
              fullWidth
              color="neutral"
              autoComplete="off"
              autoFocus
              value={text}
              maxLength={MAX_CUSTOM_STATUS_LENGTH}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave) save();
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        px={2.5}
        pb={2.5}
        spacing={1.5}
      >
        <Select
          value={durationValue}
          variant="plain"
          color="neutral"
          size="sm"
          onValueChange={(value) => {
            if (typeof value === "string") setDurationValue(value);
          }}
          css={{
            flex: 1,
            minWidth: 0,
            maxWidth: "calc(100% - 6.5rem)"
          }}
          endDecorator={
            <CaretDownIcon
              size={14}
              weight="bold"
              color={formatColor(theme.typography.colors.muted)}
            />
          }
        >
          {STATUS_DURATION_OPTIONS.map((option) => (
            <Option
              key={option.label}
              value={toDurationValue(option.durationMs)}
            >
              {formatCustomStatusClearLabel(option.durationMs)}
            </Option>
          ))}
        </Select>

        <Button
          disabled={!canSave}
          onClick={save}
          size="md"
          css={{ minWidth: "6rem", flexShrink: 0 }}
        >
          Save
        </Button>
      </Stack>
    </Paper>
  );
});
