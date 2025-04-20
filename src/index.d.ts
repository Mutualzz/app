import type { PaletteRange } from "@mui/joy/styles";

declare module "@mui/joy/styles" {
    interface CssVarsThemeOptions {
        name: string;
        description: string;
        previewColor: string;
    }

    interface Theme {
        name: string;
        description: string;
        previewColor: string;
    }
    interface ColorPalettePropOverrides {
        info: true;
    }

    interface InfoPaletteRange extends PaletteRange {
        950: string;
    }

    interface Palette {
        info: InfoPaletteRange;
    }

    interface PalettePrimaryOverrides {
        950: true;
    }
    interface PaletteNeutralOverrides {
        950: true;
    }
    interface PaletteDangerOverrides {
        950: true;
    }
    interface PaletteSuccessOverrides {
        950: true;
    }
    interface PaletteWarningOverrides {
        950: true;
    }
}
