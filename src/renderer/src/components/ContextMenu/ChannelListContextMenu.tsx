import { ContextMenu } from "@components/ContextMenu";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Box } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { FaClipboard, FaHashtag, FaPaperPlane } from "react-icons/fa";
import { CategoryCreateModal } from "../Channel/Category/CategoryCreateModal";
import { ChannelCreateModal } from "../Channel/ChannelCreateModal";
import { generateMenuIDs } from "@contexts/ContextMenu.context";
import { ContextItem } from "@components/ContextItem";

interface Props {
    space: Space;
}

export const ChannelListContextMenu = observer(({ space }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const canManageChannels = space.members.me?.hasPermission("ManageChannels");
    const canInvite = space.members.me?.hasPermission("CreateInvites");

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
                                <ChannelCreateModal space={space} />
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
                                <CategoryCreateModal space={space} />
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
                            <SpaceInviteToSpaceModal />
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
