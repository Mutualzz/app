import { Avatar as MAvatar, type AvatarProps } from "@mutualzz/ui-web";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import { observer } from "mobx-react";
import { useState } from "react";

interface UserAvatarProps extends AvatarProps {
    user: AccountStore | User;
}

export const UserAvatar = observer(({ user, ...props }: UserAvatarProps) => {
    const [focused, setFocused] = useState(false);

    return (
        <MAvatar
            src={
                focused
                    ? user.constructAvatarUrl(true)
                    : user.constructAvatarUrl(false)
            }
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
            alt={user.globalName ? user.globalName : user.username}
            css={{
                cursor: "pointer",
            }}
            {...props}
        />
    );
});
