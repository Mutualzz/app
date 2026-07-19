import { useAppStore } from "@hooks/useStores";
import { keyframes } from "@emotion/react";
import {
  createColor,
  type ColorLike,
  type Hex
} from "@mutualzz/ui-core";
import { Avatar, useTheme } from "@mutualzz/ui-web";
import type { APIUser } from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { UserIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

type UserLike = AccountStore | User | APIUser;

function isStoreUser(user: UserLike): user is AccountStore | User {
  return (
    "constructAvatarUrl" in user &&
    typeof user.constructAvatarUrl === "function"
  );
}

interface Props {
  user?: UserLike | null;
  size?: number;
  pulsing?: boolean;
  dimmed?: boolean;
}

const RING_COUNT = 3;

function toAvatarSize(size: number): 16 | 32 | 64 | 128 | 256 | 512 | 1024 {
  if (size <= 16) return 16;
  if (size <= 32) return 32;
  if (size <= 64) return 64;
  if (size <= 128) return 128;
  if (size <= 256) return 256;
  if (size <= 512) return 512;
  return 1024;
}

const ringPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.65;
  }
  100% {
    transform: scale(var(--call-ring-scale, 1.75));
    opacity: 0;
  }
`;

export const CallRingingAvatar = observer(
  ({ user, size = 120, pulsing = true, dimmed }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const compact = size <= 90;
    const ringPad = Math.ceil(size * (compact ? 0.35 : 0.5));
    const ringScale = compact ? 1.45 : 1.75;
    const shouldDim = dimmed ?? pulsing;
    const ringColor = theme.colors.success;

    const resolvedUser = user
      ? isStoreUser(user)
        ? user
        : app.users.add(user)
      : null;

    const version =
      resolvedUser?.defaultAvatar?.color != null
        ? createColor(
            resolvedUser.defaultAvatar.color as ColorLike
          ).isLight()
          ? "dark"
          : "light"
        : theme.type === "light"
          ? "dark"
          : "light";

    const hasAvatar = Boolean(resolvedUser?.avatar);
    const src = resolvedUser
      ? resolvedUser.constructAvatarUrl(hasAvatar, version, toAvatarSize(size))
      : undefined;

    return (
      <div
        style={{
          position: "relative",
          width: size + ringPad * 2,
          height: size + ringPad * 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          flexShrink: 0,
          ["--call-ring-scale" as string]: String(ringScale)
        }}
      >
        {pulsing &&
          Array.from({ length: RING_COUNT }, (_, i) => (
            <div
              key={i}
              css={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `3px solid ${ringColor}`,
                pointerEvents: "none",
                boxSizing: "border-box",
                animation: `${ringPulse} 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
                animationDelay: `${i * 0.6}s`
              }}
            />
          ))}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            opacity: shouldDim ? 0.55 : 1,
            filter: shouldDim ? "brightness(0.72) saturate(0.85)" : undefined,
            boxShadow: pulsing ? `0 0 0 3px ${ringColor}` : undefined
          }}
        >
          <Avatar
            src={src}
            size={size}
            shape="circle"
            color={
              !hasAvatar && resolvedUser?.defaultAvatar?.color
                ? (resolvedUser.defaultAvatar.color as Hex)
                : undefined
            }
          >
            {!resolvedUser && <UserIcon />}
          </Avatar>
        </div>
      </div>
    );
  }
);
