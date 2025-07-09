import type { Literal } from "mdast";

export interface EmojiNode extends Literal {
    type: "emoji";
    name: string;
    url: string;
    unicode: string;
}

declare module "mdast" {
    interface PhrasingContentMap {
        emoji: EmojiNode;
    }
}
