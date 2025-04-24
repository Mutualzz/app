import "@emotion/react";
import type { ColorLike } from "@types";

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        type: "light" | "dark";
        colors: {
            common: {
                white: ColorLike;
                black: ColorLike;
            };

            // Base Colors
            primary: ColorLike;
            neutral: ColorLike;
            background: ColorLike;
            surface: ColorLike;

            // Feedback colors
            danger: ColorLike;
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
