import {
    createContext,
    type PropsWithChildren,
    type ReactElement,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { observer } from "mobx-react-lite";
import { contextMenu } from "@mutualzz/contexify";
import { ContextMenuRoot } from "@components/ContextMenus/ContextMenuRoot";
import type { Space } from "@stores/objects/Space";
import type { Channel } from "@stores/objects/Channel";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { User } from "@stores/objects/User";
import type { Role } from "@stores/objects/Role";
import type { AccountStore } from "@stores/Account.store.ts";

export type ContextMenuPayload =
    | { type: "space"; space: Space; fromSidebar?: boolean; [key: string]: any }
    | { type: "channelList"; space: Space; [key: string]: any }
    | { type: "channel"; space: Space; channel: Channel; [key: string]: any }
    | {
          type: "member";
          space: Space;
          member: SpaceMember;

          submenuArrowDirection?: "left" | "right";

          [key: string]: any;
      }
    | { type: "user"; user: User; [key: string]: any }
    | { type: "account"; account: AccountStore; [key: string]: any }
    | {
          type: "role";
          space: Space;
          role: Role;
          [key: string]: any;
      };

export type MenuPosition = { x: number; y: number };
type AnyMouseEvent = MouseEvent | { nativeEvent: MouseEvent };

interface ContextMenuContextProps {
    menu: ContextMenuPayload | null;
    setMenu: (menu: ContextMenuPayload | null) => void;

    openContextMenu: (
        e: AnyMouseEvent,
        menu: ContextMenuPayload,
        position?: MenuPosition | null,
    ) => void;
    clearMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextProps>({
    menu: null,
    setMenu: () => {},
    openContextMenu: () => {},
    clearMenu: () => {},
});

export const generateMenuIDs = {
    space: (spaceId: string, fromSidebar?: boolean) =>
        `context-space-${spaceId}-${fromSidebar ? "sidebar" : "default"}`,
    channelList: (spaceId: string) => `context-channelList-${spaceId}`,
    channel: (spaceId: string, channelId: string) =>
        `context-channel-${spaceId}-${channelId}`,
    member: (spaceId: string, memberId: string) =>
        `context-member-${spaceId}-${memberId}`,
    user: (userId: string) => `context-user-${userId}`,
    role: (spaceId: string, roleId: string) =>
        `context-role-${spaceId}-${roleId}`,

    account: (userId: string) => `context-account-${userId}`,
};

function getMenuId(menu: ContextMenuPayload): string {
    switch (menu.type) {
        case "space":
            return generateMenuIDs.space(menu.space.id, menu.fromSidebar);
        case "channelList":
            return generateMenuIDs.channelList(menu.space.id);
        case "channel":
            return generateMenuIDs.channel(menu.space.id, menu.channel.id);
        case "member":
            return generateMenuIDs.member(menu.space.id, menu.member.id);
        case "user":
            return generateMenuIDs.user(menu.user.id);
        case "account":
            return generateMenuIDs.account(menu.account.id);
        case "role":
            return generateMenuIDs.role(menu.space.id, menu.role.id);
    }
}

export const ContextMenuProvider = observer(
    ({ children }: PropsWithChildren): ReactElement => {
        const [menu, setMenuState] = useState<ContextMenuPayload | null>(null);

        const pendingShowRef = useRef<{
            event: MouseEvent;
            position?: MenuPosition | null;
        } | null>(null);

        const setMenu = (nextMenu: ContextMenuPayload | null) =>
            setMenuState(nextMenu);

        const clearMenu = () => setMenuState(null);

        const openContextMenu = (
            e: AnyMouseEvent,
            nextMenu: ContextMenuPayload,
            position?: MenuPosition | null,
        ) => {
            if ("stopPropagation" in e) e.stopPropagation();
            if ("preventDefault" in e) e.preventDefault();

            const mouseEvent = "nativeEvent" in e ? e.nativeEvent : e;
            mouseEvent.preventDefault?.();
            mouseEvent.stopPropagation?.();

            pendingShowRef.current = { event: mouseEvent, position };
            setMenu(nextMenu);
        };

        useEffect(() => {
            const pending = pendingShowRef.current;
            if (!pending || !menu) return;

            const id = getMenuId(menu);

            const rafHandle = requestAnimationFrame(() => {
                contextMenu.show({
                    event: pending.event,
                    id,
                    position: pending.position,
                });
            });

            pendingShowRef.current = null;
            return () => cancelAnimationFrame(rafHandle);
        }, [menu]);

        useEffect(() => {
            const onVisible = (event: Event) => {
                const customEvent = event as CustomEvent<{
                    id: string;
                    visible: boolean;
                }>;

                if (!customEvent.detail) return;
                if (!menu) return;

                const currentId = getMenuId(menu);
                if (
                    customEvent.detail.id === currentId &&
                    !customEvent.detail.visible
                ) {
                    clearMenu();
                }
            };

            window.addEventListener(
                "mutualzz:contextmenu:visibility",
                onVisible,
            );
            return () =>
                window.removeEventListener(
                    "mutualzz:contextmenu:visibility",
                    onVisible,
                );
        }, [menu]);

        const value = useMemo(
            () => ({
                menu,
                setMenu,
                openContextMenu,
                clearMenu,
            }),
            [menu],
        );

        return (
            <ContextMenuContext.Provider value={value}>
                {children}
                <ContextMenuRoot />
            </ContextMenuContext.Provider>
        );
    },
);

export function useMenu() {
    const ctx = useContext(ContextMenuContext);
    if (!ctx)
        throw new Error("useMenu must be used within a ContextMenuProvider");
    return ctx;
}
