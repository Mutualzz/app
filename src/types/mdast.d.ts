import "micromark-util-types";

declare module "micromark-util-types" {
    interface TokenTypeMap {
        underline: "underline";
        underlineSequence: "underlineSequence";
        underlineText: "underlineText";
    }

    interface Extension {
        underlineMarkers?: {
            null: Code[];
        };
    }
}
