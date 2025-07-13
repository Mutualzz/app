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

export interface UnderlineNode extends Parent {
    type: "underline";
    children: any[];
    data?: {
        hName?: string;
        hProperties?: Record<string, any>;
    };
}

export interface StrikethroughNode extends Parent {
    type: "strikethrough";
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
        underline: UnderlineNode;
        strikethrough: StrikethroughNode;
    }

    interface ContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
        underline: UnderlineNode;
        strikethrough: StrikethroughNode;
    }

    interface PhrasingContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
        underline: UnderlineNode;
        strikethrough: StrikethroughNode;
    }

    interface StaticPhrasingContentMap {
        emoji: EmojiNode;
        spoiler: SpoilerNode;
        underline: UnderlineNode;
        strikethrough: StrikethroughNode;
    }
}

declare module "micromark-util-types" {
    interface TokenTypeMap {
        spoiler: "spoiler";
        spoilerMarker: "spoilerMarker";
        underline: "underline";
        underlineMarker: "underlineMarker";
        strikethrough: "strikethrough";
        strikethroughMarker: "strikethroughMarker";
    }
}
