import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import {
  discordOAuthNativeReturnUrl,
  isNativeDiscordOAuthClient,
  type DiscordOAuthExchangeResult
} from "@mutualzz/client";
import type { APIPrivateUser } from "@mutualzz/types";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isElectron } from "@utils/index";
import { returnToDiscordImport } from "@renderer/utils/discordImportReturn";

const KNOWN_RESULT_ERRORS: Record<string, string> = {
  access_denied: "discordAuth.cancelled",
  email_exists: "discordAuth.emailExists",
  import_no_guild: "discordAuth.importNoGuild"
};

const exchangeFailureKey = (error: unknown) => {
  const { status, message } = (error ?? {}) as {
    status?: number;
    message?: string;
  };
  if (status === 400 && message === "OAuth state expired")
    return "discordAuth.stateExpired";
  if (status === 409) return "discordAuth.alreadyLinked";
  return null;
};

export const Route = createFileRoute("/auth/discord/callback")({
  component: observer(DiscordCallbackPage),
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string | undefined) ?? undefined,
    state: (search.state as string | undefined) ?? undefined,
    token: (search.token as string | undefined) ?? undefined,
    pending: (search.pending as string | undefined) ?? undefined,
    linked: search.linked === "1" || search.linked === 1 ? true : undefined,
    error: (search.error as string | undefined) ?? undefined
  })
});

function DiscordCallbackPage() {
  const app = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation("settings");
  const search = Route.useSearch();
  const [message, setMessage] = useState(t("discordAuth.processing"));
  const [failed, setFailed] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const showFailure = (failureMessage: string) => {
      setMessage(failureMessage);
      setFailed(true);
    };

    const showResultError = (errorCode: string) => {
      const knownKey = KNOWN_RESULT_ERRORS[errorCode];
      showFailure(
        knownKey
          ? t(knownKey)
          : t("discordAuth.errorWithReason", { reason: errorCode })
      );
    };

    if (search.error) {
      showResultError(search.error);
      return;
    }

    const applyResult = (result: DiscordOAuthExchangeResult) => {
      const nativeUrl = discordOAuthNativeReturnUrl(result);
      if (
        nativeUrl &&
        !isElectron &&
        isNativeDiscordOAuthClient(result.client)
      ) {
        window.location.href = nativeUrl;
        return;
      }

      if (result.result === "token") {
        app.setToken(result.token);
        navigate({ to: "/app", replace: true });
        return;
      }

      if (result.result === "pending") {
        navigate({
          to: "/register/discord",
          replace: true,
          search: { pending: result.pendingId }
        });
        return;
      }

      if (result.result === "linked") {
        sessionStorage.setItem("settings-return", "connections");
        void app.rest.get<APIPrivateUser>("/@me").then((user) => {
          app.setUser(user);
          void app.profiles.resolve(user.id, true);
          navigate({ to: "/app", replace: true });
        });
        return;
      }

      if (result.result === "import") {
        returnToDiscordImport(result.guildId);
        navigate({ to: "/app", replace: true });
        return;
      }

      if (result.result === "error") {
        showResultError(result.error);
        return;
      }

      showFailure(t("discordAuth.error"));
    };

    if (search.code && search.state) {
      handled.current = true;
      void app.rest
        .post<DiscordOAuthExchangeResult>("auth/discord/exchange", {
          code: search.code,
          state: search.state
        })
        .then(applyResult)
        .catch((error: unknown) => {
          const knownKey = exchangeFailureKey(error);
          const reason = (error as { message?: string } | null)?.message;
          showFailure(
            knownKey
              ? t(knownKey)
              : reason
                ? t("discordAuth.errorWithReason", { reason })
                : t("discordAuth.error")
          );
        });
      return;
    }

    if (search.token) {
      app.setToken(search.token);
      navigate({ to: "/app", replace: true });
      return;
    }

    if (search.pending) {
      navigate({
        to: "/register/discord",
        replace: true,
        search: { pending: search.pending }
      });
      return;
    }

    if (search.linked) {
      sessionStorage.setItem("settings-return", "connections");
      void app.rest.get<APIPrivateUser>("/@me").then((user) => {
        app.setUser(user);
        void app.profiles.resolve(user.id, true);
        navigate({ to: "/app", replace: true });
      });
      return;
    }

    showFailure(t("discordAuth.invalidCallback"));
  }, [app, navigate, search, t]);

  if (app.token && !search.pending && !search.error && !search.code) {
    return <Navigate to="/app" replace />;
  }

  return (
    <Stack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      direction="column"
      spacing={2}
    >
      <Typography level="body-lg" textAlign="center">
        {message}
      </Typography>
      {failed ? (
        <Typography level="body-sm" textColor="muted" textAlign="center">
          {t("discordAuth.retryHint")}
        </Typography>
      ) : null}
    </Stack>
  );
}
