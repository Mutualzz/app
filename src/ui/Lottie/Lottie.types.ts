import type { HTMLProps } from "react";

export interface LottieProps extends HTMLProps<HTMLDivElement> {
    path: any;
    loop?: boolean;
    autoplay?: boolean;
}
