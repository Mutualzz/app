import type { CSSObject } from "@emotion/react";
import {
    type ColorLike,
    createColor,
    resolveResponsiveMerge,
    resolveShapeValue,
    resolveSize,
    type Size
} from "@mutualzz/ui-core";
import {
    Avatar as MAvatar,
    type AvatarProps,
    useTheme
} from "@mutualzz/ui-web";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { StatusBadge } from "@components/StatusBadge";
import { SpaceMember } from "@stores/objects/SpaceMember";

interface UserAvatarProps extends AvatarProps {
    user?: AccountStore | User | SpaceMember | null;
    badge?: boolean;
    showInvisible?: boolean;
    speaking?: boolean;
}

const baseSizeMap: Record<Size, number> = {
    sm: 28,
    md: 36,
    lg: 48
};

export const UserAvatar = observer(
    ({
        user: userProp,
        css,
        badge,
        showInvisible,
        speaking,
        shape,
        style,
        ...props
    }: UserAvatarProps & { css?: CSSObject }) => {
        const app = useAppStore();
        const { theme } = useTheme();
        const [focused, setFocused] = useState(false);

        const user = userProp instanceof SpaceMember ? userProp.user : userProp;

        const { radius } = resolveResponsiveMerge(
            theme,
            {
                shape
            },
            ({ shape: sp = "circle" }) => ({
                radius: resolveShapeValue(sp)
            })
        );

        const version = useMemo(() => {
            if (!user) return theme.type === "light" ? "dark" : "light";

            return user.defaultAvatar.color
                ? createColor(user.defaultAvatar.color as ColorLike).isLight()
                    ? "dark"
                    : "light"
                : theme.type === "light"
                  ? "dark"
                  : "light";
        }, [theme.type, user]);

        const { size: sizeProp, ...restProps } = props;

        const { size } = resolveResponsiveMerge(
            theme,
            { size: sizeProp || "md" },
            ({ size: s }) => ({ size: resolveSize(theme, s, baseSizeMap) })
        );

        if (!user) {
            return (
                <MAvatar
                    elevation={5}
                    shape={shape}
                    variant="elevation"
                    size={size}
                    {...restProps}
                    draggable={false}
                >
                    <FaUser />
                </MAvatar>
            );
        }

        const status = app.presence.get(user.id)?.status;
        const hasAvatar = !!user.avatar;

        return (
            <Paper
                position="relative"
                width={size}
                height={size}
                variant={
                    hasAvatar
                        ? "plain"
                        : user.defaultAvatar.color
                          ? "solid"
                          : "elevation"
                }
                borderRadius={radius}
                elevation={hasAvatar ? 0 : 5}
                style={{
                    borderRadius: radius,
                    outline: speaking
                        ? `2px solid ${theme.colors.success}`
                        : "none",
                    ...style
                }}
                draggable={false}
            >
                <MAvatar
                    size={size}
                    onMouseEnter={() => setFocused(true)}
                    onMouseLeave={() => setFocused(false)}
                    src={
                        focused
                            ? user.constructAvatarUrl(
                                  !!user.avatar?.startsWith("a_"),
                                  version,
                                  size
                              )
                            : user.constructAvatarUrl(false, version, size)
                    }
                    shape={shape}
                    {...restProps}
                />
                {status && badge && (
                    <StatusBadge
                        status={status}
                        size={size}
                        elevation={0}
                        showInvisible={showInvisible}
                    />
                )}
            </Paper>
        );
    }
);
