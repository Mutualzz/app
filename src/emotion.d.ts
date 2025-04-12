import "@emotion/react";
import type { ColorLike } from "@mutualzz/theme";

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            // Base Colors
            primary: ColorLike;
            neutral: ColorLike;
            background: ColorLike;
            surface: ColorLike;

            // Feedback colors
            error: ColorLike;
            warning: ColorLike;
            info: ColorLike;
            success: ColorLike;

            // Typography colors
            typography: {
                primary: ColorLike;
                neutral: ColorLike;
                accent: ColorLike;
            };
        };
        typography: {
            fontFamily: string;
            fontSize: number;
            lineHeight: number;
        };
    }
}
