import { useAppStore } from "@hooks/useStores";
import { Tooltip as MzTooltip, type TooltipProps } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const Tooltip = observer((props: TooltipProps) => {
  const app = useAppStore();

  return (
    <MzTooltip elevation={app.settings?.preferEmbossed ? 5 : 2} {...props} />
  );
});
