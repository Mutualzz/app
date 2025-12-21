import { ContextMenu } from "@components/ContextMenu";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Item } from "@mutualzz/contexify";
import { Box } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { FaClipboard, FaHashtag, FaPaperPlane } from "react-icons/fa";
import { CategoryCreateModal } from "../Category/CategoryCreateModal";
import { ChannelCreateModal } from "../ChannelCreateModal";

interface Props {
    space: Space;
}

export const ChannelListContextMenu = observer(({ space }: Props) => {
    const app = useAppStore();
    const { openModal } = useModal();

    const canModifySpace =
        app.account && space.owner && space.owner.id === app.account.id;

    return (
        <ContextMenu
            elevation={app.preferEmbossed ? 5 : 1}
            transparency={65}
            id={`channel-list-context-menu-${space.id}`}
            key={space.id}
        >
            {canModifySpace && (
                <Box>
                    <Item
                        onClick={() =>
                            openModal(
                                "create-channel",
                                <ChannelCreateModal space={space} />,
                            )
                        }
                        endDecorator={<FaHashtag />}
                    >
                        Create Channel
                    </Item>
                    <Item
                        onClick={() =>
                            openModal(
                                "create-category",
                                <CategoryCreateModal space={space} />,
                            )
                        }
                        endDecorator={<FaClipboard />}
                    >
                        Create Category
                    </Item>
                </Box>
            )}
            <Item
                onClick={() =>
                    openModal(
                        `invite-to-space-${space.id}`,
                        <SpaceInviteToSpaceModal />,
                    )
                }
                endDecorator={<FaPaperPlane />}
            >
                Invite to Space
            </Item>
        </ContextMenu>
    );
});
