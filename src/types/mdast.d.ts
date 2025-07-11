import type { Literal, Parent } from "mdast";

export interface EmojiNode extends Literal {
    type: "emoji";
    name: string;
    url: string;
    unicode: string;
}

export interface SpoilerNode extends Parent {
    type: "spoiler";
    children: any[];
    data?: {
        hName?: string;
        hProperties?: Record<string, any>;
    };
}

declare module "mdast" {
    interface RootContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
    }

    interface ContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
    }

    interface PhrasingContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
    }

    interface StaticPhrasingContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
    }
}

declare module "micromark-util-types" {
    interface TokenTypeMap {
        spoiler: "spoiler";
        spoilerMarker: "spoilerMarker";
    }
}
