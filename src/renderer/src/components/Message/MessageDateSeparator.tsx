import { Divider } from "@mutualzz/ui-web";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface Props {
  date: Date;
}

export const MessageDateSeparator = ({ date }: Props) => {
  const { t } = useTranslation("chat");

  const label = (() => {
    const d = dayjs(date);
    if (d.isSame(dayjs(), "day")) return t("dateSeparator.today");
    if (d.isSame(dayjs().subtract(1, "day"), "day"))
      return t("dateSeparator.yesterday");
    return d.format("MMMM D, YYYY");
  })();

  return (
    <Divider
      textLevel="body-sm"
      textPadding={4}
      lineColor="muted"
      textColor="accent"
      aria-label={label}
      css={{
        margin: "8px 0",
        padding: "0 16px",
        opacity: 0.75,
        flex: "0 0 auto",
        flexShrink: 0,
        maxWidth: "100%",
        width: "100%",
        height: "auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {label}
    </Divider>
  );
};
