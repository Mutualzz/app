import { observer } from "mobx-react-lite";
import { Channel } from "@stores/objects/Channel";
import { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@hooks/useStores";
import { useDraft } from "@hooks/useDraft";
import { Box, ButtonGroup, Divider, Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { InputWithLabel } from "@components/InputWithLabel";
import { APIChannel, ChannelType } from "@mutualzz/types";
import { normalizeJSON } from "@mutualzz/client";
import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
  channel: Channel;
}

type ChannelEditable = Pick<APIChannel, "name" | "topic">;

const pickEditable = (channel: Channel): ChannelEditable => {
  const json = channel.toJSON();
  return {
    name: json.name,
    topic: json.topic ?? ""
  };
};

export const ChannelOverviewSettings = observer(({ space, channel }: Props) => {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("space");
  const app = useAppStore();

  const { draft, dirty, reset, setDraft, diff, commitBase } =
    useDraft<ChannelEditable>(() => pickEditable(channel), [channel.id]);

  const { mutate: updateChannel, isPending: updatingChannel } = useMutation({
    mutationKey: ["update-channel", channel.id],
    mutationFn: async () => {
      const patch = normalizeJSON(diff());
      if (Object.keys(patch).length === 0) return channel.toJSON();

      return app.rest.patch<APIChannel>(`/channels/${channel.id}`, patch);
    },
    onSuccess: (data) => {
      space.updateChannel(data);
      const nextDraft = pickEditable(channel);
      setDraft(nextDraft);
      commitBase(nextDraft);
    },
    onError: (error) => {
      console.error(error);
    }
  });

  return (
    <Stack direction="column" spacing={5} pt={2.5} flex={1} minHeight={0}>
      <Stack direction="column" spacing={5} flex={1}>
        <InputWithLabel
          name="name"
          label={
            channel.type === ChannelType.Category
              ? t("channels.createCategory.name")
              : t("channels.create.name")
          }
          required
          type="text"
          value={draft.name ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setDraft((prev) => ({ ...prev, name: value }));
          }}
        />

        {channel.type !== ChannelType.Category && (
          <>
            <Divider css={{ opacity: 0.5 }} />
            <Stack direction="column" spacing={1.25}>
              <Typography
                fontWeight={500}
                level={{ xs: "body-sm", sm: "body-md" }}
              >
                {t("channels.topic")}
              </Typography>
              <MarkdownInput
                value={draft.topic ?? ""}
                gifPicker={false}
                stickerPicker={false}
                onChange={(value) => {
                  setDraft((prev) => ({ ...prev, topic: value }));
                }}
              />
              <Typography level="body-xs" textColor="muted">
                {t("channels.topicHint")}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>

      {dirty && (
        <Box
          mt="auto"
          position="sticky"
          bottom={0}
          zIndex={10}
          display="flex"
          justifyContent="center"
        >
          <Paper
            direction="row"
            variant="elevation"
            py={2}
            px={4}
            elevation={app.settings?.preferEmbossed ? 5 : 3}
            justifyContent="space-between"
            alignItems="center"
            borderRadius={12}
            width="100%"
            maxWidth="min(960px, calc(100% - 32px))"
          >
            <Typography level="body-sm">{t("roles.unsavedChanges")}</Typography>
            <ButtonGroup disabled={updatingChannel || !dirty} spacing={10}>
              <Button color="danger" variant="plain" onClick={reset}>
                {tCommon("reset")}
              </Button>
              <Button
                variant="solid"
                color="success"
                onClick={() => updateChannel()}
              >
                {tCommon("saveChanges")}
              </Button>
            </ButtonGroup>
          </Paper>
        </Box>
      )}
    </Stack>
  );
});
