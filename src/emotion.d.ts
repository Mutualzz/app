import "@emotion/react";
import type { ColorInstance } from "color";

type HexString = `#${string}`;

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            // Base Colors
            primary: ColorInstance;
            secondary: ColorInstance;
            background: ColorInstance;
            surface: ColorInstance;

            // Feedback colors
            error: ColorInstance;
            warning: ColorInstance;
            info: ColorInstance;
            success: ColorInstance;

            // Typography colors
            typography: {
                primary: ColorInstance;
                secondary: ColorInstance;
                accent: ColorInstance;
            };
        };
        typography: {
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            fontWeightBold: number;
            fontWeightMedium: number;
            h1: {
                fontSize: number;
                fontWeight: number;
            };
            h2: {
                fontSize: number;
                fontWeight: number;
            };
            h3: {
                fontSize: number;
                fontWeight: number;
            };
            lineHeight: number;
        };
    }
}
