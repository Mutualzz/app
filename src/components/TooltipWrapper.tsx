import {
    Paper,
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
    return (
        <Paper
            elevation={5}
            p={2}
            transparency={0}
            borderRadius={8}
            {...paperProps}
        >
            <Typography level="body-xs" {...(typographyProps as any)}>
                {children}
            </Typography>
        </Paper>
    );
};
