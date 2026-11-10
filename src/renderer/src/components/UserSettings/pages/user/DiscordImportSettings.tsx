import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type {
  DiscordImportProgressPayload,
  DiscordImportStage,
  HttpException
} from "@mutualzz/types";
import { ChannelType } from "@mutualzz/types";
import {
  CircularProgress,
  Divider,
  Input,
  LinearProgress,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CircleIcon,
  CopyIcon,
  DiscordLogoIcon,
  HashIcon,
  RobotIcon,
  SmileyIcon,
  SpeakerHighIcon,
  UsersThreeIcon,
  WarningCircleIcon
} from "@phosphor-icons/react";
import type { DiscordImportResult } from "@stores/Gateway.store";
import { Invite } from "@stores/objects/Invite";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isElectron, openExternalLink } from "@utils/index";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ImportPreview {
  guild: { name: string; iconUrl: string | null };
  channels: {
    id: string;
    name: string;
    type: number | null;
    parentId: string | null;
  }[];
  roles: { id: string; name: string; color: string | null }[];
  emojis: { id: string; name: string; url: string }[];
  skippedChannelCount: number;
  skippedEmojiCount: number;
}

type ImportProgressState = Record<
  DiscordImportStage,
  { completed: number; total: number } | undefined
>;

const IMPORT_STAGES: { stage: DiscordImportStage; weight: number }[] = [
  { stage: "fetching", weight: 5 },
  { stage: "emojis", weight: 35 },
  { stage: "space", weight: 5 },
  { stage: "channels", weight: 25 },
  { stage: "roles", weight: 20 },
  { stage: "finishing", weight: 10 }
];

const EMPTY_PROGRESS: ImportProgressState = {
  fetching: undefined,
  emojis: undefined,
  space: undefined,
  channels: undefined,
  roles: undefined,
  finishing: undefined
};

const isStageDone = (stageProgress?: { completed: number; total: number }) =>
  Boolean(stageProgress && stageProgress.completed >= stageProgress.total);

const overallPercent = (progress: ImportProgressState) => {
  const totalWeight = IMPORT_STAGES.reduce(
    (sum, { weight }) => sum + weight,
    0
  );
  const earnedWeight = IMPORT_STAGES.reduce((sum, { stage, weight }) => {
    const stageProgress = progress[stage];
    if (!stageProgress) return sum;
    if (stageProgress.total === 0) return sum + weight;
    return sum + (weight * stageProgress.completed) / stageProgress.total;
  }, 0);
  return Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
};

function StepCard({
  step,
  title,
  description,
  done,
  disabled,
  action,
  children
}: {
  step: number;
  title: string;
  description?: string;
  done?: boolean;
  disabled?: boolean;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Paper
      borderRadius={12}
      px={3}
      py={2.5}
      direction="column"
      spacing={2}
      css={{ opacity: disabled ? 0.5 : 1, transition: "opacity 150ms" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
          {done ? (
            <CheckCircleIcon size={28} weight="fill" color="#3ba55d" />
          ) : (
            <Stack
              width={28}
              height={28}
              alignItems="center"
              justifyContent="center"
              css={{
                borderRadius: "50%",
                border: "2px solid currentColor",
                flexShrink: 0
              }}
            >
              <Typography level="body-sm" fontWeight="bold">
                {step}
              </Typography>
            </Stack>
          )}
          <Stack direction="column" spacing={0.5} minWidth={0}>
            <Typography level="body-md" fontWeight="bold">
              {title}
            </Typography>
            {description ? (
              <Typography level="body-sm" textColor="muted">
                {description}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function PreviewStat({
  icon,
  value,
  label
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Paper
      variant="soft"
      borderRadius={8}
      px={2.5}
      py={1.5}
      flex={1}
      minWidth={110}
      direction="column"
      alignItems="center"
      spacing={0.5}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography level="title-md" fontWeight="bold">
          {value}
        </Typography>
      </Stack>
      <Typography level="body-xs" textColor="muted">
        {label}
      </Typography>
    </Paper>
  );
}

function ChannelTreePreview({
  channels
}: {
  channels: ImportPreview["channels"];
}) {
  return (
    <Stack
      direction="column"
      spacing={0.25}
      maxHeight={260}
      css={{ overflowY: "auto" }}
      pr={1}
    >
      {channels.map((channel) => {
        if (channel.type === ChannelType.Category)
          return (
            <Stack
              key={channel.id}
              direction="row"
              alignItems="center"
              spacing={0.5}
              pt={1}
            >
              <CaretDownIcon size={12} />
              <Typography
                level="body-xs"
                fontWeight="bold"
                textColor="muted"
                css={{ textTransform: "uppercase", letterSpacing: 0.4 }}
              >
                {channel.name}
              </Typography>
            </Stack>
          );

        return (
          <Stack
            key={channel.id}
            direction="row"
            alignItems="center"
            spacing={1}
            pl={channel.parentId ? 2 : 0}
          >
            {channel.type === ChannelType.Voice ? (
              <SpeakerHighIcon size={16} />
            ) : (
              <HashIcon size={16} />
            )}
            <Typography level="body-sm">{channel.name}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

function ImportProgressPanel({ progress }: { progress: ImportProgressState }) {
  const { t } = useTranslation("settings");
  const percent = overallPercent(progress);
  const activeStage = IMPORT_STAGES.find(
    ({ stage }) => !isStageDone(progress[stage])
  )?.stage;

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="body-sm" fontWeight="bold">
            {activeStage
              ? t(`discordImport.stages.${activeStage}`)
              : t("discordImport.stages.done")}
          </Typography>
          <Typography level="body-sm" textColor="muted">
            {percent}%
          </Typography>
        </Stack>
        <LinearProgress
          determinate
          value={percent}
          length="100%"
          thickness="md"
        />
      </Stack>

      <Stack direction="column" spacing={1}>
        {IMPORT_STAGES.map(({ stage }) => {
          const stageProgress = progress[stage];
          const done = isStageDone(stageProgress);
          const active = stage === activeStage;

          return (
            <Stack
              key={stage}
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              {done ? (
                <CheckCircleIcon size={18} weight="fill" color="#3ba55d" />
              ) : active ? (
                <CircularProgress size={18} />
              ) : (
                <CircleIcon size={18} opacity={0.4} />
              )}
              <Typography
                level="body-sm"
                textColor={done || active ? undefined : "muted"}
                flex={1}
              >
                {t(`discordImport.stages.${stage}`)}
              </Typography>
              {stageProgress && stageProgress.total > 1 ? (
                <Typography level="body-xs" textColor="muted">
                  {stageProgress.completed}/{stageProgress.total}
                </Typography>
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export const DiscordImportSettings = observer(() => {
  const app = useAppStore();
  const account = app.account;
  const navigate = useNavigate();
  const { closeAllModals } = useModal();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const [guildId, setGuildId] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<DiscordImportResult | null>(
    null
  );
  const [progress, setProgress] = useState<ImportProgressState>(EMPTY_PROGRESS);
  const [inviteCopied, setInviteCopied] = useState(false);

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
      app.rest.post<ImportPreview>("/@me/discord-import/preview", {
        guildId: guildId.trim()
      }),
    onSuccess: (data) => {
      setPreview(data);
      setPreviewError(null);
      setImportError(null);
      setImportResult(null);
      if (!spaceName.trim()) setSpaceName(data.guild.name.slice(0, 100));
    },
    onError: (error: HttpException) => {
      setPreview(null);
      setPreviewError(error.message);
    }
  });

  const { mutate: runImport, isPending: importing } = useMutation({
    mutationFn: async () => {
      setProgress(EMPTY_PROGRESS);
      const ack = await app.gateway.importDiscordServer(
        guildId.trim(),
        spaceName.trim(),
        (update: DiscordImportProgressPayload) =>
          setProgress((previous) => ({
            ...previous,
            [update.stage]: {
              completed: update.completed,
              total: update.total
            }
          }))
      );
      if (!ack.ok) throw new Error(ack.message ?? t("discordImport.failed"));
      return ack;
    },
    onSuccess: (result) => {
      setImportResult(result);
      setImportError(null);
    },
    onError: (error: Error) => setImportError(error.message)
  });

  const handleLinkDiscord = () => {
    sessionStorage.setItem("settings-return", "discord-import");
    void app.rest
      .get<{
        url: string;
      }>(`/@me/discord/link?client=${isElectron ? "desktop" : "web"}`)
      .then(({ url }) => {
        void openExternalLink(url);
      });
  };

  const handleUnlinkDiscord = () => {
    void app.rest.delete("/@me/discord").then(() => {
      if (account) account.discordId = null;
      resetImport();
    });
  };

  const resetImport = () => {
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
    setImportResult(null);
    setProgress(EMPTY_PROGRESS);
  };

  const copyInviteLink = async () => {
    if (!importResult) return;
    const inviteUrl = Invite.constructUrl(importResult.inviteCode);
    if (isElectron) await window.api.clipboard.write(inviteUrl);
    else await navigator.clipboard.writeText(inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const importedSpace = importResult
    ? app.spaces.get(importResult.space.id)
    : undefined;

  const openImportedSpace = () => {
    if (!importedSpace) return;
    closeAllModals();
    const firstChannel = app.channels.getFirstNavigableChannel(
      importedSpace.id
    );
    if (firstChannel)
      void navigate({
        to: "/spaces/$spaceId/$channelId",
        params: { spaceId: importedSpace.id, channelId: firstChannel.id }
      });
    else
      void navigate({
        to: "/spaces/$spaceId",
        params: { spaceId: importedSpace.id }
      });
  };

  const botInviteUrl = botInviteQuery.data?.url;
  const canPreview = Boolean(guildId.trim()) && !importing;
  const canImport = Boolean(preview) && Boolean(spaceName.trim()) && !importing;
  const showProgress =
    importing || Boolean(importResult) || Boolean(importError);
  const importableChannels =
    preview?.channels.filter(
      (channel) => channel.type !== ChannelType.Category
    ) ?? [];

  if (!account) return null;

  return (
    <Stack spacing={2.5} pt={2.5} pb={5} mx={20} direction="column">
      <Typography level="body-sm" textColor="muted">
        {t("discordImport.intro")}
      </Typography>

      <StepCard
        step={1}
        title={t("discord.linkDiscord")}
        description={
          isLinked
            ? t("discordImport.linkedStatus")
            : t("discordImport.linkHint")
        }
        done={isLinked}
        action={
          <Button
            variant={isLinked ? "outlined" : "solid"}
            size="sm"
            color={isLinked ? "neutral" : "primary"}
            disabled={importing}
            startDecorator={
              isLinked ? undefined : <DiscordLogoIcon weight="fill" />
            }
            onClick={() => {
              if (isLinked) handleUnlinkDiscord();
              else handleLinkDiscord();
            }}
          >
            {isLinked ? t("discord.unlinkDiscord") : t("discord.linkDiscord")}
          </Button>
        }
      />

      <StepCard
        step={2}
        title={t("discordImport.botInvite")}
        description={t("discordImport.botInviteHint")}
        done={Boolean(preview)}
        disabled={!isLinked}
        action={
          <Button
            variant="outlined"
            size="sm"
            disabled={!isLinked || !botInviteUrl}
            loading={isLinked && botInviteQuery.isPending}
            startDecorator={<RobotIcon />}
            endDecorator={<ArrowSquareOutIcon />}
            onClick={() => {
              if (botInviteUrl) void openExternalLink(botInviteUrl);
            }}
          >
            {tCommon("open")}
          </Button>
        }
      />

      <StepCard
        step={3}
        title={t("discordImport.chooseServer")}
        description={t("discordImport.guildIdHint")}
        done={Boolean(preview)}
        disabled={!isLinked}
      >
        {isLinked ? (
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Input
                fullWidth
                placeholder={t("discordImport.guildIdPlaceholder")}
                value={guildId}
                disabled={importing}
                onChange={(event) => {
                  setGuildId(event.target.value.replace(/\D/g, ""));
                  resetImport();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canPreview) loadPreview();
                }}
              />
              <Button
                variant="solid"
                disabled={!canPreview}
                loading={previewing}
                onClick={() => loadPreview()}
              >
                {t("discordImport.preview")}
              </Button>
            </Stack>

            {previewError ? (
              <Paper
                variant="soft"
                color="danger"
                borderRadius={10}
                px={2.5}
                py={2}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <WarningCircleIcon size={20} weight="fill" />
                <Stack direction="column" spacing={0.5}>
                  <Typography level="body-sm">{previewError}</Typography>
                  <Typography level="body-xs" textColor="muted">
                    {t("discordImport.previewErrorHint")}
                  </Typography>
                </Stack>
              </Paper>
            ) : null}

            {preview ? (
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {preview.guild.iconUrl ? (
                    <img
                      src={preview.guild.iconUrl}
                      alt=""
                      width={40}
                      height={40}
                      css={{ borderRadius: 12 }}
                    />
                  ) : (
                    <Paper
                      variant="soft"
                      width={40}
                      height={40}
                      borderRadius={12}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography level="body-md" fontWeight="bold">
                        {preview.guild.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Paper>
                  )}
                  <Typography level="title-md" fontWeight="bold">
                    {preview.guild.name}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <PreviewStat
                    icon={<HashIcon size={18} />}
                    value={importableChannels.length}
                    label={t("discordImport.channels")}
                  />
                  <PreviewStat
                    icon={<UsersThreeIcon size={18} />}
                    value={preview.roles.length}
                    label={t("discordImport.roles")}
                  />
                  <PreviewStat
                    icon={<SmileyIcon size={18} />}
                    value={preview.emojis.length}
                    label={t("discordImport.emojis")}
                  />
                </Stack>

                {preview.skippedChannelCount > 0 ||
                preview.skippedEmojiCount > 0 ? (
                  <Typography level="body-xs" textColor="muted">
                    {t("discordImport.skippedSummary", {
                      channels: preview.skippedChannelCount,
                      emojis: preview.skippedEmojiCount
                    })}
                  </Typography>
                ) : null}

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Paper
                    variant="soft"
                    borderRadius={10}
                    px={2}
                    py={1.5}
                    flex={1}
                    minWidth={220}
                    direction="column"
                    spacing={1}
                  >
                    <Typography level="body-sm" fontWeight="bold">
                      {t("discordImport.channels")}
                    </Typography>
                    <ChannelTreePreview channels={preview.channels} />
                  </Paper>

                  <Stack direction="column" spacing={2} flex={1} minWidth={220}>
                    <Paper
                      variant="soft"
                      borderRadius={10}
                      px={2}
                      py={1.5}
                      direction="column"
                      spacing={1}
                    >
                      <Typography level="body-sm" fontWeight="bold">
                        {t("discordImport.roles")}
                      </Typography>
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={0.75}
                        maxHeight={120}
                        css={{ overflowY: "auto" }}
                      >
                        {preview.roles.map((role) => (
                          <Paper
                            key={role.id}
                            variant="outlined"
                            borderRadius={999}
                            px={1.25}
                            py={0.25}
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                          >
                            <span
                              css={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: role.color ?? "#99aab5",
                                flexShrink: 0
                              }}
                            />
                            <Typography level="body-xs">{role.name}</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Paper>

                    {preview.emojis.length ? (
                      <Paper
                        variant="soft"
                        borderRadius={10}
                        px={2}
                        py={1.5}
                        direction="column"
                        spacing={1}
                      >
                        <Typography level="body-sm" fontWeight="bold">
                          {t("discordImport.emojis")}
                        </Typography>
                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={0.5}
                          maxHeight={120}
                          css={{ overflowY: "auto" }}
                        >
                          {preview.emojis.map((emoji) => (
                            <img
                              key={emoji.id}
                              src={emoji.url}
                              alt={emoji.name}
                              title={`:${emoji.name}:`}
                              width={28}
                              height={28}
                              loading="lazy"
                              css={{ objectFit: "contain" }}
                            />
                          ))}
                        </Stack>
                      </Paper>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </StepCard>

      <StepCard
        step={4}
        title={t("discordImport.importStep")}
        description={t("discordImport.importStepHint")}
        done={Boolean(importResult)}
        disabled={!preview}
      >
        {preview ? (
          <Stack direction="column" spacing={2}>
            {!importResult ? (
              <Stack direction="row" spacing={1.5} alignItems="flex-end">
                <Stack direction="column" spacing={0.75} flex={1}>
                  <Typography level="body-sm" fontWeight="bold">
                    {t("discordImport.spaceName")}
                  </Typography>
                  <Input
                    fullWidth
                    placeholder={t("discordImport.spaceNamePlaceholder")}
                    value={spaceName}
                    disabled={importing}
                    maxLength={100}
                    onChange={(event) => {
                      setSpaceName(event.target.value);
                      setImportError(null);
                    }}
                  />
                </Stack>
                <Button
                  variant="solid"
                  disabled={!canImport}
                  loading={importing}
                  onClick={() => runImport()}
                >
                  {importError
                    ? t("discordImport.retry")
                    : t("discordImport.import")}
                </Button>
              </Stack>
            ) : null}

            {showProgress ? (
              <>
                <Divider textColor="muted" css={{ opacity: 0.35 }} />
                <ImportProgressPanel progress={progress} />
              </>
            ) : null}

            {importError ? (
              <Paper
                variant="soft"
                color="danger"
                borderRadius={10}
                px={2.5}
                py={2}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <WarningCircleIcon size={20} weight="fill" />
                <Typography level="body-sm">{importError}</Typography>
              </Paper>
            ) : null}

            {importResult ? (
              <Paper
                variant="soft"
                color="success"
                borderRadius={10}
                px={2.5}
                py={2}
                direction="column"
                spacing={1.5}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleIcon size={22} weight="fill" />
                  <Stack direction="column" spacing={0.25}>
                    <Typography level="body-md" fontWeight="bold">
                      {t("discordImport.successTitle", {
                        name: importResult.space.name
                      })}
                    </Typography>
                    <Typography level="body-sm">
                      {t("discordImport.inviteReady", {
                        code: importResult.inviteCode
                      })}
                    </Typography>
                    {importResult.skippedEmojiCount > 0 ? (
                      <Typography level="body-xs">
                        {t("discordImport.emojisSkipped", {
                          count: importResult.skippedEmojiCount
                        })}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    variant="solid"
                    size="sm"
                    loading={!importedSpace}
                    disabled={!importedSpace}
                    onClick={openImportedSpace}
                  >
                    {t("discordImport.openSpace")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="sm"
                    startDecorator={
                      inviteCopied ? <CheckCircleIcon /> : <CopyIcon />
                    }
                    onClick={() => void copyInviteLink()}
                  >
                    {inviteCopied
                      ? t("discordImport.copied")
                      : t("discordImport.copyInvite")}
                  </Button>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => {
                      setGuildId("");
                      setSpaceName("");
                      resetImport();
                    }}
                  >
                    {t("discordImport.importAnother")}
                  </Button>
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        ) : null}
      </StepCard>
    </Stack>
  );
});
