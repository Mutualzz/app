import { ThemeProvider } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { WarningIcon } from "@phosphor-icons/react";

function getReloadShortcut() {
  if (typeof navigator === "undefined") return "Ctrl+R";
  return /mac/i.test(navigator.userAgent) ? "⌘R" : "Ctrl+R";
}

export function AppCrashFallback() {
  const shortcut = getReloadShortcut();

  return (
    <ThemeProvider theme={baseDarkTheme}>
      <Stack
        alignItems="center"
        justifyContent="center"
        width="100vw"
        height="100dvh"
        gap={2}
        padding={3}
        css={{
          backgroundColor: baseDarkTheme.colors.background,
          boxSizing: "border-box"
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
          Something went wrong
        </Typography>
        <Typography
          level="body-md"
          textColor="secondary"
          css={{ textAlign: "center", maxWidth: 420 }}
        >
          Mutualzz ran into an unexpected error. Reload the app to try again.
        </Typography>
        <Button size="lg" onClick={() => window.location.reload()}>
          Reload app
        </Button>
        <Typography level="body-sm" textColor="muted" css={{ textAlign: "center" }}>
          Or press {shortcut}
        </Typography>
      </Stack>
    </ThemeProvider>
  );
}
