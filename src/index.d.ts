declare module "@mutualzz/theme" {
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
        | "error"
        | "warning"
        | "info";
}
