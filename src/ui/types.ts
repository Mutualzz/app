export type Hex = `#${string}`;
export type RGB = `rgb(${number}, ${number}, ${number})`;
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HSL = `hsl(${number}, ${number}%, ${number}%)`;
export type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`;

export type ColorLike = Hex | RGB | RGBA | HSL | HSLA;

export type ThemeColor =
    | "primary"
    | "neutral"
    | "success"
    | "danger"
    | "warning"
    | "info";

export type TypographyColor = "primary" | "neutral" | "accent";

export interface Theme {
    id: string;
    name: string;
    description: string;
    type: "light" | "dark";
    colors: {
        common: {
            white: ColorLike;
            black: ColorLike;
        };

        // Base Colors
        primary: ColorLike;
        neutral: ColorLike;
        background: ColorLike;
        surface: ColorLike;

        // Feedback colors
        danger: ColorLike;
        warning: ColorLike;
        info: ColorLike;
        success: ColorLike;

        // Typography colors
        typography: {
            primary: ColorLike;
            neutral: ColorLike;
            accent: ColorLike;
        };
    };
    typography: {
        fontFamily: string;
        fontSize: number;
        lineHeight: number;
    };
}
