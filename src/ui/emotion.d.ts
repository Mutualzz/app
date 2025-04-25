import "@emotion/react";
import { Theme as MzTheme } from "@mutualzz/ui/types";

declare module "@emotion/react" {
    export interface Theme extends MzTheme {}
}
