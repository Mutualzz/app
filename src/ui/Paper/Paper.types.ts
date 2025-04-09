import type { HTMLProps } from "react";
import type { StackProps } from "../Stack/Stack.types";

export type PaperElevation = 0 | 1 | 2 | 3 | 4;

export type PaperProps = HTMLProps<HTMLDivElement> &
    StackProps & {
        elevation?: PaperElevation;
    };
