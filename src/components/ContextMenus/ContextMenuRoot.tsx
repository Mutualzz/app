import { observer } from "mobx-react-lite";
import { Portal } from "@mutualzz/ui-web";
import { useMenu } from "@contexts/ContextMenu.context";

import { SpaceContextMenu } from "@components/ContextMenus/SpaceContextMenu";
import { ChannelListContextMenu } from "@components/ContextMenus/ChannelListContextMenu";
import { RoleContextMenu } from "@components/ContextMenus/RoleContextMenu";
import { ChannelItemContextMenu } from "@components/ContextMenus/ChannelItemContextMenu.tsx";
import { SpaceMemberContextMenu } from "@components/ContextMenus/SpaceMemberContextMenu.tsx";
import { AccountContextMenu } from "@components/ContextMenus/AccountContextMenu.tsx";

export const ContextMenuRoot = observer(() => {
    const { menu } = useMenu();
    if (!menu) return null;

    switch (menu.type) {
        case "space":
            return (
                <Portal>
                    <SpaceContextMenu {...menu} />
                </Portal>
            );

        case "channelList":
            return (
                <Portal>
                    <ChannelListContextMenu {...menu} />
                </Portal>
            );
        case "channel":
            return (
                <Portal>
                    <ChannelItemContextMenu {...menu} />
                </Portal>
            );

        case "member":
            return (
                <Portal>
                    <SpaceMemberContextMenu
                        space={menu.space}
                        member={menu.member}
                    />
                </Portal>
            );

        case "account":
            return (
                <Portal>
                    <AccountContextMenu {...menu} />
                </Portal>
            );

        case "user":
            return null;
        // <Portal>
        //     <UserContextMenu user={menu.user} />
        // </Portal>

        case "role":
            return (
                <Portal>
                    <RoleContextMenu {...menu} />
                </Portal>
            );

        default:
            return null;
    }
});
