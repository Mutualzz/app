import type { APISpacePartial } from "@mutualzz/types";
import { Avatar, type AvatarProps, Typography } from "@mutualzz/ui-web";
import { Space } from "@stores/objects/Space.ts";
import { asAcronym } from "@utils/index.ts";
import { observer } from "mobx-react";
import { useState } from "react";

export const SpaceIcon = observer(
    ({ space, ...props }: AvatarProps & { space: Space | APISpacePartial }) => {
        const [hovered, setHovered] = useState(false);

        const iconUrl = space
            ? Space.constructIconUrl(
                  space.id,
                  space.icon?.startsWith("a_"),
                  space.icon,
              )
            : null;

        return (
            <Avatar
                size={48}
                src={iconUrl || undefined}
                variant={iconUrl ? "plain" : "elevation"}
                color="primary"
                elevation={5}
                shape={hovered ? 10 : 15}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                {...props}
            >
                <Typography level="body-sm">{asAcronym(space.name)}</Typography>
            </Avatar>
        );
    },
);
