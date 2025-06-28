import type { BaseEditor, BaseRange, Descendant } from "slate";
import type { HistoryEditor } from "slate-history";
import type { ReactEditor } from "slate-react";

export type BlockQuoteElement = {
    type: "blockquote";
    children: Descendant[];
};

export type ParagraphElement = {
    type: "paragraph";
    children: Descendant[];
};

export type SubscriptElement = {
    type: "subscript";
    children: Descendant[];
};

export type SupbscriptElement = {
    type: "supscript";
    children: Descendant[];
};

export type HeadingElement = {
    type: "heading";
    level: 1 | 2 | 3;
    children: Descendant[];
};

export type EmojiElement = {
    type: "emoji";
    id: string;
    name: string;
    url: string;
    unicode?: string;
    shortcode?: string;
    children: EmptyText[];
};

export type Text = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    isMarker?: boolean; // Used to mark ranges for markers like **bold** or *italic*
    text: string;
};

export type EmptyText = {
    text: string;
};

export type Element =
    | BlockQuoteElement
    | ParagraphElement
    | HeadingElement
    | EmojiElement
    | SubscriptElement
    | SupbscriptElement;

export type Editor = BaseEditor &
    ReactEditor &
    HistoryEditor & {
        nodeToDecorations?: Map<Element, Range[]>;
    };

declare module "slate" {
    interface CustomTypes {
        Editor: Editor;
        Element: Element;
        Text: Text;
        Range: BaseRange & {
            [key: string]: any;
        };
    }
}
