import "@emotion/react";
import type { Hex } from "@mutualzz/theme";

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            // Base Colors
            primary: Hex;
            neutral: Hex;
            background: Hex;
            surface: Hex;

            // Feedback colors
            danger: Hex;
            warning: Hex;
            info: Hex;
            success: Hex;

            // Typography colors
            typography: {
                primary: Hex;
                neutral: Hex;
                accent: Hex;
            };

            common: {
                white: Hex;
                black: Hex;
            };
        };
        typography: {
            fontFamily: string;
            fontSize: number;
            lineHeight: number;
        };
    }
}
