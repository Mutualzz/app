import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { DMChannelItem } from "@components/DMChannel/DMChannelItem";
import { Stack, Typography } from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import { useModal } from "@contexts/Modal.context";
import { DMChannelCreate } from "@components/DMChannel/DMChannelCreate";
import { PlusIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useMemo } from "react";

export const DMChannelList = observer(() => {
  const app = useAppStore();
  const dms = app.channels.dms;

  const dmKey = dms
    .map((d) => d.id)
    .sort()
    .join(",");
  const stableDMs = useMemo(() => dms, [dmKey]);

  const { openModal } = useModal();

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      direction="column"
      width="100%"
      spacing={1.25}
      borderBottom="0 !important"
      borderRight="0 !important"
      borderLeft="0 !important"
      position="relative"
      p={2.5}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="label-xs">Direct Messages</Typography>
        <Tooltip content="New Message" placement="top">
          <IconButton
            onClick={() => openModal("create-group-dm", <DMChannelCreate />)}
            size={12}
          >
            <PlusIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {dms.length === 0 && (
        <Typography
          level="body-sm"
          textColor="secondary"
          textAlign="center"
          mt={2}
        >
          You have no direct messages yet. Start a conversation by clicking
          "Message" on a user's profile or by creating a new group DM!
        </Typography>
      )}
      {stableDMs.map((dm) => (
        <DMChannelItem key={dm.id} channel={dm} />
      ))}
    </Paper>
  );
});
