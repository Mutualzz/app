import { Stack, Typography } from "@mutualzz/ui-web";
import {
  themeColorVar,
  themeOnColorVar,
  typographyColorVar
} from "@mutualzz/ui-core";

interface Props {
  mentionCount: number;
  unread: boolean;
}

export const UnreadIndicator = ({ mentionCount, unread }: Props) => {
  if (mentionCount > 0)
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        css={{
          minWidth: 16,
          height: 16,
          borderRadius: 9999,
          padding: "0 4px",
          flexShrink: 0,
          backgroundColor: themeColorVar("danger")
        }}
      >
        <Typography
          level="label-xs"
          css={{ color: themeOnColorVar("danger"), fontSize: 10 }}
        >
          {mentionCount > 99 ? "99+" : mentionCount}
        </Typography>
      </Stack>
    );

  if (!unread) return null;

  return (
    <Stack
      css={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        flexShrink: 0,
        backgroundColor: typographyColorVar("primary")
      }}
    />
  );
};
