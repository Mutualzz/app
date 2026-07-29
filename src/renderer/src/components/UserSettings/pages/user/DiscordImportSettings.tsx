import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { SettingsSection } from "@components/UserSettings/SettingsField";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import { Divider, Input, Stack, Typography } from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  DiscordLogoIcon,
  HashIcon,
  SmileyIcon,
  UsersThreeIcon
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isElectron, openExternalLink } from "@utils/index";

interface ImportPreview {
  channels: { name: string; type: number | null }[];
  roles: { name: string }[];
  emojis: { name: string }[];
  skippedChannelCount: number;
}

function PreviewStat({
  icon,
  value
}: {
  icon: ReactNode;
  value: number;
}) {
  return (
    <Paper
      variant="soft"
      borderRadius={8}
      px={2.5}
      py={2}
      flex={1}
      minWidth={96}
      alignItems="center"
      justifyContent="center"
      spacing={1}
      direction="column"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography level="title-md" fontWeight="bold">
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}

export const DiscordImportSettings = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const [guildId, setGuildId] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLinked = Boolean(account?.discordId);

  const botInviteQuery = useQuery({
    queryKey: ["discord-bot-invite"],
    queryFn: () =>
      app.rest.get<{ url: string }>("/@me/discord-import/bot-invite"),
    staleTime: Infinity,
    enabled: isLinked
  });

  const { mutate: loadPreview, isPending: previewing } = useMutation({
    mutationFn: () =>
      app.rest.post<ImportPreview>("/@me/discord-import/preview", { guildId }),
    onSuccess: (data) => {
      setPreview(data);
      setInviteCode(null);
      setError(null);
    },
    onError: (err: HttpException) => setError(err.message)
  });

  const { mutate: runImport, isPending: importing } = useMutation({
    mutationFn: () =>
      app.rest.post<{ inviteCode: string }>("/@me/discord-import/execute", {
        guildId,
        spaceName
      }),
    onSuccess: ({ inviteCode: code }) => {
      setInviteCode(code);
      setError(null);
    },
    onError: (err: HttpException) => setError(err.message)
  });

  const handleLinkDiscord = () => {
    sessionStorage.setItem("settings-return", "discord-import");
    void app.rest
      .get<{ url: string }>(
        `/@me/discord/link?client=${isElectron ? "desktop" : "web"}`
      )
      .then(({ url }) => {
        void openExternalLink(url);
      });
  };

  const handleUnlinkDiscord = () => {
    void app.rest.delete("/@me/discord").then(() => {
      if (account) account.discordId = null;
      setPreview(null);
      setInviteCode(null);
      setError(null);
    });
  };

  const botInviteUrl = botInviteQuery.data?.url;
  const canPreview = Boolean(guildId.trim());
  const canImport = canPreview && Boolean(spaceName.trim()) && Boolean(preview);

  if (!account) return null;

  return (
    <Stack spacing={3.5} pt={2.5} pb={5} mx={20} direction="column">
      <SettingsSection description={t("discordImport.intro")}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
            <DiscordLogoIcon size={28} weight="fill" />
            <Stack direction="column" spacing={0.5} minWidth={0}>
              <Typography level="body-md" fontWeight="bold">
                {t("discord.linkDiscord")}
              </Typography>
              <Typography level="body-sm" textColor="muted">
                {isLinked
                  ? t("discordImport.linkedStatus")
                  : t("discordImport.linkHint")}
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant={isLinked ? "outlined" : "solid"}
            size="sm"
            color={isLinked ? "neutral" : "primary"}
            startDecorator={!isLinked ? <ArrowSquareOutIcon /> : undefined}
            onClick={() => {
              if (isLinked) handleUnlinkDiscord();
              else handleLinkDiscord();
            }}
          >
            {isLinked ? t("discord.unlinkDiscord") : t("discord.linkDiscord")}
          </Button>
        </Stack>
      </SettingsSection>

      {isLinked ? (
        <>
          <SettingsSection>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
                <DiscordLogoIcon size={28} weight="fill" />
                <Stack direction="column" spacing={0.5} minWidth={0}>
                  <Typography level="body-md" fontWeight="bold">
                    {t("discordImport.botInvite")}
                  </Typography>
                  <Typography level="body-sm" textColor="muted">
                    {t("discordImport.botInviteHint")}
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="solid"
                size="sm"
                disabled={!botInviteUrl}
                loading={botInviteQuery.isPending}
                startDecorator={<ArrowSquareOutIcon />}
                onClick={() => {
                  if (botInviteUrl) void openExternalLink(botInviteUrl);
                }}
              >
                {tCommon("open")}
              </Button>
            </Stack>
          </SettingsSection>

          <SettingsSection>
            <Stack spacing={2.5} direction="column">
              <Stack spacing={1} direction="column">
                <Typography level="body-md" fontWeight="bold">
                  {t("discordImport.guildId")}
                </Typography>
                <Typography level="body-sm" textColor="muted">
                  {t("discordImport.guildIdHint")}
                </Typography>
                <Input
                  placeholder={t("discordImport.guildIdPlaceholder")}
                  value={guildId}
                  onChange={(e) => {
                    setGuildId(e.target.value);
                    setPreview(null);
                    setInviteCode(null);
                    setError(null);
                  }}
                />
              </Stack>

              <Divider textColor="muted" css={{ opacity: 0.35 }} />

              <Stack spacing={1} direction="column">
                <Typography level="body-md" fontWeight="bold">
                  {t("discordImport.spaceName")}
                </Typography>
                <Input
                  placeholder={t("discordImport.spaceNamePlaceholder")}
                  value={spaceName}
                  onChange={(e) => {
                    setSpaceName(e.target.value);
                    setInviteCode(null);
                    setError(null);
                  }}
                />
              </Stack>
            </Stack>
          </SettingsSection>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              disabled={!canPreview}
              loading={previewing}
              onClick={() => loadPreview()}
            >
              {t("discordImport.preview")}
            </Button>
            <Button
              variant="solid"
              disabled={!canImport}
              loading={importing}
              onClick={() => runImport()}
            >
              {t("discordImport.import")}
            </Button>
          </Stack>

          {error ? (
            <Paper variant="soft" color="danger" borderRadius={10} px={3} py={2.5}>
              <Typography level="body-sm">{error}</Typography>
            </Paper>
          ) : null}

          {preview ? (
            <SettingsSection title={t("discordImport.previewTitle")}>
              <Stack spacing={2} direction="column">
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <PreviewStat
                    icon={<HashIcon size={18} />}
                    value={preview.channels.length}
                  />
                  <PreviewStat
                    icon={<UsersThreeIcon size={18} />}
                    value={preview.roles.length}
                  />
                  <PreviewStat
                    icon={<SmileyIcon size={18} />}
                    value={preview.emojis.length}
                  />
                </Stack>
                <Typography level="body-sm" textColor="muted">
                  {t("discordImport.previewSummary", {
                    channels: preview.channels.length,
                    roles: preview.roles.length,
                    emojis: preview.emojis.length,
                    skipped: preview.skippedChannelCount
                  })}
                </Typography>
              </Stack>
            </SettingsSection>
          ) : null}

          {inviteCode ? (
            <Paper
              variant="soft"
              color="success"
              borderRadius={10}
              px={3}
              py={2.5}
              spacing={1.5}
              direction="row"
              alignItems="center"
            >
              <CheckCircleIcon size={22} weight="fill" />
              <Typography level="body-sm">
                {t("discordImport.inviteReady", { code: inviteCode })}
              </Typography>
            </Paper>
          ) : null}
        </>
      ) : null}
    </Stack>
  );
});
