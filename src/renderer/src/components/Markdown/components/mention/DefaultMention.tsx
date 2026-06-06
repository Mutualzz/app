import { observer } from "mobx-react-lite";
import { Snowflake } from "@mutualzz/types";
import { RenderElementProps } from "slate-react";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";

interface Props {
  mentionId: Snowflake;
  attributes?: RenderElementProps["attributes"];
}

export const DefaultMention = observer(({ mentionId, attributes }: Props) => {
  const { theme } = useTheme();

  return (
    <Stack
      {...attributes}
      contentEditable={false}
      inline
      px={1.25}
      css={{
        background: `${theme.colors.info}22`,
        borderRadius: 4,
        userSelect: "none",
        overflow: "hidden"
      }}
    >
      <Typography variant="plain" color="info">
        @{mentionId}
      </Typography>
    </Stack>
  );
});
