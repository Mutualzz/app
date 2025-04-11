import "@emotion/react";
import type { HexString } from "color";

type HexString<Hex extends string = string> = `#${Hex}`;

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            // Base Colors
            primary: HexString;
            neutral: HexString;
            background: HexString;
            surface: HexString;

            // Feedback colors
            error: HexString;
            warning: HexString;
            info: HexString;
            success: HexString;

            // Typography colors
            typography: {
                primary: HexString;
                neutral: HexString;
                accent: HexString;
            };
        };
        typography: {
            fontFamily: string;
            fontSize: number;
            lineHeight: number;
        };
    }
}
