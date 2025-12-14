import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { contextMenu } from "@mutualzz/contexify";
import {
    IconButton,
    Portal,
    Stack,
    Typography,
    useTheme,
    type PaperProps,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react";
import { useState, type MouseEvent } from "react";
import { FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";
import { ChannelCreateModal } from "../ChannelCreateModal";
import { ChannelIcon } from "../ChannelIcon";
import { ChannelListItemContextMenu } from "./ChannelListtemContextMenu";

interface Props extends PaperProps {
    space: Space;
    channel: Channel;
    isCategory: boolean;
    active: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: (channelId: string) => void;
}

export const ChannelListItem = observer(
    ({
        channel,
        isCategory,
        active,
        isCollapsed,
        space,
        onToggleCollapse,
        ...props
    }: Props) => {
        const { theme } = useTheme();
        const { openModal } = useModal();
        const app = useAppStore();
        const [wrapperHovered, setWrapperHovered] = useState(false);

        const showChannelMenu = (e: MouseEvent) => {
            e.stopPropagation();
            contextMenu.show({
                event: e,
                id: `channel-context-menu-${channel.id}`,
            });
        };

        const canModifyChannel =
            app.account && space.owner && space.owner.id === app.account.id;

        const handleClick = () => {
            if (isCategory && onToggleCollapse) {
                onToggleCollapse(channel.id);
                return;
            }

            if (!channel.isTextChannel) return;

            app.channels.setActive(channel.id);
        };

        return (
            <>
                <Paper
                    ml={isCategory ? 0.5 : channel.parent ? 1.5 : 0.5}
                    px={isCategory ? 1 : 1.5}
                    mr={isCategory ? 1 : 2.5}
                    borderRadius={6}
                    key={channel.id}
                    css={{ cursor: "pointer" }}
                    onClick={handleClick}
                    variant={active ? "soft" : "plain"}
                    onMouseEnter={() => setWrapperHovered(true)}
                    onMouseLeave={() => setWrapperHovered(false)}
                    alignItems="center"
                    height="100%"
                    justifyContent="space-between"
                    onContextMenu={showChannelMenu}
                    color={props.color as any}
                    {...props}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={isCategory ? 1 : 1.5}
                    >
                        {!isCategory && <ChannelIcon type={channel.type} />}

                        <Typography
                            textColor={
                                isCategory && wrapperHovered
                                    ? "primary"
                                    : "secondary"
                            }
                            fontSize={isCategory ? 12 : 14}
                            fontWeight={isCategory ? 400 : 600}
                            letterSpacing={isCategory ? 0.5 : 0}
                        >
                            {channel.name}
                        </Typography>
                        {isCategory && (
                            <>
                                {isCollapsed ? (
                                    <FaChevronRight
                                        size={8}
                                        color={
                                            theme.typography.colors.secondary
                                        }
                                    />
                                ) : (
                                    <FaChevronDown
                                        size={8}
                                        color={
                                            theme.typography.colors.secondary
                                        }
                                    />
                                )}
                            </>
                        )}
                    </Stack>
                    {isCategory && canModifyChannel && (
                        <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            css={{
                                borderRadius: 9999,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(
                                    "create-channel",
                                    <ChannelCreateModal
                                        space={space}
                                        parent={channel}
                                    />,
                                );
                            }}
                        >
                            <FaPlus size={12} />
                        </IconButton>
                    )}
                </Paper>
                <Portal>
                    <ChannelListItemContextMenu
                        isCategory={isCategory}
                        space={space}
                        channel={channel}
                    />
                </Portal>
            </>
        );
    },
);
