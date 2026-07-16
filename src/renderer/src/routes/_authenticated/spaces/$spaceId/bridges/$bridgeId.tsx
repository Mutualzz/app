import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { BridgeChatView } from "@components/Views/BridgeChatView";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/_authenticated/spaces/$spaceId/bridges/$bridgeId",
)({
  component: observer(RouteComponent),
});

function RouteComponent() {
  const app = useAppStore();
  const { spaceId, bridgeId } = Route.useParams();

  useEffect(() => {
    app.spaces.setActive(spaceId);
    app.spaces.setSidebarTab(spaceId, "bridges");
  }, [app.spaces, spaceId]);

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 3 : 0}
      direction="column"
      flex="1 1 auto"
      overflow="hidden"
      borderLeft="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
    >
      <BridgeChatView bridgeId={bridgeId} />
    </Paper>
  );
}
