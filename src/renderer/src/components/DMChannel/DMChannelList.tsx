import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { DMChannelItem } from "@components/DMChannel/DMChannelItem";
import { Stack, Tooltip, Typography } from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import { FaPlus } from "react-icons/fa";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useModal } from "@contexts/Modal.context";
import { DMChannelCreate } from "@components/DMChannel/DMChannelCreate";

export const DMChannelList = observer(() => {
    const app = useAppStore();
    const dms = app.channels.dms;

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
            <Stack alignItems="center" justifyContent="space-between">
                <Typography level="body-xs">Direct Messages</Typography>
                <Tooltip
                    content={<TooltipWrapper>New Message</TooltipWrapper>}
                    placement="top"
                >
                    <IconButton
                        onClick={() =>
                            openModal("create-group-dm", <DMChannelCreate />)
                        }
                        size={12}
                    >
                        <FaPlus />
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
                    You have no direct messages yet. Start a conversation by
                    clicking "Message" on a user's profile or by creating a new
                    group DM!
                </Typography>
            )}
            {dms.map((dm) => (
                <DMChannelItem key={dm.id} channel={dm} />
            ))}
        </Paper>
    );
});
