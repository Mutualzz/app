import { useAppStore } from "@hooks/useStores";
import { Paper as MPaper, type PaperProps } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

const PaperComponent = forwardRef<HTMLDivElement, PaperProps>(
    ({ color, ...props }, ref) => {
        const app = useAppStore();

        return (
            <MPaper
                variant={
                    app.settings?.preferEmbossed ? "elevation" : "outlined"
                }
                elevation={props.variant === "soft" ? 0 : props.elevation}
                transparency={
                    app.settings?.preferEmbossed ? 90 : props.transparency
                }
                color={color as string}
                {...props}
                ref={ref}
            />
        );
    },
);

export const Paper = observer(PaperComponent);
