import { Paper } from "@components/Paper";
import {
  ProfileBlockBackgroundFill,
  profileBlockSurfaceCss
} from "@components/Profile/shared/ProfileBlockBackgroundFill";
import { useAppStore } from "@hooks/useStores";
import type { ProfileCountdownBlock } from "@mutualzz/types";
import { resolveProfileBlockCornerRadius } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { TimerIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const REFRESH_INTERVAL_MS = 30_000;

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <Stack direction="column" alignItems="center" flex={1} minWidth={0}>
    <Typography
      fontWeight={800}
      css={{
        fontSize: "var(--pcf-title)",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.1
      }}
    >
      {value}
    </Typography>
    <Typography
      level="body-xs"
      textColor="muted"
      css={{ fontSize: "var(--pcf-xs)" }}
    >
      {label}
    </Typography>
  </Stack>
);

export const ProfileCountdownBlockView = observer(
  ({ block }: { block: ProfileCountdownBlock }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
      const intervalId = window.setInterval(
        () => setNow(Date.now()),
        REFRESH_INTERVAL_MS
      );
      return () => window.clearInterval(intervalId);
    }, []);

    const target = dayjs(block.targetAt);
    const isValid = target.isValid();
    const remaining = isValid ? target.valueOf() - now : 0;

    const content = (() => {
      if (!isValid) {
        return (
          <Typography level="body-sm" textColor="muted">
            {t("profile.countdown.pickDate")}
          </Typography>
        );
      }

      if (remaining > 0) {
        return (
          <Stack direction="row" spacing={1} width="100%">
            <CountdownUnit
              value={Math.floor(remaining / DAY_MS)}
              label={t("profile.countdown.days")}
            />
            <CountdownUnit
              value={Math.floor((remaining % DAY_MS) / HOUR_MS)}
              label={t("profile.countdown.hours")}
            />
            <CountdownUnit
              value={Math.floor((remaining % HOUR_MS) / MINUTE_MS)}
              label={t("profile.countdown.minutes")}
            />
          </Stack>
        );
      }

      const nowDate = dayjs(now);
      return (
        <Typography
          fontWeight={800}
          css={{ fontSize: "var(--pcf-title)", textAlign: "center" }}
        >
          {target.isSame(nowDate, "day")
            ? t("profile.countdown.today")
            : t("profile.countdown.happened", {
                relative: target.from(nowDate)
              })}
        </Typography>
      );
    })();

    return (
      <Paper
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        width="100%"
        height="100%"
        p={1.5}
        borderRadius={cornerRadius}
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        css={{ ...profileBlockSurfaceCss, overflow: "hidden" }}
      >
        <ProfileBlockBackgroundFill backgroundColor={block.backgroundColor} />
        <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
          <TimerIcon size={16} weight="fill" />
          <Typography
            level="body-sm"
            fontWeight={700}
            css={{
              fontSize: "var(--pcf-sm)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {block.title?.trim() || t("profile.blocks.countdown")}
          </Typography>
        </Stack>
        {content}
        {isValid && (
          <Typography
            level="body-xs"
            textColor="muted"
            css={{ fontSize: "var(--pcf-xs)" }}
          >
            {target.toDate().toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short"
            })}
          </Typography>
        )}
      </Paper>
    );
  }
);
