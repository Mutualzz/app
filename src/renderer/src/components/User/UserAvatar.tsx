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
  useTheme,
  Stack
} from "@mutualzz/ui-web";
import type { APIUser } from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import {
  getStatusBadgeMask,
  isStatusBadgeVisible,
  StatusBadge
} from "@components/StatusBadge";
import { type SpaceMember } from "@stores/objects/SpaceMember";
import { UserIcon } from "@phosphor-icons/react";
import { useMenu } from "@contexts/ContextMenu.context";

type UserLike = AccountStore | User | APIUser;

function isStoreUser(user: UserLike): user is AccountStore | User {
  return (
    "constructAvatarUrl" in user &&
    typeof user.constructAvatarUrl === "function"
  );
}

interface UserAvatarProps extends AvatarProps {
  user?: UserLike | null;
  member?: SpaceMember;
  badge?: boolean;
  showInvisible?: boolean;
  showOffline?: boolean;
  speaking?: boolean;
  typing?: boolean;
  disableContextMenu?: boolean;
}

const baseSizeMap: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 48
};

export const UserAvatar = observer(
  ({
    user,
    member,
    css,
    badge,
    showInvisible,
    showOffline,
    speaking,
    typing,
    shape,
    style,
    disableContextMenu,
    ...props
  }: UserAvatarProps & { css?: CSSObject }) => {
    const app = useAppStore();
    const { openContextMenu } = useMenu();
    const { theme } = useTheme();
    const [focused, setFocused] = useState(false);

    const resolvedUser = user
      ? isStoreUser(user)
        ? user
        : app.users.add(user)
      : null;

    const { radius } = resolveResponsiveMerge(
      theme,
      {
        shape
      },
      ({ shape: sp = "circle" }) => ({
        radius: resolveShapeValue(sp)
      })
    );

    const version = (() => {
      if (!resolvedUser) return theme.type === "light" ? "dark" : "light";

      return resolvedUser.defaultAvatar.color
        ? createColor(resolvedUser.defaultAvatar.color as ColorLike).isLight()
          ? "dark"
          : "light"
        : theme.type === "light"
          ? "dark"
          : "light";
    })();

    const { size: sizeProp, ...restProps } = props;

    const { size } = resolveResponsiveMerge(
      theme,
      { size: sizeProp || "md" },
      ({ size: s }) => ({ size: resolveSize(theme, s, baseSizeMap) })
    );

    if (!resolvedUser) {
      return (
        <MAvatar
          elevation={5}
          shape={shape}
          variant="elevation"
          size={size}
          {...restProps}
          draggable={false}
        >
          <UserIcon weight="fill" />
        </MAvatar>
      );
    }

    const status = app.presence.get(resolvedUser.id)?.status ?? "offline";
    const hasAvatar = !!resolvedUser.avatar;
    const showBadge =
      !!badge && isStatusBadgeVisible(status, showInvisible, showOffline);

    return (
      <Stack
        position="relative"
        width={size}
        height={size}
        flexShrink={0}
        style={{
          borderRadius: radius,
          outline: speaking ? `2px solid ${theme.colors.success}` : "none",
          ...style
        }}
        onContextMenu={(event) => {
          if (disableContextMenu) return;
          openContextMenu(event, {
            type: "user",
            user: resolvedUser,
            member
          });
        }}
      >
        <Paper
          width={size}
          height={size}
          variant={
            hasAvatar
              ? "plain"
              : resolvedUser.defaultAvatar.color
                ? "solid"
                : "elevation"
          }
          borderRadius={radius}
          elevation={hasAvatar ? 0 : 5}
          style={{
            borderRadius: radius,
            ...(showBadge && {
              maskImage: getStatusBadgeMask(size, !!typing)
            })
          }}
          draggable={false}
        >
          <MAvatar
            size={size}
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
            src={
              focused
                ? resolvedUser.constructAvatarUrl(
                    !!resolvedUser.avatar?.startsWith("a_"),
                    version,
                    size
                  )
                : resolvedUser.constructAvatarUrl(false, version, size)
            }
            shape={shape}
            {...restProps}
          />
        </Paper>
        {showBadge && (
          <StatusBadge
            status={status}
            size={size}
            elevation={0}
            showInvisible={showInvisible}
            showOffline={showOffline}
            typing={typing}
            cutout
          />
        )}
      </Stack>
    );
  }
);
