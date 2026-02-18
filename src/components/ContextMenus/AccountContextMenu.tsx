import { observer } from "mobx-react-lite";
import { ContextMenu } from "@components/ContextMenu.tsx";
import type { AccountStore } from "@stores/Account.store.ts";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import { formatPresenceStatus } from "@utils/index.ts";
import { StatusBadge } from "@components/StatusBadge.tsx";
import { Divider, useTheme } from "@mutualzz/ui-web";
import { Item } from "@mutualzz/contexify";
import { FaArrowRight } from "react-icons/fa";

interface Props {
    account: AccountStore;
}

export const AccountContextMenu = observer(({ account }: Props) => {
    const { theme } = useTheme();
    const app = useAppStore();

    const presence = app.presence.get(account.id);

    const elevation = app.settings?.preferEmbossed ? 5 : 1;

    return (
        <ContextMenu
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            transparency={0}
            id={generateMenuIDs.account(account.id)}
            key={account.id}
            width="17.5rem"
        >
            {presence && (
                <ContextSubmenu
                    decorator={
                        <StatusBadge
                            theme={theme}
                            status={presence.status}
                            inPicker
                            size={32}
                            elevation={elevation}
                        />
                    }
                    label={formatPresenceStatus(presence.status)}
                    css={{
                        alignItems: "center",
                    }}
                    elevation={elevation}
                    transparency={0}
                    arrow={<FaArrowRight />}
                >
                    <Item
                        startDecorator={
                            <StatusBadge
                                theme={theme}
                                status="online"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        onClick={() => app.gateway.setStatus("online")}
                        closeOnClick={false}
                    >
                        Online
                    </Item>
                    <Divider />
                    <Item
                        startDecorator={
                            <StatusBadge
                                theme={theme}
                                status="idle"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        onClick={() => app.gateway.setStatus("idle")}
                        closeOnClick={false}
                    >
                        Idle
                    </Item>
                    <Item
                        startDecorator={
                            <StatusBadge
                                theme={theme}
                                status="dnd"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        onClick={() => app.gateway.setStatus("dnd")}
                        closeOnClick={false}
                    >
                        Do Not Disturb
                    </Item>
                    <Item
                        startDecorator={
                            <StatusBadge
                                theme={theme}
                                status="invisible"
                                size={32}
                                inPicker
                                showInvisible
                                elevation={elevation}
                            />
                        }
                        onClick={() => app.gateway.setStatus("invisible")}
                        closeOnClick={false}
                    >
                        Invisible
                    </Item>
                </ContextSubmenu>
            )}
        </ContextMenu>
    );
});
