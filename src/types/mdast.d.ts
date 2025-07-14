import type { Data } from "mdast";
import "micromark-util-types";

interface UnderlineData extends Data {}

declare module "micromark-util-types" {
    interface TokenTypeMap {
        underline: "underline";
        underlineSequence: "underlineSequence";
        underlineText: "underlineText";

        blankLine: "blankLine";
        blankLineBreak: "blankLineBreak";

        multipleBlankLines: "multipleBlankLines";
    }

    interface Underline extends Parent {
        type: "underline";
        children: PhrasingContent[];
        data?: UnderlineData;
    }

    interface Extension {
        underlineMarkers?:
            | {
                  null: Code[] | undefined;
              }
            | undefined;
    }
}
