import "micromark-util-types";
import type { Parent } from "unist";

declare module "micromark-util-types" {
    interface TokenTypeMap {
        underline: "underline";
        underlineSequence: "underlineSequence";
        underlineText: "underlineText";

        strikethrough: "strikethrough";
        strikethroughSequence: "strikethroughSequence";
        strikethroughText: "strikethroughText";

        spoiler: "spoiler";
        spoilerSequence: "spoilerSequence";
        spoilerText: "spoilerText";
    }

    interface SpoilerData extends Data {}

    interface Spoiler extends Parent {
        type: "spoiler";
        children: PhrasingContent[];
        data?: SpoilerData;
    }

    interface StrikethroughData extends Data {}
    interface Strikethrough extends Parent {
        type: "strikethrough";
        children: PhrasingContent[];
        data?: StrikethroughData;
    }

    interface UnderlineData extends Data {}

    interface Underline extends Parent {
        type: "underline";
        children: PhrasingContent[];
        data?: UnderlineData;
    }

    interface EmojiData extends Data {}

    interface Emoji extends Parent {
        type: "emoji";
        name: string;
        url: string;
        unicode: string;
        data?: EmojiData;
    }

    interface Extension {
        underlineMarkers?: {
            null: Code[] | undefined;
        };
        strikethroughMarkers?: {
            null: Code[] | undefined;
        };
        spoilerMarkers?: {
            null: Code[] | undefined;
        };
    }
}
