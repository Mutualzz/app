import { Typography } from "@mutualzz/ui-web";
import type { MessageLike } from "@stores/objects/Message";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import type { ColorLike } from "@mutualzz/ui-core";

interface Props {
    message: MessageLike;
    space: Space;
}

export const MessageAuthor = observer(({ message, space }: Props) => {
    const member = useMemo(
        () => space.members.get(message.authorId) ?? null,
        [message.authorId, space.members],
    );

    const nameColor = useMemo(
        () => (member?.highestRole?.color as ColorLike) ?? "#99958ed",
        [member?.highestRole?.color],
    );

    return (
        <Typography textColor={nameColor}>
            {member ? member.displayName : message.author?.displayName}
        </Typography>
    );
});
