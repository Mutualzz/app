import "@emotion/react";

type HexString = `#${string}`;

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            // Base Colors
            primary: HexString;
            secondary: HexString;
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
                secondary: HexString;
                accent: HexString;
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
