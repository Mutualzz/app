import { useTheme } from "@mutualzz/ui-web";
import { createPortal } from "react-dom";
import { ToastContainer } from "react-toastify";

export function ToastHost() {
  const { theme } = useTheme();

  return createPortal(
    <ToastContainer
      position="top-center"
      style={{ zIndex: theme.zIndex.tooltip }}
    />,
    document.body
  );
}
