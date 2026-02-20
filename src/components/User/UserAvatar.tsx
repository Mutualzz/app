import type { CSSObject } from "@emotion/react";
import { type ColorLike, createColor, resolveResponsiveMerge, resolveSize, type Size, } from "@mutualzz/ui-core";
import { Avatar as MAvatar, type AvatarProps, useTheme, } from "@mutualzz/ui-web";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useAppStore } from "@hooks/useStores.ts";
import { Paper } from "@components/Paper.tsx";
import { StatusBadge } from "@components/StatusBadge.tsx";

interface UserAvatarProps extends AvatarProps {
    user?: AccountStore | User | null;

    badge?: boolean;
}

const baseSizeMap: Record<Size, number> = {
    sm: 28,
    md: 36,
    lg: 48,
};

export const UserAvatar = observer(
    ({ user, css, badge, ...props }: UserAvatarProps & { css?: CSSObject }) => {
        const app = useAppStore();
        const { theme } = useTheme();
        const [focused, setFocused] = useState(false);

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
            ({ size: s }) => ({ size: resolveSize(theme, s, baseSizeMap) }),
        );

        if (!user) {
            return (
                <MAvatar
                    elevation={5}
                    shape="circle"
                    variant="elevation"
                    size={size}
                    {...restProps}
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
                elevation={hasAvatar ? 0 : 5}
                borderRadius={9999}
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
                                  size,
                              )
                            : user.constructAvatarUrl(false, version, size)
                    }
                    {...restProps}
                />
                {status && badge && (
                    <StatusBadge status={status} size={size} elevation={0} />
                )}
            </Paper>
        );
    },
);
