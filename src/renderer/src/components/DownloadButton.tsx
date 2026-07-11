import { Button, type ButtonProps } from "@mutualzz/ui-web";
import { detectDownloadURL } from "@utils/detect";
import { useTranslation } from "react-i18next";

export const DownloadButton = (props: ButtonProps) => {
  const { t } = useTranslation("common");
  const fileUrl = detectDownloadURL();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileUrl) {
      window.open(fileUrl, "_self", "noopener, noreferrer");
    }
  };

  return (
    <Button {...props} onClick={handleClick}>
      {t("download")}
    </Button>
  );
};
