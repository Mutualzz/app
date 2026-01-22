import { Paper } from "@components/Paper";
import type { CSSObject } from "@emotion/react";
import {
    createColor,
    resolveResponsiveMerge,
    resolveSize,
    type ColorLike,
    type Hex,
    type Size,
} from "@mutualzz/ui-core";
import {
    Avatar as MAvatar,
    useTheme,
    type AvatarProps,
} from "@mutualzz/ui-web";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { FaUser } from "react-icons/fa";

interface UserAvatarProps extends AvatarProps {
    user?: AccountStore | User | null;
}

const baseSizeMap: Record<Size, number> = {
    sm: 28,
    md: 36,
    lg: 48,
};

// NOTE: add a feature later where it detects if the image has transparent background to apply elevation variant
export const UserAvatar = observer(
    ({ user, css, ...props }: UserAvatarProps & { css?: CSSObject }) => {
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

        const { size } = resolveResponsiveMerge(
            theme,
            { size: props?.size || "md" },
            ({ size: s }) => ({ size: resolveSize(theme, s, baseSizeMap) }),
        );

        const hasAvatar = useMemo(() => user && user.avatar != null, [user]);

        if (!user)
            return (
                <MAvatar
                    elevation={5}
                    shape="circle"
                    variant="elevation"
                    size={size}
                    {...props}
                >
                    <FaUser />
                </MAvatar>
            );

        if (hasAvatar)
            return (
                <MAvatar
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
                    {...props}
                />
            );

        return (
            <Paper
                variant={user.defaultAvatar.color ? "solid" : "elevation"}
                elevation={5}
                transparency={0}
                css={{
                    width: size,
                    height: size,
                    ...css,
                }}
                direction="column"
                borderRadius={9999}
                color={(user.defaultAvatar.color as Hex) || "neutral"}
            >
                <MAvatar
                    size={size}
                    src={user.constructAvatarUrl(false, version, size)}
                    {...props}
                />
            </Paper>
        );
    },
);
