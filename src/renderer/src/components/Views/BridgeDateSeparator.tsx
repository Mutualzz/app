import { formatColor } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface Props {
  date: Date;
}

/**
 * Date separator that cannot flex-grow (the shared Divider stretches inside
 * column flex feeds and leaves huge empty gaps).
 */
export const BridgeDateSeparator = ({ date }: Props) => {
  const { t } = useTranslation("chat");
  const { theme } = useTheme();

  const label = (() => {
    const d = dayjs(date);
    if (!d.isValid()) return null;
    if (d.isSame(dayjs(), "day")) return t("dateSeparator.today");
    if (d.isSame(dayjs().subtract(1, "day"), "day"))
      return t("dateSeparator.yesterday");
    return d.format("MMMM D, YYYY");
  })();

  if (!label) return null;

  const line = formatColor(theme.typography.colors.muted, {
    alpha: 35,
    format: "hexa",
  });

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      px={2}
      my={1}
      width="100%"
      maxWidth="100%"
      minWidth={0}
      aria-label={label}
      css={{
        flex: "0 0 auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        css={{
          flex: "1 1 0%",
          minWidth: 0,
          height: 1,
          backgroundColor: line,
        }}
      />
      <Typography
        level="body-sm"
        textColor="accent"
        css={{ flexShrink: 0, opacity: 0.85, whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
      <div
        css={{
          flex: "1 1 0%",
          minWidth: 0,
          height: 1,
          backgroundColor: line,
        }}
      />
    </Stack>
  );
};
