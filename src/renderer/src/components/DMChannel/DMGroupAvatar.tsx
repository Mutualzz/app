import { observer } from "mobx-react-lite";
import { User } from "@stores/objects/User";
import { UserAvatar } from "@components/User/UserAvatar";
import { Stack } from "@mutualzz/ui-web";

const AVATAR_SIZE = 36;

const avatarLayouts: Record<
  number,
  { left: number; top: number; size: number }[]
> = {
  2: [
    { left: 0, top: 0, size: 0.72 },
    { left: 0.28, top: 0.28, size: 0.72 }
  ],
  3: [
    { left: 0.2, top: 0, size: 0.58 },
    { left: 0, top: 0.42, size: 0.58 },
    { left: 0.42, top: 0.42, size: 0.58 }
  ],
  4: [
    { left: 0.03, top: 0.03, size: 0.46 },
    { left: 0.51, top: 0.03, size: 0.46 },
    { left: 0.03, top: 0.51, size: 0.46 },
    { left: 0.51, top: 0.51, size: 0.46 }
  ]
};

interface Props {
  users: User[];
  size?: number;
}

export const DMGroupAvatar = observer(
  ({ users, size = AVATAR_SIZE }: Props) => {
    const visible = users.slice(0, 4);

    if (visible.length <= 1)
      return <UserAvatar user={visible[0] ?? null} size={size} />;

    const layout = avatarLayouts[visible.length];

    return (
      <Stack
        width={size}
        height={size}
        minWidth={size}
        position="relative"
        css={{ flexShrink: 0, overflow: "hidden" }}
      >
        {visible.map((user, index) => {
          const item = layout[index];

          return (
            <UserAvatar
              key={user.id}
              user={user}
              size={Math.round(item.size * size)}
              style={{
                position: "absolute",
                left: Math.round(item.left * size),
                top: Math.round(item.top * size),
                zIndex: index + 1,
                borderRadius: "50%"
              }}
            />
          );
        })}
      </Stack>
    );
  }
);
