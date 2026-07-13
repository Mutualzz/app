import Loading from "@components/Loader/Loading";
import { Stack, Typography } from "@mutualzz/ui-web";
import { REST } from "@stores/REST.store";
import { seo } from "@seo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import i18n from "../../i18n";

type SpotifyCallbackSearch = {
  code?: string;
  state?: string;
  error?: string;
};

export const Route = createFileRoute("/spotify/callback")({
  validateSearch: (search: Record<string, unknown>): SpotifyCallbackSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined
  }),
  component: SpotifyCallback,
  head: () => ({
    meta: [
      ...seo({
        title: "Connecting Spotify"
      })
    ]
  })
});

function SpotifyCallback() {
  const navigate = useNavigate();
  const { code, state, error } = Route.useSearch();
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      if (error || !code || !state) {
        setFailed(true);
        toast.error(
          i18n.t("connections.spotify.connectError", { ns: "settings" })
        );
        await navigate({ to: "/@me", replace: true });
        return;
      }

      try {
        const res = await fetch(REST.makeAPIUrl("oauth/spotify/complete"), {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code, state })
        });

        if (!res.ok) throw new Error("complete failed");
        const data = (await res.json()) as { returnTo?: string };

        const returnTo = data.returnTo ?? "";
        const opensApp = returnTo.startsWith("mutualzz://");
        if (!opensApp) {
          toast.success("Spotify connected");
        }

        if (opensApp) {
          window.location.href = returnTo;
          return;
        }

        await navigate({ to: "/@me", replace: true });
      } catch {
        setFailed(true);
        toast.error(
          i18n.t("connections.spotify.connectError", { ns: "settings" })
        );
        await navigate({ to: "/@me", replace: true });
      }
    };

    void run();
  }, [code, error, navigate, state]);

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
        {failed ? "Could not connect Spotify" : "Connecting Spotify…"}
      </Typography>
    </Stack>
  );
}
