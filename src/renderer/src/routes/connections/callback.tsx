import Loading from "@components/Loader/Loading";
import { Stack, Typography } from "@mutualzz/ui-web";
import { REST } from "@stores/REST.store";
import { seo } from "@seo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import i18n from "../../i18n";

type ConnectionsCallbackSearch = Record<string, string | undefined>;

export const Route = createFileRoute("/connections/callback")({
  validateSearch: (search: Record<string, unknown>): ConnectionsCallbackSearch => {
    const out: ConnectionsCallbackSearch = {};
    for (const [key, value] of Object.entries(search)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  },
  component: ConnectionsCallback,
  head: () => ({
    meta: [
      ...seo({
        title: "Connecting account"
      })
    ]
  })
});

function readCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const openid: Record<string, string> = {};
  let state = "";
  let code: string | undefined;
  let iss: string | undefined;
  let error: string | undefined;

  for (const [key, value] of params.entries()) {
    if (key.startsWith("openid.")) {
      openid[key] = value;
      continue;
    }
    if (key === "state") state = value;
    else if (key === "code") code = value;
    else if (key === "iss") iss = value;
    else if (key === "error") error = value;
  }

  return { openid, state, code, iss, error };
}

function ConnectionsCallback() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      const { openid, state, code, iss, error } = readCallbackParams();

      if (error || !state) {
        setFailed(true);
        toast.error(
          i18n.t("connections.connectError", { ns: "settings" })
        );
        await navigate({ to: "/@me", replace: true });
        return;
      }

      try {
        const body: Record<string, unknown> = {
          state,
          code,
          iss
        };
        if (Object.keys(openid).length > 0) {
          body.openid = openid;
        }

        const res = await fetch(REST.makeAPIUrl("oauth/connections/complete"), {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("complete failed");
        const data = (await res.json()) as {
          returnTo?: string;
          provider?: string;
        };
        sessionStorage.removeItem("mutualzz.connections.provider");

        const returnTo = data.returnTo ?? "";
        const opensApp = returnTo.startsWith("mutualzz://");
        if (!opensApp) {
          toast.success(
            i18n.t("connections.connectedToast", {
              ns: "settings",
              provider: data.provider
                ? i18n.t(`connections.${data.provider}.name`, {
                    ns: "settings",
                    defaultValue: data.provider
                  })
                : "Account"
            })
          );
        }

        if (opensApp) {
          window.location.href = returnTo;
          return;
        }

        await navigate({ to: "/@me", replace: true });
      } catch {
        setFailed(true);
        toast.error(
          i18n.t("connections.connectError", { ns: "settings" })
        );
        await navigate({ to: "/@me", replace: true });
      }
    };

    void run();
  }, [navigate]);

  return (
    <Stack
      flex={1}
      height="100%"
      alignItems="center"
      justifyContent="center"
      spacing={2.5}
      direction="column"
    >
      <Loading />
      <Typography level="body-md" textColor="muted">
        {failed
          ? i18n.t("connections.connectFailed", { ns: "settings" })
          : i18n.t("connections.connecting", { ns: "settings" })}
      </Typography>
    </Stack>
  );
}
