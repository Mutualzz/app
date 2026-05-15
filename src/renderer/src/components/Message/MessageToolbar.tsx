import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Tooltip } from "@mutualzz/ui-web";
import type { Message } from "@stores/objects/Message";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Props extends PropsWithChildren {
    message: Message;
    header?: boolean;
}

const ToolbarContent = observer(({ message }: Props) => {
    const app = useAppStore();

    const { mutate: deleteMessage } = useMutation({
        mutationKey: ["delete-message", message.id],
        mutationFn: () => message.delete(),
    });

    const me = message.space?.members.me;

    const hideSwitcher = () => {
        if (!app.memberListVisible) {
            app.setHideSwitcher(true);
        }
    };

    const showSwitcher = () => {
        if (!app.memberListVisible) {
            app.setHideSwitcher(false);
        }
    };

    return (
        <Paper
            onMouseEnter={hideSwitcher}
            onMouseLeave={showSwitcher}
            p={2}
            borderRadius={10}
            elevation={app.settings?.preferEmbossed ? 5 : 2}
            transparency={25}
        >
            <Stack spacing={1.25}>
                {message.author?.id === app.account?.id && (
                    <Tooltip
                        offset={16}
                        content={<TooltipWrapper>Edit</TooltipWrapper>}
                    >
                        <IconButton
                            onClick={() => message.setEditing(true)}
                            variant="plain"
                            size="sm"
                        >
                            <FaEdit />
                        </IconButton>
                    </Tooltip>
                )}
                {(message.author?.id === app.account?.id ||
                    me?.hasPermission("ManageMessages")) && (
                    <Tooltip
                        offset={16}
                        content={<TooltipWrapper>Delete</TooltipWrapper>}
                    >
                        <IconButton
                            color="danger"
                            variant="plain"
                            size="sm"
                            onClick={() => deleteMessage()}
                        >
                            <FaTrash />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Paper>
    );
});

export const MessageToolbar = observer(
    ({ message, header, children }: Props) => {
        if (message.editing) return children;

        return (
            <Tooltip
                placement="right-end"
                content={<ToolbarContent message={message} />}
                offset={{ crossAxis: header ? -10 : -20, mainAxis: -90 }}
                disablePortal
            >
                {children}
            </Tooltip>
        );
    },
);
