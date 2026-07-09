import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { observer } from "mobx-react-lite";
import { contextMenu } from "@mutualzz/contexify";
import { ContextMenuRoot } from "@components/ContextMenu/ContextMenuRoot";
import type { Space } from "@stores/objects/Space";
import type { Channel } from "@stores/objects/Channel";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import type { User } from "@stores/objects/User";
import type { Role } from "@stores/objects/Role";
import type { AccountStore } from "@stores/Account.store";
import type { Message } from "@stores/objects/Message";
import { SkinTone } from "@utils/emojis/emojiSprite";
import { PickerEmoji } from "@utils/emojis/emojiPickerData";
import { isElectron } from "@utils/index";

export type ContextMenuPayload =
  | {
      type: "space";
      space: Space;
      fromSidebar?: boolean;
      [key: string]: any;
    }
  | { type: "channel-list"; space: Space; [key: string]: any }
  | { type: "channel"; space: Space; channel: Channel; [key: string]: any }
  | { type: "group-dm"; channel: Channel; [key: string]: any }
  | {
      type: "user";
      user: User | AccountStore;
      space?: Space;
      member?: SpaceMember;
      insideDMs?: boolean;
      submenuArrowDirection?: "left" | "right";
      [key: string]: any;
    }
  | { type: "account"; account: AccountStore; [key: string]: any }
  | {
      type: "role";
      space: Space;
      role: Role;
      [key: string]: any;
    }
  | {
      type: "emoji";
      kind: "standard";
      emoji: PickerEmoji;
      skinTone: SkinTone;
      [key: string]: any;
    }
  | {
      type: "emoji";
      kind: "custom";
      id: string;
      name: string;
      url: string;
      animated: boolean;
      [key: string]: any;
    }
  | {
      type: "sticker";
      id: string;
      name: string;
      url: string;
      animated: boolean;
      [key: string]: any;
    }
  | {
      type: "message";
      message: Message;
      [key: string]: any;
    }
  | {
      type: "editable";
      isEditable: boolean;
      selectionText: string;
      canCut: boolean;
      canCopy: boolean;
      canPaste: boolean;
      misspelledWord: string;
      dictionarySuggestions: string[];
      sourceElement: HTMLElement | null;
      [key: string]: any;
    }
  | { type: "custom"; id: string; [key: string]: any };

export type MenuPosition = { x: number; y: number };
type AnyMouseEvent = MouseEvent | { nativeEvent: MouseEvent };

interface ContextMenuContextProps {
  menu: ContextMenuPayload | null;
  setMenu: (menu: ContextMenuPayload | null) => void;

  openContextMenu: (
    e: AnyMouseEvent,
    menu: ContextMenuPayload,
    position?: MenuPosition | null,
    anchorBottom?: MenuPosition | null
  ) => void;
  clearMenu: () => void;
  isOpen: boolean;
}

const ContextMenuContext = createContext<ContextMenuContextProps>({
  menu: null,
  setMenu: () => {},
  openContextMenu: () => {},
  clearMenu: () => {},
  isOpen: false
});

export const generateMenuIDs = {
  space: (spaceId: string, fromSidebar?: boolean) =>
    `context-space-${spaceId}-${fromSidebar ? "sidebar" : "default"}`,
  channelList: (spaceId: string) => `context-channelList-${spaceId}`,
  channel: (spaceId: string, channelId: string) =>
    `context-channel-${spaceId}-${channelId}`,
  member: (spaceId: string, memberId: string) =>
    `context-member-${spaceId}-${memberId}`,
  user: (userId: string, spaceId?: string) => {
    let id = `context-user-${userId}`;
    if (spaceId) id += `-${spaceId}`;

    return id;
  },
  role: (spaceId: string, roleId: string) =>
    `context-role-${spaceId}-${roleId}`,

  account: (userId: string) => `context-account-${userId}`,
  message: (channelId: string, messageId: string) =>
    `context-message-${channelId}-${messageId}`,
  emoji: (unified: string) => `emoji-${unified}`,
  editable: () => "context-editable"
};

function getMenuId(menu: ContextMenuPayload): string {
  switch (menu.type) {
    case "space":
      return generateMenuIDs.space(menu.space.id, menu.fromSidebar);
    case "channel-list":
      return generateMenuIDs.channelList(menu.space.id);
    case "channel":
      return generateMenuIDs.channel(menu.space.id, menu.channel.id);
    case "user":
      return generateMenuIDs.user(menu.user.id, menu.space?.id);
    case "account":
      return generateMenuIDs.account(menu.account.id);
    case "role":
      return generateMenuIDs.role(menu.space.id, menu.role.id);
    case "emoji":
      return menu.kind === "standard"
        ? `emoji-${menu.emoji.unified}`
        : `emoji-custom-${menu.id}`;
    case "sticker":
      return `sticker-${menu.id}`;
    case "group-dm":
      return `group-dm-${menu.channel.id}`;
    case "message":
      return generateMenuIDs.message(menu.message.channelId, menu.message.id);
    case "editable":
      return generateMenuIDs.editable();
    case "custom":
      return menu.id;
  }
}

export const ContextMenuProvider = observer(
  ({ children }: PropsWithChildren): ReactElement => {
    const [menu, setMenuState] = useState<ContextMenuPayload | null>(null);

    const pendingShowRef = useRef<{
      event: MouseEvent;
      position?: MenuPosition | null;
      anchorBottom?: MenuPosition | null;
    } | null>(null);

    const setMenu = (nextMenu: ContextMenuPayload | null) =>
      setMenuState(nextMenu);

    const clearMenu = () => setMenuState(null);

    const isOpen = !!menu;

    const openContextMenu = (
      e: AnyMouseEvent,
      nextMenu: ContextMenuPayload,
      position?: MenuPosition | null,
      anchorBottom?: MenuPosition | null
    ) => {
      if ("stopPropagation" in e) e.stopPropagation();
      if ("preventDefault" in e) e.preventDefault();

      const mouseEvent = "nativeEvent" in e ? e.nativeEvent : e;
      mouseEvent.preventDefault?.();
      mouseEvent.stopPropagation?.();

      pendingShowRef.current = { event: mouseEvent, position, anchorBottom };
      setMenu(nextMenu);
    };

    useEffect(() => {
      const pending = pendingShowRef.current;
      if (!pending || !menu) return () => {};

      const id = getMenuId(menu);

      const rafHandle = requestAnimationFrame(() => {
        contextMenu.show({
          event: pending.event,
          id,
          position: pending.position,
          anchorBottom: pending.anchorBottom
        });
      });

      pendingShowRef.current = null;
      return () => cancelAnimationFrame(rafHandle);
    }, [menu]);

    const lastPointerPosRef = useRef<MenuPosition>({ x: 0, y: 0 });

    useEffect(() => {
      const onContextMenu = (e: MouseEvent) => {
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      };

      window.addEventListener("contextmenu", onContextMenu, {
        capture: true
      });
      return () =>
        window.removeEventListener("contextmenu", onContextMenu, {
          capture: true
        });
    }, []);

    useEffect(() => {
      if (!isElectron) return;

      return window.api.events.onContextMenuEditable((params) => {
        const sourceElement =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        openContextMenu(
          { preventDefault() {}, stopPropagation() {} } as unknown as MouseEvent,
          { type: "editable", ...params, sourceElement },
          lastPointerPosRef.current
        );
      });
    }, []);

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

      window.addEventListener("mutualzz:contextmenu:visibility", onVisible);
      return () =>
        window.removeEventListener(
          "mutualzz:contextmenu:visibility",
          onVisible
        );
    }, [menu]);

    const value = useMemo(
      () => ({
        menu,
        setMenu,
        openContextMenu,
        clearMenu,
        isOpen
      }),
      [menu]
    );

    return (
      <ContextMenuContext.Provider value={value}>
        {children}
        <ContextMenuRoot />
      </ContextMenuContext.Provider>
    );
  }
);

export function useMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx)
    throw new Error("useMenu must be used within a ContextMenuProvider");
  return ctx;
}
