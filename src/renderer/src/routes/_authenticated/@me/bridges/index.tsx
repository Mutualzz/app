import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Stack, Typography } from "@mutualzz/ui-web";
import { CubeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface BridgeSummary {
  id: string;
  name: string;
}

export const Route = createFileRoute("/_authenticated/@me/bridges/")({
  component: observer(RouteComponent),
});

function RouteComponent() {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const navigate = useNavigate();

  const bridgesQuery = useQuery({
    queryKey: ["me", "bridges"],
    queryFn: () => app.rest.get<BridgeSummary[]>("/@me/bridges"),
  });

  const bridges = bridgesQuery.data ?? [];

  useEffect(() => {
    if (!bridges[0]) return;
    navigate({
      to: "/@me/bridges/$bridgeId",
      params: { bridgeId: bridges[0].id },
      replace: true,
    });
  }, [bridges, navigate]);

  if (bridgesQuery.isLoading || bridges.length > 0) {
    return null;
  }

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 3 : 0}
      direction="column"
      flex="1 1 auto"
      overflow="hidden"
      borderLeft="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      p={4}
    >
      <CubeIcon size={40} />
      <Stack direction="column" spacing={1} alignItems="center" maxWidth={360}>
        <Typography level="title-md" fontWeight="bold" textAlign="center">
          {t("minecraftBridge.sidebarEmptyTitle")}
        </Typography>
        <Typography level="body-sm" textColor="muted" textAlign="center">
          {t("minecraftBridge.sidebarEmpty")}
        </Typography>
      </Stack>
    </Paper>
  );
}
