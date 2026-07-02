import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Snowflake } from "@mutualzz/types";
import { RenderElementProps } from "slate-react";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";

interface Props {
  mentionId: Snowflake;
  attributes?: RenderElementProps["attributes"];
  children?: ReactNode;
}

export const DefaultMention = observer(
  ({ mentionId, attributes, children }: Props) => {
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
          overflow: "hidden",
          verticalAlign: 0
        }}
        alignItems="center"
      >
        {children}
        <Typography lineHeight={1} variant="plain" color="info">
          @{mentionId}
        </Typography>
      </Stack>
    );
  }
);
