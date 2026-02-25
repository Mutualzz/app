import { ContextMenu } from "@components/ContextMenu.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Box } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel.ts";
import type { Space } from "@stores/objects/Space.ts";
import { observer } from "mobx-react-lite";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { CategoryDeleteModal } from "../Channel/Category/CategoryDeleteModal.tsx";
import { ChannelType } from "@mutualzz/types";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { useMemo } from "react";
import { ChannelActionConfirm } from "@components/Modals/ChannelActionConfirm.tsx";
import { ContextItem } from "@components/ContextItem.tsx";

interface Props {
    space: Space;
    channel: Channel;
}

export const ChannelItemContextMenu = observer(({ space, channel }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const canModifyChannel = useMemo(
        () => space.members.me?.hasPermission("ManageChannels", channel),
        [space.members.me, channel],
    );

    const isCategory = channel.type === ChannelType.Category;

    const canInvite = useMemo(
        () => space.members.me?.hasPermission("CreateInvites", channel),
        [space.members.me, channel],
    );

    return (
        <ContextMenu
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            id={generateMenuIDs.channel(space.id, channel.id)}
            key={channel.id}
        >
            {!isCategory && canInvite && (
                <ContextItem
                    onClick={() =>
                        openModal(
                            `invite-to-space-${space.id}`,
                            <SpaceInviteToSpaceModal channel={channel} />,
                        )
                    }
                    endDecorator={<FaPaperPlane />}
                >
                    Invite to Channel
                </ContextItem>
            )}

            {canModifyChannel && (
                <Box>
                    <ContextItem
                        onClick={() =>
                            isCategory && channel.hasChildren
                                ? openModal(
                                      `delete-category-${channel.id}`,
                                      <CategoryDeleteModal channel={channel} />,
                                  )
                                : openModal(
                                      `delete-channel-${channel.id}`,
                                      <ChannelActionConfirm
                                          channel={channel}
                                      />,
                                  )
                        }
                        color="danger"
                        size="sm"
                        endDecorator={<FaTrash />}
                    >
                        Delete {isCategory ? "Category" : "Channel"}
                    </ContextItem>
                </Box>
            )}
        </ContextMenu>
    );
});
