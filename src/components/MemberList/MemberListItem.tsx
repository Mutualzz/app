import { Paper } from "@components/Paper.tsx";
import { UserAvatar } from "@components/User/UserAvatar.tsx";
import { Typography } from "@mutualzz/ui-web";
import type { SpaceMember } from "@stores/objects/SpaceMember.ts";
import { observer } from "mobx-react";
import { useState } from "react";

interface Props {
    member: SpaceMember;
}

export const MemberListItem = observer(({ member }: Props) => {
    const [hovered, setHovered] = useState(false);

    return (
        <Paper
            maxWidth={224}
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant={hovered ? "soft" : "plain"}
            py={1}
            borderRadius={8}
            direction="row"
            height={42}
            spacing={1}
            alignItems="center"
            px={1}
        >
            <UserAvatar size={32} user={member.user} />
            <Typography
                flex={1}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                fontSize={16}
            >
                {member.displayName}
            </Typography>
        </Paper>
    );
});
