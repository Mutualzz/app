import type { PaletteRange } from "@mui/joy/styles";

declare module "@mui/joy/styles" {
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
