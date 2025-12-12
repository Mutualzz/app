import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Item, Menu } from "@mutualzz/contexify";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react";
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
        <Menu id={`channel-list-context-menu-${space.id}`}>
            {canModifySpace && (
                <>
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
                </>
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
        </Menu>
    );
});
