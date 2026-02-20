import { observer } from "mobx-react-lite";
import { ContextMenu } from "@components/ContextMenu.tsx";
import type { AccountStore } from "@stores/Account.store.ts";
import { generateMenuIDs } from "@contexts/ContextMenu.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { ContextSubmenu } from "@components/ContextSubmenu.tsx";
import { formatPresenceStatus } from "@utils/index.ts";
import { StatusBadge } from "@components/StatusBadge.tsx";
import { Divider } from "@mutualzz/ui-web";
import { Item } from "@mutualzz/contexify";
import { FaArrowRight } from "react-icons/fa";
import type { AppStore } from "@stores/App.store.ts";
import type { PresenceStatus } from "@mutualzz/types";

interface Props {
    account: AccountStore;
}

const times: { label: string; durationMs: number | null }[] = [
    { label: "15 minutes", durationMs: 15 * 60_000 },
    { label: "1 hour", durationMs: 60 * 60_000 },
    { label: "4 hours", durationMs: 4 * 60 * 60_000 },
    { label: "1 day", durationMs: 24 * 60 * 60_000 },
    { label: "3 days", durationMs: 3 * 24 * 60 * 60_000 },
    { label: "Forever", durationMs: null },
];

const SubmenuLabel = (props: { text: string; onForeverClick: () => void }) => {
    const { text, onForeverClick } = props;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: 8,
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onForeverClick();
            }}
        >
            {text}
        </div>
    );
};

const TimeContextMenu = observer(
    ({ app, status }: { app: AppStore; status: PresenceStatus }) => {
        return times.map(({ label, durationMs }) => (
            <Item
                horizontalAlign="left"
                key={`${status}:${label}`}
                onClick={() => {
                    if (!durationMs) {
                        app.gateway.setStatus(status);
                        app.gateway.clearScheduledStatus();

                        return;
                    }

                    app.gateway.scheduleStatus({
                        status,
                        durationMs,
                    });
                }}
            >
                {label}
            </Item>
        ));
    },
);

export const AccountContextMenu = observer(({ account }: Props) => {
    const app = useAppStore();

    const presence = app.presence.get(account.id);

    const elevation = app.settings?.preferEmbossed ? 5 : 1;

    const setForever = (status: PresenceStatus) => {
        app.gateway.setStatus(status);
        app.gateway.clearScheduledStatus();
    };

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
                    <ContextSubmenu
                        decorator={
                            <StatusBadge
                                status="online"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        css={{
                            width: "100%",
                        }}
                        label={
                            <SubmenuLabel
                                text="Online"
                                onForeverClick={() => setForever("online")}
                            />
                        }
                        transparency={0}
                        elevation={elevation}
                    >
                        <TimeContextMenu app={app} status="online" />
                    </ContextSubmenu>
                    <Divider
                        lineColor="muted"
                        css={{
                            opacity: 0.5,
                        }}
                    />
                    <ContextSubmenu
                        decorator={
                            <StatusBadge
                                status="idle"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        css={{
                            width: "100%",
                        }}
                        label={
                            <SubmenuLabel
                                text="Idle"
                                onForeverClick={() => setForever("idle")}
                            />
                        }
                        transparency={0}
                        elevation={elevation}
                    >
                        <TimeContextMenu app={app} status="idle" />
                    </ContextSubmenu>
                    <ContextSubmenu
                        decorator={
                            <StatusBadge
                                status="dnd"
                                size={32}
                                inPicker
                                elevation={elevation}
                            />
                        }
                        css={{
                            width: "100%",
                        }}
                        label={
                            <SubmenuLabel
                                text="Do Not Disturb"
                                onForeverClick={() => setForever("dnd")}
                            />
                        }
                        transparency={0}
                        elevation={elevation}
                    >
                        <TimeContextMenu app={app} status="dnd" />
                    </ContextSubmenu>
                    <ContextSubmenu
                        decorator={
                            <StatusBadge
                                status="invisible"
                                size={32}
                                inPicker
                                showInvisible
                                elevation={elevation}
                            />
                        }
                        css={{
                            width: "100%",
                        }}
                        label={
                            <SubmenuLabel
                                text="Invisible"
                                onForeverClick={() => setForever("invisible")}
                            />
                        }
                        transparency={0}
                        elevation={elevation}
                    >
                        <TimeContextMenu app={app} status="invisible" />
                    </ContextSubmenu>
                </ContextSubmenu>
            )}
        </ContextMenu>
    );
});
