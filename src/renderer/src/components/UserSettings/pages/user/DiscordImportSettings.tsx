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
  Checkbox,
  CircularProgress,
  Divider,
  Input,
  LinearProgress,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CircleIcon,
  CopyIcon,
  DiscordLogoIcon,
  HashIcon,
  LockSimpleIcon,
  ShieldCheckIcon,
  SmileyIcon,
  SpeakerHighIcon,
  StickerIcon,
  UsersThreeIcon,
  WarningCircleIcon
} from "@phosphor-icons/react";
import {
  DISCORD_IMPORT_GUILD_EVENT,
  takePendingDiscordImportGuild
} from "@renderer/utils/discordImportReturn";
import type { DiscordImportResult } from "@stores/Gateway.store";
import { Invite } from "@stores/objects/Invite";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isElectron, openExternalLink } from "@utils/index";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface PreviewChannel {
  id: string;
  name: string;
  type: number | null;
  topic: string | null;
  nsfw: boolean;
  isPrivate: boolean;
  parentId: string | null;
}

interface PreviewImage {
  id: string;
  name: string;
  url: string;
}

interface ImportPreview {
  guild: { name: string; iconUrl: string | null; description: string | null };
  channels: PreviewChannel[];
  roles: { id: string; name: string; color: string | null }[];
  emojis: PreviewImage[];
  stickers: PreviewImage[];
  maxExpressions: number;
  skippedChannelCount: number;
  skippedStickerCount: number;
}

interface ImportSelectionState {
  channels: Set<string>;
  roles: Set<string>;
  emojis: Set<string>;
  stickers: Set<string>;
}

type SelectionKey = keyof ImportSelectionState;

type ImportProgressState = Record<
  DiscordImportStage,
  { completed: number; total: number } | undefined
>;

const IMPORT_STAGES: { stage: DiscordImportStage; weight: number }[] = [
  { stage: "fetching", weight: 5 },
  { stage: "emojis", weight: 35 },
  { stage: "space", weight: 5 },
  { stage: "roles", weight: 15 },
  { stage: "channels", weight: 30 },
  { stage: "finishing", weight: 10 }
];

const EMPTY_PROGRESS: ImportProgressState = {
  fetching: undefined,
  emojis: undefined,
  space: undefined,
  roles: undefined,
  channels: undefined,
  finishing: undefined
};

const SUCCESS_COLOR = "#3ba55d";

const selectEverything = (preview: ImportPreview): ImportSelectionState => ({
  channels: new Set(preview.channels.map((channel) => channel.id)),
  roles: new Set(preview.roles.map((role) => role.id)),
  emojis: new Set(preview.emojis.map((emoji) => emoji.id)),
  stickers: new Set(preview.stickers.map((sticker) => sticker.id))
});

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
            <CheckCircleIcon size={28} weight="fill" color={SUCCESS_COLOR} />
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
  selected,
  total,
  label
}: {
  icon: ReactNode;
  selected: number;
  total: number;
  label: string;
}) {
  return (
    <Paper
      variant="soft"
      borderRadius={8}
      px={2}
      py={1.5}
      flex={1}
      minWidth={100}
      direction="column"
      alignItems="center"
      spacing={0.5}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography level="title-md" fontWeight="bold">
          {selected}
        </Typography>
        {selected !== total ? (
          <Typography level="body-xs" textColor="muted">
            / {total}
          </Typography>
        ) : null}
      </Stack>
      <Typography level="body-xs" textColor="muted">
        {label}
      </Typography>
    </Paper>
  );
}

function SelectionPanel({
  title,
  selected,
  total,
  onSelectAll,
  onSelectNone,
  children
}: {
  title: string;
  selected: number;
  total: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation("settings");

  return (
    <Paper
      variant="soft"
      borderRadius={10}
      px={2}
      py={1.5}
      direction="column"
      spacing={1}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography level="body-sm" fontWeight="bold" flex={1}>
          {title}
        </Typography>
        <Typography level="body-xs" textColor="muted">
          {t("discordImport.selectedCount", { selected, total })}
        </Typography>
        <Button
          variant="plain"
          size="sm"
          onClick={selected === total ? onSelectNone : onSelectAll}
        >
          {selected === total
            ? t("discordImport.selectNone")
            : t("discordImport.selectAll")}
        </Button>
      </Stack>
      {children}
    </Paper>
  );
}

function ChannelBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      px={0.75}
      css={{ borderRadius: 4, opacity: 0.75, fontSize: 11 }}
    >
      {icon}
      <Typography level="body-xs">{label}</Typography>
    </Stack>
  );
}

function ChannelSelectionTree({
  channels,
  selected,
  onToggle
}: {
  channels: PreviewChannel[];
  selected: Set<string>;
  onToggle: (channel: PreviewChannel) => void;
}) {
  const { t } = useTranslation("settings");

  return (
    <Stack
      direction="column"
      spacing={0.25}
      maxHeight={320}
      css={{ overflowY: "auto" }}
      pr={1}
    >
      {channels.map((channel) => {
        const isCategory = channel.type === ChannelType.Category;
        const isChecked = selected.has(channel.id);
        const childIds = isCategory
          ? channels
              .filter((child) => child.parentId === channel.id)
              .map((child) => child.id)
          : [];
        const isPartial =
          isCategory &&
          childIds.some((childId) => selected.has(childId)) !==
            childIds.every((childId) => selected.has(childId));

        return (
          <Stack
            key={channel.id}
            direction="row"
            alignItems="center"
            spacing={1}
            pl={channel.parentId ? 3 : 0}
            pt={isCategory ? 1 : 0}
            title={channel.topic ?? undefined}
            css={{ opacity: isChecked ? 1 : 0.5 }}
          >
            <Checkbox
              size="sm"
              checked={isChecked}
              indeterminate={isPartial}
              onChange={() => onToggle(channel)}
            />
            {isCategory ? null : channel.type === ChannelType.Voice ? (
              <SpeakerHighIcon size={16} />
            ) : (
              <HashIcon size={16} />
            )}
            <Typography
              level={isCategory ? "body-xs" : "body-sm"}
              fontWeight={isCategory ? "bold" : undefined}
              textColor={isCategory ? "muted" : undefined}
              css={
                isCategory
                  ? { textTransform: "uppercase", letterSpacing: 0.4 }
                  : undefined
              }
            >
              {channel.name}
            </Typography>
            {channel.isPrivate ? (
              <ChannelBadge
                icon={<LockSimpleIcon size={11} />}
                label={t("discordImport.private")}
              />
            ) : null}
            {channel.nsfw ? (
              <ChannelBadge
                icon={<WarningCircleIcon size={11} />}
                label={t("discordImport.nsfw")}
              />
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}

function ImageSelectionGrid({
  images,
  selected,
  onToggle,
  imageSize
}: {
  images: PreviewImage[];
  selected: Set<string>;
  onToggle: (imageId: string) => void;
  imageSize: number;
}) {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.5}
      maxHeight={160}
      css={{ overflowY: "auto" }}
    >
      {images.map((image) => {
        const isChecked = selected.has(image.id);
        return (
          <button
            key={image.id}
            type="button"
            title={`:${image.name}:`}
            onClick={() => onToggle(image.id)}
            css={{
              padding: 4,
              border: "none",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
              opacity: isChecked ? 1 : 0.25,
              filter: isChecked ? "none" : "grayscale(1)",
              transition: "opacity 120ms, filter 120ms",
              "&:hover": { background: "rgba(127, 127, 127, 0.15)" }
            }}
          >
            <img
              src={image.url}
              alt={image.name}
              width={imageSize}
              height={imageSize}
              loading="lazy"
              css={{ objectFit: "contain", display: "block" }}
            />
          </button>
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
                <CheckCircleIcon
                  size={18}
                  weight="fill"
                  color={SUCCESS_COLOR}
                />
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
  const [guildId, setGuildId] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selection, setSelection] = useState<ImportSelectionState | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<DiscordImportResult | null>(
    null
  );
  const [progress, setProgress] = useState<ImportProgressState>(EMPTY_PROGRESS);
  const [inviteCopied, setInviteCopied] = useState(false);

  const { mutate: startDiscordAuthorization, isPending: authorizing } =
    useMutation({
      mutationFn: async () => {
        setPreviewError(null);
        const { url } = await app.rest.get<{ url: string }>(
          `/@me/discord/import?client=${isElectron ? "desktop" : "web"}`
        );
        if (isElectron) await openExternalLink(url);
        else window.location.href = url;
      },
      onError: (error: HttpException) => setPreviewError(error.message)
    });

  const { mutate: loadPreview, isPending: previewing } = useMutation({
    mutationFn: (targetGuildId: string) =>
      app.rest.post<ImportPreview>("/@me/discord-import/preview", {
        guildId: targetGuildId
      }),
    onSuccess: (data) => {
      setPreview(data);
      setSelection(selectEverything(data));
      setPreviewError(null);
      setImportError(null);
      setImportResult(null);
      if (!spaceName.trim()) setSpaceName(data.guild.name.slice(0, 100));
    },
    onError: (error: HttpException) => {
      setPreview(null);
      setSelection(null);
      setPreviewError(error.message);
    }
  });

  const { mutate: runImport, isPending: importing } = useMutation({
    mutationFn: async () => {
      if (!selection) throw new Error(t("discordImport.failed"));
      setProgress(EMPTY_PROGRESS);
      const ack = await app.gateway.importDiscordServer(
        guildId.trim(),
        spaceName.trim(),
        {
          channelIds: [...selection.channels],
          roleIds: [...selection.roles],
          emojiIds: [...selection.emojis],
          stickerIds: [...selection.stickers]
        },
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

  useEffect(() => {
    const loadPendingGuild = () => {
      const pendingGuildId = takePendingDiscordImportGuild();
      if (!pendingGuildId) return;

      setGuildId(pendingGuildId);
      setSpaceName("");
      setImportResult(null);
      loadPreview(pendingGuildId);
    };

    loadPendingGuild();
    window.addEventListener(DISCORD_IMPORT_GUILD_EVENT, loadPendingGuild);
    return () => {
      window.removeEventListener(DISCORD_IMPORT_GUILD_EVENT, loadPendingGuild);
    };
  }, [loadPreview]);

  const resetImport = () => {
    setPreview(null);
    setSelection(null);
    setPreviewError(null);
    setImportError(null);
    setImportResult(null);
    setProgress(EMPTY_PROGRESS);
  };

  const setSelectedIds = (key: SelectionKey, ids: Iterable<string>) =>
    setSelection((previous) =>
      previous ? { ...previous, [key]: new Set(ids) } : previous
    );

  const toggleIds = (key: SelectionKey, ids: string[], include: boolean) =>
    setSelection((previous) => {
      if (!previous) return previous;
      const next = new Set(previous[key]);
      for (const id of ids) {
        if (include) next.add(id);
        else next.delete(id);
      }
      return { ...previous, [key]: next };
    });

  const toggleId = (key: SelectionKey, id: string) =>
    toggleIds(key, [id], !selection?.[key].has(id));

  const toggleChannel = (channel: PreviewChannel) => {
    if (!preview) return;
    const include = !selection?.channels.has(channel.id);
    const childIds =
      channel.type === ChannelType.Category
        ? preview.channels
            .filter((child) => child.parentId === channel.id)
            .map((child) => child.id)
        : [];
    toggleIds("channels", [channel.id, ...childIds], include);
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

  const selectedChannelCount =
    preview && selection
      ? preview.channels.filter(
          (channel) =>
            channel.type !== ChannelType.Category &&
            selection.channels.has(channel.id)
        ).length
      : 0;
  const totalChannelCount =
    preview?.channels.filter((channel) => channel.type !== ChannelType.Category)
      .length ?? 0;
  const selectedExpressionCount =
    (selection?.emojis.size ?? 0) + (selection?.stickers.size ?? 0);
  const maxExpressions = preview?.maxExpressions ?? 100;
  const isOverExpressionLimit = selectedExpressionCount > maxExpressions;
  const hasAnythingSelected =
    selection !== null &&
    (selection.channels.size > 0 ||
      selection.roles.size > 0 ||
      selectedExpressionCount > 0);

  const canImport =
    Boolean(preview) &&
    Boolean(spaceName.trim()) &&
    hasAnythingSelected &&
    !isOverExpressionLimit &&
    !importing;
  const showProgress =
    importing || Boolean(importResult) || Boolean(importError);
  const isSelectionLocked = importing || Boolean(importResult);

  if (!account) return null;

  return (
    <Stack spacing={2.5} pt={2.5} pb={5} mx={20} direction="column">
      <Typography level="body-sm" textColor="muted">
        {t("discordImport.intro")}
      </Typography>

      <StepCard
        step={1}
        title={t("discordImport.chooseServer")}
        description={t("discordImport.authorizeHint")}
        done={Boolean(preview)}
        action={
          <Button
            variant={preview ? "outlined" : "solid"}
            size="sm"
            disabled={importing || previewing}
            loading={authorizing || previewing}
            startDecorator={<DiscordLogoIcon weight="fill" />}
            endDecorator={isElectron ? <ArrowSquareOutIcon /> : undefined}
            onClick={() => startDiscordAuthorization()}
          >
            {preview
              ? t("discordImport.chooseDifferentServer")
              : t("discordImport.importFromDiscord")}
          </Button>
        }
      >
        {previewError || preview ? (
          <Stack direction="column" spacing={2}>
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

            {preview && selection ? (
              <Stack
                direction="column"
                spacing={2}
                css={{
                  pointerEvents: isSelectionLocked ? "none" : undefined,
                  opacity: isSelectionLocked ? 0.6 : 1
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {preview.guild.iconUrl ? (
                    <img
                      src={preview.guild.iconUrl}
                      alt=""
                      width={44}
                      height={44}
                      css={{ borderRadius: 14, flexShrink: 0 }}
                    />
                  ) : (
                    <Paper
                      variant="soft"
                      width={44}
                      height={44}
                      borderRadius={14}
                      alignItems="center"
                      justifyContent="center"
                      css={{ flexShrink: 0 }}
                    >
                      <Typography level="body-md" fontWeight="bold">
                        {preview.guild.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Paper>
                  )}
                  <Stack direction="column" spacing={0.25} minWidth={0}>
                    <Typography level="title-md" fontWeight="bold">
                      {preview.guild.name}
                    </Typography>
                    {preview.guild.description ? (
                      <Typography level="body-xs" textColor="muted">
                        {preview.guild.description}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <PreviewStat
                    icon={<HashIcon size={18} />}
                    selected={selectedChannelCount}
                    total={totalChannelCount}
                    label={t("discordImport.channels")}
                  />
                  <PreviewStat
                    icon={<UsersThreeIcon size={18} />}
                    selected={selection.roles.size}
                    total={preview.roles.length}
                    label={t("discordImport.roles")}
                  />
                  <PreviewStat
                    icon={<SmileyIcon size={18} />}
                    selected={selection.emojis.size}
                    total={preview.emojis.length}
                    label={t("discordImport.emojis")}
                  />
                  <PreviewStat
                    icon={<StickerIcon size={18} />}
                    selected={selection.stickers.size}
                    total={preview.stickers.length}
                    label={t("discordImport.stickers")}
                  />
                </Stack>

                <Stack direction="column" spacing={0.5}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <ShieldCheckIcon size={14} />
                    <Typography level="body-xs" textColor="muted">
                      {t("discordImport.permissionsNote")}
                    </Typography>
                  </Stack>
                  {preview.skippedChannelCount > 0 ? (
                    <Typography level="body-xs" textColor="muted">
                      {t("discordImport.skippedChannels", {
                        count: preview.skippedChannelCount
                      })}
                    </Typography>
                  ) : null}
                  {preview.skippedStickerCount > 0 ? (
                    <Typography level="body-xs" textColor="muted">
                      {t("discordImport.skippedStickers", {
                        count: preview.skippedStickerCount
                      })}
                    </Typography>
                  ) : null}
                </Stack>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Stack direction="column" flex={1} minWidth={260}>
                    <SelectionPanel
                      title={t("discordImport.channels")}
                      selected={selection.channels.size}
                      total={preview.channels.length}
                      onSelectAll={() =>
                        setSelectedIds(
                          "channels",
                          preview.channels.map((channel) => channel.id)
                        )
                      }
                      onSelectNone={() => setSelectedIds("channels", [])}
                    >
                      <ChannelSelectionTree
                        channels={preview.channels}
                        selected={selection.channels}
                        onToggle={toggleChannel}
                      />
                    </SelectionPanel>
                  </Stack>

                  <Stack direction="column" spacing={2} flex={1} minWidth={260}>
                    <SelectionPanel
                      title={t("discordImport.roles")}
                      selected={selection.roles.size}
                      total={preview.roles.length}
                      onSelectAll={() =>
                        setSelectedIds(
                          "roles",
                          preview.roles.map((role) => role.id)
                        )
                      }
                      onSelectNone={() => setSelectedIds("roles", [])}
                    >
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={0.75}
                        maxHeight={140}
                        css={{ overflowY: "auto" }}
                      >
                        {preview.roles.map((role) => {
                          const isChecked = selection.roles.has(role.id);
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => toggleId("roles", role.id)}
                              css={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "2px 10px",
                                borderRadius: 999,
                                border: "1px solid rgba(127, 127, 127, 0.35)",
                                background: "transparent",
                                color: "inherit",
                                cursor: "pointer",
                                opacity: isChecked ? 1 : 0.4,
                                textDecoration: isChecked
                                  ? "none"
                                  : "line-through",
                                transition: "opacity 120ms"
                              }}
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
                              <Typography level="body-xs">
                                {role.name}
                              </Typography>
                            </button>
                          );
                        })}
                      </Stack>
                    </SelectionPanel>

                    {preview.emojis.length ? (
                      <SelectionPanel
                        title={t("discordImport.emojis")}
                        selected={selection.emojis.size}
                        total={preview.emojis.length}
                        onSelectAll={() =>
                          setSelectedIds(
                            "emojis",
                            preview.emojis.map((emoji) => emoji.id)
                          )
                        }
                        onSelectNone={() => setSelectedIds("emojis", [])}
                      >
                        <ImageSelectionGrid
                          images={preview.emojis}
                          selected={selection.emojis}
                          onToggle={(emojiId) => toggleId("emojis", emojiId)}
                          imageSize={28}
                        />
                      </SelectionPanel>
                    ) : null}

                    {preview.stickers.length ? (
                      <SelectionPanel
                        title={t("discordImport.stickers")}
                        selected={selection.stickers.size}
                        total={preview.stickers.length}
                        onSelectAll={() =>
                          setSelectedIds(
                            "stickers",
                            preview.stickers.map((sticker) => sticker.id)
                          )
                        }
                        onSelectNone={() => setSelectedIds("stickers", [])}
                      >
                        <ImageSelectionGrid
                          images={preview.stickers}
                          selected={selection.stickers}
                          onToggle={(stickerId) =>
                            toggleId("stickers", stickerId)
                          }
                          imageSize={56}
                        />
                      </SelectionPanel>
                    ) : null}
                  </Stack>
                </Stack>

                <Typography
                  level="body-xs"
                  textColor={isOverExpressionLimit ? undefined : "muted"}
                  color={isOverExpressionLimit ? "danger" : undefined}
                >
                  {isOverExpressionLimit
                    ? t("discordImport.expressionLimit", {
                        max: maxExpressions,
                        over: selectedExpressionCount - maxExpressions
                      })
                    : t("discordImport.expressionCount", {
                        selected: selectedExpressionCount,
                        max: maxExpressions
                      })}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </StepCard>

      <StepCard
        step={2}
        title={t("discordImport.importStep")}
        description={t("discordImport.importStepHint")}
        done={Boolean(importResult)}
        disabled={!preview}
      >
        {preview ? (
          <Stack direction="column" spacing={2}>
            {!importResult ? (
              <>
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
                <Typography level="body-xs" textColor="muted">
                  {hasAnythingSelected
                    ? t("discordImport.importSummary", {
                        channels: selectedChannelCount,
                        roles: selection?.roles.size ?? 0,
                        expressions: selectedExpressionCount
                      })
                    : t("discordImport.nothingSelected")}
                </Typography>
              </>
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
                    {importResult.skippedExpressionCount > 0 ? (
                      <Typography level="body-xs">
                        {t("discordImport.expressionsSkipped", {
                          count: importResult.skippedExpressionCount
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
