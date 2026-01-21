import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, IconButton, Tooltip } from "@mutualzz/ui-web";
import type { Message } from "@stores/objects/Message";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import { FaTrash } from "react-icons/fa";

interface Props extends PropsWithChildren {
    message: Message;
    header?: boolean;
}

const ToolbarContent = ({ message }: Props) => {
    const app = useAppStore();

    const { mutate: deleteMessage } = useMutation({
        mutationKey: ["delete-message", message.id],
        mutationFn: () => message.delete(),
    });

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
            elevation={app.preferEmbossed ? 5 : 2}
            transparency={25}
        >
            <ButtonGroup color="neutral" size="sm" variant="plain">
                {message.author?.id === app.account?.id && (
                    <Tooltip
                        offset={16}
                        content={<TooltipWrapper>Delete</TooltipWrapper>}
                    >
                        <IconButton
                            color="danger"
                            onClick={() => deleteMessage()}
                        >
                            <FaTrash />
                        </IconButton>
                    </Tooltip>
                )}
            </ButtonGroup>
        </Paper>
    );
};

export const MessageToolbar = observer(
    ({ message, header, children }: Props) => {
        return (
            <Tooltip
                placement="right-start"
                content={<ToolbarContent message={message} />}
                offset={{ crossAxis: header ? -10 : -20, mainAxis: -65 }}
                disablePortal
            >
                {children}
            </Tooltip>
        );
    },
);
