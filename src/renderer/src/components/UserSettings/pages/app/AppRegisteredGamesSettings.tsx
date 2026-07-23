import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { PresenceIcon } from "@components/Presence/PresenceIcon";
import { useAppStore } from "@hooks/useStores";
import {
  InputDefault,
  Option,
  Popover,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  addCustomGame,
  findMatchingProcess,
  getCatalogExeFilter,
  getOfficialGameCatalog,
  isBuiltinGameExe,
  listCustomGames,
  matchGamesFromProcesses,
  removeCustomGame,
  renameCustomGame,
  type GameCatalogEntry
} from "@renderer/presence/gameCatalog";
import {
  buildIgdbIconUrl,
  cacheCustomIconImageId,
  getCachedCustomIconImageId,
  resolveBuiltinIconUrl
} from "@renderer/presence/gameIcon";
import {
  getGamePreference,
  isGameShared,
  listGamePreferences,
  setGameShare,
  touchGamePlayed
} from "@renderer/presence/gamePreferences";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SHELL_PROCESS_DENYLIST = new Set(
  [
    "explorer.exe",
    "applicationframehost.exe",
    "searchhost.exe",
    "startmenuexperiencehost.exe",
    "shellexperiencehost.exe",
    "textinputhost.exe",
    "securityhealthsystray.exe",
    "systemsettings.exe",
    "lockapp.exe"
  ].map((e) => e.toLowerCase())
);

type ProcessOption = {
  exe: string;
  label: string;
  suggestedName: string;
  path?: string;
};

type RegistryRow = GameCatalogEntry & {
  source: "builtin" | "custom";
  share: boolean;
  lastPlayedAt: number | null;
  playing: boolean;
};

type CurrentGameRow = GameCatalogEntry & {
  source: "builtin" | "custom";
};

type GameIconResponse = {
  iconImageId: string;
  iconUrl: string;
};

function GameIconThumb({
  game,
  source,
  playing = false
}: {
  game: Pick<GameCatalogEntry, "id" | "name">;
  source: "builtin" | "custom";
  playing?: boolean;
}) {
  const app = useAppStore();
  const { theme } = useTheme();
  const [broken, setBroken] = useState(false);
  const [cachedId, setCachedId] = useState(
    () => getCachedCustomIconImageId(game.id)
  );

  const builtinUrl =
    source === "builtin" ? resolveBuiltinIconUrl(game as GameCatalogEntry) : null;

  const { data } = useQuery({
    queryKey: ["game-icon", game.id, game.name],
    enabled: source === "custom" && !cachedId,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    queryFn: async () => {
      try {
        return await app.rest.get<GameIconResponse>("/games/icon", {
          q: game.name
        });
      } catch {
        return null;
      }
    }
  });

  useEffect(() => {
    if (!data?.iconImageId || source !== "custom" || cachedId) return;
    cacheCustomIconImageId(game.id, data.iconImageId);
    setCachedId(data.iconImageId);
  }, [cachedId, data, game.id, source]);

  const url = useMemo(() => {
    if (broken) return null;
    if (builtinUrl) return builtinUrl;
    if (cachedId) return buildIgdbIconUrl(cachedId);
    return data?.iconUrl ?? null;
  }, [broken, builtinUrl, cachedId, data?.iconUrl]);

  const shellCss = {
    width: 40,
    height: 40,
    borderRadius: 8,
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.neutral}33`
  } as const;

  if (!url) {
    return (
      <Stack css={shellCss}>
        <PresenceIcon
          type="playing"
          color={playing ? theme.colors.success : theme.colors.neutral}
          size={18}
        />
      </Stack>
    );
  }

  return (
    <img
      src={url}
      alt=""
      width={40}
      height={40}
      onError={() => setBroken(true)}
      css={{
        ...shellCss,
        objectFit: "cover"
      }}
    />
  );
}

function exeBaseName(name: string) {
  const base = name.split(/[/\\]/).pop() || name;
  return base.trim();
}

function displayNameFromExe(exe: string) {
  return exeBaseName(exe)
    .replace(/\.exe$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function suggestedDisplayName(proc: { name: string; title?: string }) {
  const title = proc.title?.trim();
  if (title) {
    const primary =
      title
        .split(/\s+(?:—|–|-|\|)\s+/)
        .map((part) => part.trim())
        .find((part) => part.length >= 2) || title;
    if (primary.length <= 80) return primary;
    return title.slice(0, 80).trim();
  }
  return displayNameFromExe(proc.name);
}

function formatLastPlayed(
  at: number | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
  now: number
) {
  if (!at) return t("registeredGames.neverPlayed");
  const diff = Math.max(0, now - at);
  if (diff < 60_000) return t("registeredGames.nowPlaying");
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return t("registeredGames.lastPlayedMinutes", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("registeredGames.lastPlayedHours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("registeredGames.lastPlayedDays", { count: days });
}

function GameNameLabel({
  name,
  official,
  editable,
  editing,
  draft,
  onBeginEdit,
  onDraftChange,
  onCommit,
  onCancel,
  placeholder,
  officialLabel
}: {
  name: string;
  official: boolean;
  editable: boolean;
  editing: boolean;
  draft: string;
  onBeginEdit: () => void;
  onDraftChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  placeholder: string;
  officialLabel: string;
}) {
  const { theme } = useTheme();

  if (editing && editable) {
    return (
      <InputDefault
        fullWidth
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(e) => onDraftChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
      />
    );
  }

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
      <Typography
        level="body-md"
        fontWeight="bold"
        onClick={editable ? onBeginEdit : undefined}
        css={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...(editable ? { cursor: "text" } : {})
        }}
      >
        {name}
      </Typography>
      {official && (
        <CheckCircleIcon
          weight="fill"
          size={16}
          color={theme.colors.primary}
          aria-label={officialLabel}
          style={{ flexShrink: 0 }}
        />
      )}
    </Stack>
  );
}

export const AppRegisteredGamesSettings = observer(() => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { theme } = useTheme();
  const [now, setNow] = useState(() => Date.now());
  const [tick, setTick] = useState(0);
  const [current, setCurrent] = useState<CurrentGameRow[]>([]);
  const [addPopoverKey, setAddPopoverKey] = useState(0);
  const [processOptions, setProcessOptions] = useState<ProcessOption[]>([]);
  const [selectedExe, setSelectedExe] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const refreshPresence = () => {
    app.gateway?.refreshPresenceActivities?.();
  };

  const buildAddOptions = useCallback(
    (processes: { name: string; pid: number; title?: string; path?: string }[]) => {
      const knownCustom = new Set(
        listCustomGames().flatMap((g) => g.exes.map((e) => e.toLowerCase()))
      );
      const unique = new Map<string, ProcessOption>();
      for (const proc of processes) {
        const exe = exeBaseName(proc.name);
        const key = exe.toLowerCase();
        if (!exe || !key.endsWith(".exe")) continue;
        if (SHELL_PROCESS_DENYLIST.has(key)) continue;
        if (isBuiltinGameExe(key) || knownCustom.has(key)) continue;

        const suggestedName = suggestedDisplayName(proc);
        const label = proc.title?.trim()
          ? `${suggestedName} (${exe})`
          : exe;

        const existing = unique.get(key);
        if (!existing || (!existing.label.includes("(") && proc.title)) {
          unique.set(key, {
            exe,
            label,
            suggestedName,
            ...(proc.path ? { path: proc.path } : {})
          });
        }
      }
      return [...unique.values()].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      );
    },
    []
  );

  const loadProcessOptions = useCallback(() => {
    setSelectedExe("");

    void (async () => {
      try {
        const cached = (await window.api.system.getCachedProcesses()) ?? [];
        setProcessOptions(buildAddOptions(cached));
      } catch {
        setProcessOptions([]);
      }

      try {
        const refreshed = (await window.api.system.refreshProcesses()) ?? [];
        setProcessOptions(buildAddOptions(refreshed));
      } catch {
        return;
      }
    })();
  }, [buildAddOptions]);

  const closeAddPopover = () => {
    setSelectedExe("");
    setAddPopoverKey((key) => key + 1);
  };

  const reloadPlaying = useCallback(async () => {
    if (!isElectron || !window.api) {
      setCurrent([]);
      return;
    }
    try {
      const customIds = new Set(listCustomGames().map((g) => g.id));
      const exes = getCatalogExeFilter();
      const processes = await window.api.system.listProcesses(exes);
      const matched = matchGamesFromProcesses(processes);
      if (matched.length) {
        touchGamePlayed(
          matched.map((game) => {
            const proc = findMatchingProcess(game, processes);
            return {
              id: game.id,
              exePath: proc?.path ?? null
            };
          })
        );
      }
      setCurrent(
        matched.map((entry) => ({
          ...entry,
          source: customIds.has(entry.id)
            ? ("custom" as const)
            : ("builtin" as const)
        }))
      );
    } catch {
      setCurrent([]);
    }
  }, []);

  useEffect(() => {
    void reloadPlaying();
    const id = window.setInterval(() => {
      setNow(Date.now());
      void reloadPlaying();
    }, 5_000);
    return () => window.clearInterval(id);
  }, [reloadPlaying, tick]);

  const rows: RegistryRow[] = useMemo(() => {
    const prefs = listGamePreferences();
    const custom = listCustomGames();
    const playingIds = new Set(current.map((g) => g.id));

    const builtinRows: RegistryRow[] = getOfficialGameCatalog()
      .filter((g) => {
        const pref = prefs[g.id];
        return playingIds.has(g.id) || pref?.lastPlayedAt != null;
      })
      .map((g) => ({
        ...g,
        source: "builtin" as const,
        share: prefs[g.id]?.share !== false,
        lastPlayedAt: prefs[g.id]?.lastPlayedAt ?? null,
        playing: playingIds.has(g.id)
      }));

    const customRows: RegistryRow[] = custom.map((g) => ({
      id: g.id,
      name: g.name,
      exes: g.exes,
      source: "custom" as const,
      share: prefs[g.id]?.share !== false,
      lastPlayedAt: prefs[g.id]?.lastPlayedAt ?? g.createdAt,
      playing: playingIds.has(g.id)
    }));

    return [...customRows, ...builtinRows]
      .filter(
        (row, index, all) => all.findIndex((r) => r.id === row.id) === index
      )
      .sort((a, b) => {
        if (a.playing !== b.playing) return a.playing ? -1 : 1;
        return (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0);
      });
  }, [current, tick]);

  const onAddGame = () => {
    if (!selectedExe) return;
    const exe = exeBaseName(selectedExe).toLowerCase();
    if (isBuiltinGameExe(exe)) return;
    const option = processOptions.find(
      (o) => o.exe.toLowerCase() === exe
    );
    const name = option?.suggestedName || displayNameFromExe(exe);
    try {
      const created = addCustomGame({ name, exes: [exe] });
      touchGamePlayed([
        {
          id: created.id,
          exePath: option?.path ?? null
        }
      ]);
      closeAddPopover();
      setTick((n) => n + 1);
      void reloadPlaying();
      refreshPresence();
    } catch {
      return;
    }
  };

  const onToggleShare = (id: string, share: boolean) => {
    setGameShare(id, share);
    setTick((n) => n + 1);
    refreshPresence();
  };

  const onRemove = (id: string) => {
    removeCustomGame(id);
    if (editingId === id) {
      setEditingId(null);
      setEditDraft("");
    }
    setTick((n) => n + 1);
    void reloadPlaying();
    refreshPresence();
  };

  const beginEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditDraft(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const commitEdit = (id: string, currentName: string) => {
    const next = editDraft.trim();
    setEditingId(null);
    setEditDraft("");
    if (!next || next === currentName) return;
    renameCustomGame(id, next);
    setTick((n) => n + 1);
    void reloadPlaying();
    refreshPresence();
  };

  if (!isElectron) {
    return (
      <Stack direction="column" spacing={7.5} pt={2.5} pb={5}>
        <Typography level="body-md" textColor="muted">
          {t("registeredGames.desktopOnly")}
        </Typography>
      </Stack>
    );
  }

  const currentShared = current.filter((g) => isGameShared(g.id));

  return (
    <Stack direction="column" spacing={7.5} pt={2.5} pb={5}>
      <Stack direction="column" spacing={2.5}>
        <Typography fontSize={20}>{t("registeredGames.currentGame")}</Typography>
        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          spacing={2}
          direction="column"
        >
          {currentShared.length === 0 ? (
            <Typography level="body-sm" textColor="muted">
              {t("registeredGames.noCurrentGame")}
            </Typography>
          ) : (
            currentShared.map((game) => {
              const editable = game.source === "custom";
              return (
                <Stack
                  key={game.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                  p={1.5}
                  borderRadius={8}
                  css={{ backgroundColor: `${theme.colors.success}22` }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0} flex={1}>
                    <GameIconThumb game={game} source={game.source} playing />
                    <Stack direction="column" spacing={0.15} minWidth={0} flex={1}>
                      <GameNameLabel
                        name={game.name}
                        official={game.source === "builtin"}
                        editable={editable}
                        editing={editingId === game.id}
                        draft={editDraft}
                        onBeginEdit={() => beginEdit(game.id, game.name)}
                        onDraftChange={setEditDraft}
                        onCommit={() => commitEdit(game.id, game.name)}
                        onCancel={cancelEdit}
                        placeholder={t("registeredGames.namePlaceholder")}
                        officialLabel={t("registeredGames.officialGame")}
                      />
                      <Typography level="body-xs" textColor="muted">
                        {t("registeredGames.nowPlaying")}
                      </Typography>
                    </Stack>
                  </Stack>
                  <IconButton
                    variant="plain"
                    size="sm"
                    aria-label={t("registeredGames.toggleShare")}
                    onClick={() => onToggleShare(game.id, false)}
                  >
                    <EyeIcon weight="fill" />
                  </IconButton>
                </Stack>
              );
            })
          )}

          <Typography level="body-sm" textColor="muted">
            {t("registeredGames.notSeeing")}{" "}
            <Popover
              key={addPopoverKey}
              placement="bottom"
              closeOnClickOutside={false}
              closeOnInteract={false}
              variant="outlined"
              elevation={app.settings?.preferEmbossed ? 4 : 2}
              borderRadius={10}
              p={2}
              spacing={1.5}
              direction="column"
              css={{
                minWidth: 300,
                maxWidth: 360
              }}
              triggerCss={{ display: "inline-flex", verticalAlign: "baseline" }}
              trigger={
                <Button
                  variant="plain"
                  color="primary"
                  size="sm"
                  onClick={loadProcessOptions}
                  css={{
                    display: "inline",
                    padding: 0,
                    minHeight: 0,
                    height: "auto",
                    verticalAlign: "baseline"
                  }}
                >
                  {t("registeredGames.addIt")}
                </Button>
              }
            >
              <Typography level="body-sm" fontWeight="bold">
                {t("registeredGames.notSeeing")} {t("registeredGames.addIt")}
              </Typography>
              <Select
                value={selectedExe || undefined}
                placeholder={t("registeredGames.selectProcess")}
                onValueChange={(value) => {
                  if (typeof value !== "string") return;
                  setSelectedExe(value);
                }}
              >
                {processOptions.map((option) => (
                  <Option key={option.exe} value={option.exe}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={closeAddPopover}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  color="primary"
                  disabled={!selectedExe}
                  onClick={onAddGame}
                >
                  {t("registeredGames.addGame")}
                </Button>
              </Stack>
            </Popover>
          </Typography>
        </Paper>
      </Stack>

      <Stack direction="column" spacing={2.5}>
        <Typography fontSize={20}>{t("registeredGames.addedGames")}</Typography>
        <Typography level="body-sm" textColor="muted">
          {t("registeredGames.addedGamesDescription")}
        </Typography>
        <Paper
          variant="outlined"
          borderRadius={10}
          py={2.5}
          px={4}
          spacing={1.5}
          direction="column"
        >
          {rows.length === 0 ? (
            <Typography level="body-sm" textColor="muted">
              {t("registeredGames.empty")}
            </Typography>
          ) : (
            rows.map((game) => {
              const share = getGamePreference(game.id).share;
              const editable = game.source === "custom";
              return (
                <Stack
                  key={game.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                  minWidth={0}
                  py={0.75}
                >
                  <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0} flex={1}>
                    <GameIconThumb
                      game={game}
                      source={game.source}
                      playing={game.playing}
                    />
                    <Stack direction="column" spacing={0.2} minWidth={0} flex={1}>
                    <GameNameLabel
                      name={game.name}
                      official={game.source === "builtin"}
                      editable={editable}
                      editing={editingId === game.id}
                      draft={editDraft}
                      onBeginEdit={() => beginEdit(game.id, game.name)}
                      onDraftChange={setEditDraft}
                      onCommit={() => commitEdit(game.id, game.name)}
                      onCancel={cancelEdit}
                      placeholder={t("registeredGames.namePlaceholder")}
                      officialLabel={t("registeredGames.officialGame")}
                    />
                    <Typography level="body-xs" textColor="muted">
                      {game.playing
                        ? t("registeredGames.nowPlaying")
                        : formatLastPlayed(game.lastPlayedAt, t, now)}
                    </Typography>
                  </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      variant="plain"
                      size="sm"
                      aria-label={t("registeredGames.toggleShare")}
                      onClick={() => onToggleShare(game.id, !share)}
                    >
                      {share ? (
                        <EyeIcon weight="fill" />
                      ) : (
                        <EyeSlashIcon weight="fill" />
                      )}
                    </IconButton>
                    {editable && (
                      <IconButton
                        variant="plain"
                        size="sm"
                        color="danger"
                        aria-label={t("registeredGames.remove")}
                        onClick={() => onRemove(game.id)}
                      >
                        <TrashIcon weight="fill" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              );
            })
          )}
        </Paper>
      </Stack>
    </Stack>
  );
});
