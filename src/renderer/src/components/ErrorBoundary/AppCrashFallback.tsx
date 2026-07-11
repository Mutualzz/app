import { ThemeProvider } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { WarningIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadDefaultAppFonts } from "@utils/fonts/loadDefaultAppFonts";

function getReloadShortcut() {
  if (typeof navigator === "undefined") return "Ctrl+R";
  return /mac/i.test(navigator.userAgent) ? "⌘R" : "Ctrl+R";
}

export function AppCrashFallback() {
  const { t } = useTranslation("common");
  const shortcut = getReloadShortcut();

  useEffect(() => {
    loadDefaultAppFonts();
  }, []);

  return (
    <ThemeProvider theme={baseDarkTheme}>
      <Stack
        alignItems="center"
        justifyContent="center"
        width="100vw"
        height="100dvh"
        gap={2}
        padding={3}
        direction="column"
        css={{
          backgroundColor: baseDarkTheme.colors.background,
          boxSizing: "border-box",
          fontFamily: baseDarkTheme.typography.fontFamily,
          color: baseDarkTheme.typography.colors.primary
        }}
      >
        <WarningIcon
          size={48}
          weight="fill"
          color={baseDarkTheme.colors.warning}
        />
        <Typography
          level="title-lg"
          textColor="primary"
          css={{ textAlign: "center" }}
        >
          {t("crash.title")}
        </Typography>
        <Typography
          level="body-md"
          textColor="secondary"
          css={{ textAlign: "center", maxWidth: 420 }}
        >
          {t("crash.bodyDesktop")}
        </Typography>
        <Button size="lg" onClick={() => window.location.reload()}>
          {t("reload")}
        </Button>
        <Typography
          level="body-sm"
          textColor="muted"
          css={{ textAlign: "center" }}
        >
          {t("crash.orPressShortcut", { shortcut })}
        </Typography>
      </Stack>
    </ThemeProvider>
  );
}
