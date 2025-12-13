import { useAppStore } from "@hooks/useStores.ts";
import { Paper as MPaper, type PaperProps } from "@mutualzz/ui-web";
import { observer } from "mobx-react";
import { forwardRef } from "react";

const PaperComponent = forwardRef<HTMLDivElement, PaperProps>(
    ({ color, ...props }, ref) => {
        const app = useAppStore();

        return (
            <MPaper
                variant={app.preferEmbossed ? "elevation" : "outlined"}
                elevation={
                    props.variant === "soft"
                        ? 0
                        : app.preferEmbossed
                          ? props.elevation
                          : 0
                }
                color={color as string}
                {...props}
                ref={ref}
            />
        );
    },
);

export const Paper = observer(PaperComponent);
