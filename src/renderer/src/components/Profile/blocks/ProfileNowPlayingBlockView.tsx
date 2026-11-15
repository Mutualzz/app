import { Paper } from "@components/Paper";
import { ActivityIcon } from "@components/Presence/ActivityIcon";
import {
  ProfileBlockBackgroundFill,
  profileBlockSurfaceCss
} from "@components/Profile/shared/ProfileBlockBackgroundFill";
import { useNow } from "@hooks/useNow";
import { useAppStore } from "@hooks/useStores";
import {
  activityTypeLabelKey,
  formatTrackClock,
  getActivityProgress,
  getNonCustomActivities
} from "@mutualzz/client";
import type {
  PresencePayload,
  ProfileNowPlayingBlock,
  Snowflake
} from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { MusicNotesIcon } from "@phosphor-icons/react";
import { useLyricLine } from "@renderer/hooks/useLyricLine";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

const singleLine = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
  minWidth: 0
};

const PROGRESS_TICK_MS = 1000;

export const getListeningActivity = (
  presence: PresencePayload | null | undefined
) =>
  presence && presence.status !== "offline"
    ? (getNonCustomActivities(presence).find(
        (activity) => activity.type === "listening"
      ) ?? null)
    : null;
const ARTWORK_SIZE = 72;

export const ProfileNowPlayingBlockView = observer(
  ({ block, userId }: { block: ProfileNowPlayingBlock; userId: Snowflake }) => {
    const { t } = useTranslation("settings");
    const { t: tCommon } = useTranslation("common");
    const app = useAppStore();
    const { theme } = useTheme();
    const now = useNow(PROGRESS_TICK_MS);
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const listening = getListeningActivity(app.presence.get(userId));
    const lyricLine = useLyricLine(listening);
    const accent = String(theme.colors.success);

    const progress = listening ? getActivityProgress(listening, now) : null;
    const typeKey = listening ? activityTypeLabelKey(listening.type) : null;
    const title = listening
      ? listening.details?.trim() || listening.name
      : null;
    const artist = listening?.state?.trim();

    return (
      <Paper
        direction="column"
        justifyContent="center"
        spacing={1}
        width="100%"
        height="100%"
        p={1.5}
        borderRadius={cornerRadius}
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        css={{ ...profileBlockSurfaceCss, overflow: "hidden" }}
      >
        <ProfileBlockBackgroundFill backgroundColor={block.backgroundColor} />

        {!listening ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <MusicNotesIcon size={20} weight="fill" css={{ opacity: 0.5 }} />
            <Typography
              level="body-sm"
              textColor="muted"
              css={{ fontSize: "var(--pcf-sm)" }}
            >
              {t("profile.nowPlaying.idle")}
            </Typography>
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              minWidth={0}
            >
              <ActivityIcon
                activity={listening}
                size={ARTWORK_SIZE}
                color={accent}
                borderRadius={8}
              />
              <Stack direction="column" spacing={0.25} minWidth={0} flex={1}>
                <Typography
                  level="body-xs"
                  css={{
                    opacity: 0.65,
                    fontSize: "var(--pcf-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    fontWeight: 700,
                    ...singleLine
                  }}
                >
                  {typeKey
                    ? `${tCommon(typeKey)} · ${listening.name}`
                    : listening.name}
                </Typography>
                <Typography
                  fontWeight={800}
                  css={{ fontSize: "var(--pcf-title)", ...singleLine }}
                >
                  {title}
                </Typography>
                {artist && (
                  <Typography
                    level="body-sm"
                    css={{
                      opacity: 0.75,
                      fontSize: "var(--pcf-sm)",
                      ...singleLine
                    }}
                  >
                    {artist}
                  </Typography>
                )}
                {lyricLine && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MusicNotesIcon
                      size={12}
                      weight="fill"
                      color={accent}
                      css={{ flexShrink: 0 }}
                    />
                    <Typography
                      level="body-xs"
                      css={{
                        fontStyle: "italic",
                        fontSize: "var(--pcf-xs)",
                        ...singleLine
                      }}
                    >
                      {lyricLine}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>

            {progress && (
              <Stack direction="column" spacing={0.35}>
                <div
                  css={{
                    height: 4,
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor:
                      "color-mix(in srgb, currentColor 15%, transparent)"
                  }}
                >
                  <div
                    css={{
                      height: "100%",
                      width: `${progress.fraction * 100}%`,
                      borderRadius: 2,
                      backgroundColor: accent
                    }}
                  />
                </div>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    level="body-xs"
                    css={{
                      fontSize: "var(--pcf-xs)",
                      opacity: 0.6,
                      fontVariantNumeric: "tabular-nums"
                    }}
                  >
                    {formatTrackClock(progress.elapsedMs)}
                  </Typography>
                  <Typography
                    level="body-xs"
                    css={{
                      fontSize: "var(--pcf-xs)",
                      opacity: 0.6,
                      fontVariantNumeric: "tabular-nums"
                    }}
                  >
                    {formatTrackClock(progress.durationMs)}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </>
        )}
      </Paper>
    );
  }
);
