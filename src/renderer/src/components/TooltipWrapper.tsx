import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
  type PaperProps,
  Typography,
  type TypographyProps
} from "@mutualzz/ui-web";
import type { PropsWithChildren } from "react";
import { observer } from "mobx-react-lite";

interface Props extends PropsWithChildren {
  paperProps?: Omit<PaperProps, "color">;
  typographyProps?: TypographyProps;
}

export const TooltipWrapper = observer(
  ({ paperProps, typographyProps, children }: Props) => {
    const app = useAppStore();

    return (
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 2}
        p={2}
        transparency={100}
        borderRadius={8}
        {...paperProps}
      >
        <Typography level="body-xs" {...(typographyProps as any)}>
          {children}
        </Typography>
      </Paper>
    );
  }
);
