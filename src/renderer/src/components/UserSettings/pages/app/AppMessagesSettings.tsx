import { Button } from "@components/Button";
import { QuickReactionEmojiSlots } from "@components/UserSettings/QuickReactionEmojiSlots";
import {
  SettingsSection,
  SettingsSelectField,
  SettingsSliderField,
  SettingsToggleRow
} from "@components/UserSettings/SettingsField";
import { applyChatFontScale } from "@utils/chatFontScale";
import { applyMessageLayout } from "@utils/messageLayout";
import { useAppStore } from "@hooks/useStores";
import { clearRecentEmojisStorage } from "@renderer/hooks/useRecentEmojis";
import {
  messageDisplayLabelKey,
  timestampFormatLabelKey,
} from "@mutualzz/client";
import {
  CHAT_FONT_SCALE_MAX,
  CHAT_FONT_SCALE_MIN,
  CHAT_FONT_SCALE_STEP,
  MESSAGE_DISPLAY_OPTIONS,
  TIMESTAMP_FORMAT_OPTIONS,
  type MessageDisplay,
  type TimestampFormat
} from "@mutualzz/types";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const AppMessagesSettings = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const settings = app.settings;

  if (!settings) return null;

  const extended = settings.extendedSettings;

  const patch = (next: Partial<typeof extended>) => {
    settings.patchExtendedSettings(next);
  };

  const messageDisplayLabel = (value: MessageDisplay) =>
    t(messageDisplayLabelKey(value));

  const applyDisplay = (messageDisplay: MessageDisplay) => {
    applyMessageLayout(
      messageDisplay,
      extended.uiDensity ?? "default",
    );
  };

  const timestampLabel = (value: TimestampFormat) =>
    t(timestampFormatLabelKey(value));

  const clearRecents = () => {
    clearRecentEmojisStorage();
    toast.success(t("composer.clearRecentEmojisDone"));
  };

  return (
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <SettingsSection title={t("textAndChat.title")}>
        <SettingsSelectField
          title={t("textAndChat.messageDisplay")}
          description={t("textAndChat.messageDisplayDescription")}
          value={extended.messageDisplay}
          onChange={(value) => {
            const messageDisplay = value as MessageDisplay;
            applyDisplay(messageDisplay);
            patch({ messageDisplay });
          }}
          options={MESSAGE_DISPLAY_OPTIONS.map((value) => ({
            value,
            label: messageDisplayLabel(value)
          }))}
        />

        <SettingsSliderField
          title={t("textAndChat.chatFontScale")}
          description={t("textAndChat.chatFontScaleDescription")}
          value={extended.chatFontScale}
          min={CHAT_FONT_SCALE_MIN}
          max={CHAT_FONT_SCALE_MAX}
          step={CHAT_FONT_SCALE_STEP}
          formatValueLabel={(value) => `${Math.round(value * 100)}%`}
          onPreviewChange={applyChatFontScale}
          commitDebounceMs={500}
          onChange={(value) => patch({ chatFontScale: value })}
        />

        <SettingsSelectField
          title={t("textAndChat.timestampFormat")}
          description={t("textAndChat.timestampFormatDescription")}
          value={extended.timestampFormat}
          onChange={(value) =>
            patch({ timestampFormat: value as TimestampFormat })
          }
          options={TIMESTAMP_FORMAT_OPTIONS.map((value) => ({
            value,
            label: timestampLabel(value)
          }))}
        />

        <SettingsToggleRow
          title={t("textAndChat.showLinkEmbeds")}
          description={t("textAndChat.showLinkEmbedsDescription")}
          checked={extended.showLinkEmbeds}
          onChange={(checked) => patch({ showLinkEmbeds: checked })}
        />

        <SettingsToggleRow
          title={t("textAndChat.gifAutoplay")}
          description={t("textAndChat.gifAutoplayDescription")}
          checked={extended.gifAutoplay}
          onChange={(checked) => patch({ gifAutoplay: checked })}
        />

        <SettingsToggleRow
          title={t("textAndChat.revealAllSpoilers")}
          description={t("textAndChat.revealAllSpoilersDescription")}
          checked={extended.revealAllSpoilers}
          onChange={(checked) => patch({ revealAllSpoilers: checked })}
        />

        <SettingsToggleRow
          title={t("textAndChat.showTypingIndicators")}
          description={t("textAndChat.showTypingIndicatorsDescription")}
          checked={extended.showTypingIndicators}
          onChange={(checked) => patch({ showTypingIndicators: checked })}
        />

        <SettingsToggleRow
          title={t("textAndChat.sendTypingIndicators")}
          description={t("textAndChat.sendTypingIndicatorsDescription")}
          checked={extended.sendTypingIndicators}
          onChange={(checked) => patch({ sendTypingIndicators: checked })}
        />
      </SettingsSection>

      <SettingsSection title={t("composer.title")}>
        <Stack direction="column" spacing={1.25}>
          <Typography level="body-md" fontWeight="bold">
            {t("composer.quickReactions")}
          </Typography>
          <QuickReactionEmojiSlots
            value={extended.quickReactionEmojis}
            onChange={(quickReactionEmojis) => patch({ quickReactionEmojis })}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
            <Typography level="body-md" fontWeight="bold">
              {t("composer.clearRecentEmojis")}
            </Typography>
            <Typography level="body-sm" textColor="muted">
              {t("composer.clearRecentEmojisDescription")}
            </Typography>
          </Stack>
          <Button variant="outlined" size="sm" onClick={clearRecents}>
            {t("composer.clearRecentEmojisAction")}
          </Button>
        </Stack>

        <SettingsToggleRow
          title={t("composer.showEmojiPicker")}
          description={t("composer.showEmojiPickerDescription")}
          checked={extended.showEmojiPicker}
          onChange={(checked) => patch({ showEmojiPicker: checked })}
        />

        <SettingsToggleRow
          title={t("composer.showGifPicker")}
          description={t("composer.showGifPickerDescription")}
          checked={extended.showGifPicker}
          onChange={(checked) => patch({ showGifPicker: checked })}
        />

        <SettingsToggleRow
          title={t("composer.showStickerPicker")}
          description={t("composer.showStickerPickerDescription")}
          checked={extended.showStickerPicker}
          onChange={(checked) => patch({ showStickerPicker: checked })}
        />

        <SettingsToggleRow
          title={t("composer.showMarkdownToolbar")}
          description={t("composer.showMarkdownToolbarDescription")}
          checked={extended.showMarkdownToolbar}
          onChange={(checked) => patch({ showMarkdownToolbar: checked })}
        />

        <SettingsToggleRow
          title={t("composer.replyWithMention")}
          description={t("composer.replyWithMentionDescription")}
          checked={extended.replyWithMention}
          onChange={(checked) => patch({ replyWithMention: checked })}
        />
      </SettingsSection>
    </Stack>
  );
});
