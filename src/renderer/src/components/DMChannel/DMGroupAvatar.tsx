import { observer } from "mobx-react-lite";
import { User } from "@stores/objects/User";
import { UserAvatar } from "@components/User/UserAvatar";
import { Stack } from "@mutualzz/ui-web";

const AVATAR_SIZE = 32;

const avatarOffsets = [
    { left: 2, top: 2 },
    { left: 14, top: 2 },
    { left: 2, top: 14 },
    { left: 14, top: 14 }
];

interface Props {
    users: User[];
}

export const DMGroupAvatar = observer(({ users }: Props) => {
    const visible = users.slice(0, 4);

    if (visible.length <= 1) {
        return <UserAvatar user={visible[0] ?? null} size={AVATAR_SIZE} />;
    }

    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            position="relative"
        >
            {visible.map((user, index) => (
                <UserAvatar
                    key={user.id}
                    user={user}
                    size={18}
                    css={{
                        position: "absolute",
                        left: avatarOffsets[index]?.left ?? 2,
                        top: avatarOffsets[index]?.top ?? 2,
                        zIndex: index + 1,
                        borderRadius: 9999
                    }}
                />
            ))}
        </Stack>
    );
});
