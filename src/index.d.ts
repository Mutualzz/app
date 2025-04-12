declare module "@mutualzz/theme" {
    export type Hex = `#${string}`;
    export type RGB = `rgb(${number}, ${number}, ${number})`;
    export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
    export type HSL = `hsl(${number}, ${number}%, ${number}%)`;
    export type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`;

    export type ColorLike = Hex | RGB | RGBA | HSL | HSLA;

    export type CSSLength =
        | `${number}px`
        | `${number}%`
        | `${number}rem`
        | `${number}em`
        | `${number}vw`
        | `${number}vh`
        | `${number}vmin`
        | `${number}vmax`
        | `${number}fr`
        | `${number}`; // plain numbers as strings like "12" // fallback

    export type ThemeColor =
        | "primary"
        | "neutral"
        | "success"
        | "error"
        | "warning"
        | "info";
}
