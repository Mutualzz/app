import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Item, Menu } from "@mutualzz/contexify";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { CategoryDeleteModal } from "../Category/CategoryDeleteModal";

interface Props {
    space: Space;
    channel: Channel;
    isCategory: boolean;
}

export const ChannelListItemContextMenu = observer(
    ({ space, channel, isCategory }: Props) => {
        const app = useAppStore();
        const { openModal } = useModal();
        const navigate = useNavigate();

        const { mutate: deleteChannel, isPending: isDeleting } = useMutation({
            mutationKey: ["delete-channel", channel.id],
            mutationFn: async () => channel.delete(false),
            onSuccess: ({ channelId }) => {
                if (app.channels.activeId === channelId)
                    navigate({
                        to: "/spaces/$spaceId/$channelId",
                        params: {
                            spaceId: space.id,
                            channelId: space.firstNavigableChannel?.id || "",
                        },
                    });
            },
        });

        const canModifyChannel =
            app.account && space.owner && space.owner.id === app.account.id;

        return (
            <Menu id={`channel-context-menu-${channel.id}`}>
                {!isCategory && (
                    <Item
                        onClick={() =>
                            openModal(
                                `invite-to-space-${space.id}`,
                                <SpaceInviteToSpaceModal channel={channel} />,
                            )
                        }
                        endDecorator={<FaPaperPlane />}
                    >
                        Invite to Channel
                    </Item>
                )}

                {canModifyChannel && (
                    <>
                        <Item
                            onClick={() =>
                                isCategory && channel.hasChildren
                                    ? openModal(
                                          `delete-category-${channel.id}`,
                                          <CategoryDeleteModal
                                              channel={channel}
                                          />,
                                      )
                                    : deleteChannel()
                            }
                            disabled={isDeleting}
                            color="danger"
                            size="sm"
                            endDecorator={<FaTrash />}
                        >
                            Delete {isCategory ? "Category" : "Channel"}
                        </Item>
                    </>
                )}
            </Menu>
        );
    },
);
