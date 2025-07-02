import type { Literal } from "mdast";

export interface EmojiNode extends Literal {
    type: "emoji";
    id: string;
    shortcode: string;
    url: string;
}

declare module "mdast" {
    interface StaticPhrasingContentMap {
        emoji: EmojiNode;
    }
}
