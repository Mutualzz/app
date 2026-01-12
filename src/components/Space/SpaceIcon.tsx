import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APISpacePartial } from "@mutualzz/types";
import { Avatar, type AvatarProps, Typography } from "@mutualzz/ui-web";
import { Space } from "@stores/objects/Space";
import { asAcronym } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState } from "react";

interface Props extends AvatarProps {
    space: Space | APISpacePartial;
    selected?: boolean;
}

export const SpaceIcon = observer(({ space, selected, ...props }: Props) => {
    const app = useAppStore();
    const [hovered, setHovered] = useState(false);

    const iconUrl = space
        ? Space.constructIconUrl(
              space.id,
              space.icon?.startsWith("a_"),
              space.icon,
          )
        : null;

    if (iconUrl)
        return (
            <Avatar
                size={48}
                src={iconUrl}
                variant="plain"
                color="primary"
                elevation={5}
                shape={selected || hovered ? 15 : 10}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                {...props}
            >
                <Typography level="body-sm">{asAcronym(space.name)}</Typography>
            </Avatar>
        );

    return (
        <Paper
            elevation={app.preferEmbossed ? 5 : 1}
            transparency={50}
            borderRadius={selected || hovered ? 15 : 10}
            css={{
                transition: "border-radius 0.2s ease-in-out",
            }}
        >
            <Avatar
                size={48}
                variant="plain"
                color="primary"
                shape={selected || hovered ? 15 : 10}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
                {...props}
            >
                <Typography level="body-sm">{asAcronym(space.name)}</Typography>
            </Avatar>
        </Paper>
    );
});
