import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { APISpacePartial } from "@mutualzz/types";
import { Avatar, Typography, type AvatarProps } from "@mutualzz/ui-web";
import { QuestionMarkIcon } from "@phosphor-icons/react";
import { Space } from "@stores/objects/Space";
import { asAcronym } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useState } from "react";

interface Props extends AvatarProps {
  space?: Space | APISpacePartial | null;
  selected?: boolean;
  size?: number;
}

export const SpaceIcon = observer(
  ({ space, selected, size = 48, ...props }: Props) => {
    const app = useAppStore();
    const [hovered, setHovered] = useState(false);

    if (space) {
      const iconUrl = Space.constructIconUrl(
        space.id,
        space.icon?.startsWith("a_"),
        space.icon
      );
      return (
        <Avatar
          size={size}
          src={iconUrl ?? undefined}
          variant={iconUrl ? "plain" : "outlined"}
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
    }

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        transparency={50}
        css={{
          transition: "border-radius 0.2s ease-in-out",
          borderRadius: selected || hovered ? 15 : 10
        }}
      >
        <Avatar
          size={size}
          variant="plain"
          color="neutral"
          shape={selected || hovered ? 15 : 10}
          onMouseOver={() => setHovered(true)}
          onMouseOut={() => setHovered(false)}
          {...props}
        >
          <QuestionMarkIcon />
        </Avatar>
      </Paper>
    );
  }
);
