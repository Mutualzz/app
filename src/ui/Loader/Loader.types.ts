export type LoaderColor =
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";

export type LoaderVariant = "contained" | "text";

export type LoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface LoaderProps {
    color?: LoaderColor;
    size?: LoaderSize;
    variant?: LoaderVariant;
}
