import { observer } from "mobx-react-lite";
import type { PresencePayload } from "@mutualzz/types";
import { FaGamepad, FaHeadphones } from "react-icons/fa";
import { BiSolidNotepad } from "react-icons/bi";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { useMemo } from "react";

interface Props {
    presence?: PresencePayload;
    vertical?: boolean;
}

const PresenceIcon = ({ color, type }: { color: string; type: string }) => {
    switch (type) {
        case "playing":
            return <FaGamepad size={14} color={color} />;
        case "listening":
            return <FaHeadphones size={14} color={color} />;
        default:
            return <BiSolidNotepad size={14} color={color} />;
    }
};

export const SmallActivityStatus = observer(({ presence, vertical }: Props) => {
    const { theme } = useTheme();
    const color = useMemo(() => theme.colors.success, [theme.colors.success]);

    if (!presence) return null;

    const activity = Array.isArray(presence.activities)
        ? (presence.activities[0] ?? null)
        : null;

    if (!activity) return null;

    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            direction={vertical ? "column" : "row"}
            spacing={0.5}
        >
            <Stack
                alignItems="center"
                direction={vertical ? "column" : "row"}
                justifyContent="center"
            >
                <PresenceIcon color={color} type={activity.type} />
                <Typography fontSize={12} textColor={color}>
                    {presence.activities.length > 1
                        ? `+${presence.activities.length - 1}`
                        : ""}
                </Typography>
            </Stack>
            {!vertical && `•`}
            <Typography textColor="accent" fontSize={12}>
                {activity.name}
            </Typography>
        </Stack>
    );
});
