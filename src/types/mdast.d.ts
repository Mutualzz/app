import "micromark-util-types";
import type { Parent } from "unist";

declare module "micromark-util-types" {
    interface TokenTypeMap {
        underline: "underline";
        underlineSequence: "underlineSequence";
        underlineText: "underlineText";

        emoji: "emoji";
        emojiSequence: "emojiSequence";
        emojiText: "emojiText";
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
        underlineMarkers?:
            | {
                  null: Code[] | undefined;
              }
            | undefined;
    }
}
