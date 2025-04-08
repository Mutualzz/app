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
            neutral: ColorInstance;
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
                neutral: ColorInstance;
                accent: ColorInstance;
            };
        };
        typography: {
            fontFamily: string;
            fontSize: number;
            lineHeight: number;
        };
    }
}
