import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { BridgeChatView } from "@components/Views/BridgeChatView";
import { observer } from "mobx-react-lite";

export const Route = createFileRoute("/_authenticated/@me/bridges/$bridgeId")({
  component: observer(RouteComponent),
});

function RouteComponent() {
  const app = useAppStore();
  const { bridgeId } = Route.useParams();

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
