import { observer } from "mobx-react-lite";
import { useTheme } from "@mutualzz/ui-web";

export type PillType = "none" | "unread" | "hover" | "active";

interface Props {
    type: PillType;
}

export const SidebarPill = observer(({ type }: Props) => {
    const { theme } = useTheme();

    return (
        <span
            css={{
                width: 4,
                borderRadius: "0 4px 4px 0",
                background: theme.typography.colors.accent,
                position: "absolute",
                left: -12,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "height 0.3s ease, background 0.3s ease",

                ...(type === "none" && {
                    height: 0
                }),
                ...(type === "unread" && {
                    height: 16,
                    background: theme.colors.warning
                }),
                ...(type === "hover" && {
                    height: 20
                }),
                ...(type === "active" && {
                    height: 40
                })
            }}
        />
    );
});
