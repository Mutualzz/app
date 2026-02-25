import { ContextMenu } from "@components/ContextMenu.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { Box } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space.ts";
import { observer } from "mobx-react-lite";
import { FaClipboard, FaHashtag, FaPaperPlane } from "react-icons/fa";
import { CategoryCreateModal } from "../Channel/Category/CategoryCreateModal.tsx";
import { ChannelCreateModal } from "../Channel/ChannelCreateModal.tsx";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { useMemo } from "react";
import { ContextItem } from "@components/ContextItem.tsx";

interface Props {
    space: Space;
}

export const ChannelListContextMenu = observer(({ space }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const canManageChannels = useMemo(
        () => space.members.me?.hasPermission("ManageChannels"),
        [space.members.me],
    );

    const canInvite = useMemo(
        () => space.members.me?.hasPermission("CreateInvites"),
        [space.members.me],
    );

    return (
        <ContextMenu
            id={generateMenuIDs.channelList(space.id)}
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            key={space.id}
        >
            {canManageChannels && (
                <Box>
                    <ContextItem
                        onClick={() =>
                            openModal(
                                "create-channel",
                                <ChannelCreateModal space={space} />,
                            )
                        }
                        endDecorator={<FaHashtag />}
                    >
                        Create Channel
                    </ContextItem>
                    <ContextItem
                        onClick={() =>
                            openModal(
                                "create-category",
                                <CategoryCreateModal space={space} />,
                            )
                        }
                        endDecorator={<FaClipboard />}
                    >
                        Create Category
                    </ContextItem>
                </Box>
            )}
            {canInvite && (
                <ContextItem
                    onClick={() =>
                        openModal(
                            `invite-to-space-${space.id}`,
                            <SpaceInviteToSpaceModal />,
                        )
                    }
                    endDecorator={<FaPaperPlane />}
                >
                    Invite to Space
                </ContextItem>
            )}
        </ContextMenu>
    );
});
