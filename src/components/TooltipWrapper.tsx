import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
    Typography,
    type PaperProps,
    type TypographyProps,
} from "@mutualzz/ui-web";
import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
    paperProps?: Omit<PaperProps, "color">;
    typographyProps?: TypographyProps;
}

export const TooltipWrapper = ({
    paperProps,
    typographyProps,
    children,
}: Props) => {
    const app = useAppStore();

    return (
        <Paper
            elevation={app.preferEmbossed ? 5 : 2}
            p={2}
            transparency={75}
            borderRadius={8}
            {...paperProps}
        >
            <Typography level="body-xs" {...(typographyProps as any)}>
                {children}
            </Typography>
        </Paper>
    );
};
