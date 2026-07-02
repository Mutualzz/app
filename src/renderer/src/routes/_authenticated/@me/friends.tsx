import { Stack, Typography } from "@mutualzz/ui-web";
import { PersonIcon } from "@phosphor-icons/react";
import { Button } from "@renderer/components/Button";
import { AddFriendTab } from "@renderer/components/Friends/AddFriendTab";
import { AllTab } from "@renderer/components/Friends/AllTab";
import { OnlineTab } from "@renderer/components/Friends/OnlineTab";
import { PendingTab } from "@renderer/components/Friends/PendingTab";
import { Paper } from "@renderer/components/Paper";
import { useAppStore } from "@renderer/hooks/useStores";
import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/@me/friends")({
  component: observer(RouteComponent)
});

type Tabs = "online" | "all" | "pending" | "add-friend";

function RouteComponent() {
  const app = useAppStore();

  const [tab, setTab] = useState<Tabs>("online");

  return (
    <Stack flex={1} direction="column">
      <Paper
        borderLeft="0 !important"
        borderRight="0 !important"
        p={2.5}
        alignItems="center"
        spacing={2.5}
        elevation={app.settings?.preferEmbossed ? 4 : 0}
      >
        <Stack alignItems="center" direction="row" spacing={1.25}>
          <PersonIcon weight="fill" size={24} />
          <Typography level="body-lg">Friends</Typography>
        </Stack>
        <svg
          aria-hidden="true"
          role="img"
          width={4}
          height={4}
          viewBox="0 0 4 4"
        >
          <circle cx="2" cy="2" r="2" fill="currentColor"></circle>
        </svg>
        <Stack alignItems="center" direction="row" spacing={2.5}>
          <Button
            variant={tab === "online" ? "soft" : "plain"}
            onClick={() => setTab("online")}
          >
            Online
          </Button>
          <Button
            variant={tab === "all" ? "soft" : "plain"}
            onClick={() => setTab("all")}
          >
            All
          </Button>
          {app.relationships.pending.length > 0 && (
            <Button
              variant={tab === "pending" ? "soft" : "plain"}
              onClick={() => setTab("pending")}
            >
              Pending
            </Button>
          )}
          <Button
            color="primary"
            variant={tab === "add-friend" ? "soft" : "solid"}
            onClick={() => setTab("add-friend")}
          >
            Add Friend
          </Button>
        </Stack>
      </Paper>

      <Paper
        borderLeft="0 !important"
        borderRight="0 !important"
        borderBottom="0 !important"
        p={2.5}
        elevation={app.settings?.preferEmbossed ? 3 : 0}
        flex={1}
      >
        {tab === "online" && <OnlineTab />}
        {tab === "all" && <AllTab />}
        {tab === "pending" && app.relationships.pending.length > 0 && (
          <PendingTab />
        )}
        {tab === "add-friend" && <AddFriendTab />}
      </Paper>
    </Stack>
  );
}
