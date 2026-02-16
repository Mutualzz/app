import { Paper } from "@components/Paper.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import {
    IconButton,
    Stack,
    Typography,
    useTheme,
    type PaperProps,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel.ts";
import type { Space } from "@stores/objects/Space.ts";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState, useMemo } from "react";
import { FaChevronDown, FaChevronRight, FaPlus } from "react-icons/fa";
import { ChannelCreateModal } from "./ChannelCreateModal.tsx";
import { ChannelIcon } from "./ChannelIcon.tsx";
import { ChannelType } from "@mutualzz/types";
import { useMenu } from "@contexts/ContextMenu.context.tsx";

interface Props extends PaperProps {
    space: Space;
    channel: Channel;
    active: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: (channelId: string) => void;
}

export const ChannelListItem = observer(
    ({
        channel,
        active,
        isCollapsed,
        space,
        onToggleCollapse,
        ...props
    }: Props) => {
        const { openContextMenu } = useMenu();
        const { theme } = useTheme();
        const { openModal } = useModal();
        const app = useAppStore();
        const navigate = useNavigate();
        const [wrapperHovered, setWrapperHovered] = useState(false);

        const isCategory = useMemo(
            () => channel.type === ChannelType.Category,
            [channel.type],
        );

        const canModifyChannel =
            app.account && space.owner && space.owner.id === app.account.id;

        const handleClick = () => {
            if (isCategory && onToggleCollapse) {
                onToggleCollapse(channel.id);
                return;
            }

            if (!channel.isTextChannel) return;
            if (active) return;

            navigate({
                to: "/spaces/$spaceId/$channelId",
                params: { spaceId: space.id, channelId: channel.id },
            });
        };

        return (
            <>
                <Paper
                    ml={isCategory ? 1.5 : channel.parent ? 2.5 : 1.5}
                    px={isCategory ? 1 : 1.5}
                    mr={isCategory ? 1 : 2.5}
                    borderRadius={6}
                    key={channel.id}
                    css={{
                        cursor: "pointer",
                    }}
                    onClick={handleClick}
                    variant={active ? "soft" : "plain"}
                    onMouseEnter={() => setWrapperHovered(true)}
                    onMouseLeave={() => setWrapperHovered(false)}
                    alignItems="center"
                    height="100%"
                    justifyContent="space-between"
                    onContextMenu={(e) =>
                        openContextMenu(e, { type: "channel", space, channel })
                    }
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
            </>
        );
    },
);
