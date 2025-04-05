type HexString = `#${string}`;

declare module "@emotion/react" {
    export interface Theme {
        id: string;
        name: string;
        description: string;
        colors: {
            primary: HexString;
            secondary: HexString;
            background: HexString;
            surface: HexString;
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
