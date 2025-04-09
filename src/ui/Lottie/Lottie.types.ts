import type { HTMLProps } from "react";

export type LottieProps = HTMLProps<HTMLDivElement> & {
    path: any;
    loop?: boolean;
    autoplay?: boolean;
};
