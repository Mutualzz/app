import { useAppStore } from "@hooks/useStores";
import { Avatar as MAvatar, type AvatarProps } from "@mutualzz/ui/web";
import { observer } from "mobx-react";
import { useState } from "react";

export const Avatar = observer((props: AvatarProps) => {
    const { account } = useAppStore();

    const [focused, setFocused] = useState(false);

    return (
        <MAvatar
            src={
                focused
                    ? account?.constructAvatarUrl(true)
                    : account?.constructAvatarUrl(false)
            }
            onMouseEnter={() => setFocused(true)}
            onMouseLeave={() => setFocused(false)}
            alt={account?.globalName ? account.globalName : account?.username}
            css={{
                cursor: "pointer",
            }}
            {...props}
        />
    );
});
