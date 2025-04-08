import type { HTMLProps } from "react";

export type PaperElevation = 0 | 1 | 2 | 3 | 4;

export interface PaperProps extends HTMLProps<HTMLDivElement> {
    elevation?: PaperElevation;
}
