import type { BaseEditor, BaseRange, Descendant } from "slate";
import { type HistoryEditor } from "slate-history";
import { type ReactEditor } from "slate-react";

export type BlockQuoteElement = {
    type: "blockquote";
    children: Descendant[];
};

export type LineElement = {
    type: "line";
    children: Descendant[];
};

export type HeadingElement = {
    type: "heading";
    level: 1 | 2 | 3;
    children: Descendant[];
};

export type LinkElement = {
    type: "link";
    url: string;
    children: Descendant[];
};

export type EmojiElement = {
    type: "emoji";
    url: string;
    unicode: string;
    name: string;
    children: EmptyText[];
};

export type Text = {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    spoiler?: boolean;
    isMarker?: boolean; // Used to mark ranges for markers like **bold** or *italic*
    text: string;
};

export type EmptyText = {
    text: string;
};

export type FormatKey = keyof Omit<Text, "text" | "isMarker"> | "blockquote";

export type Element =
    | BlockQuoteElement
    | LineElement
    | HeadingElement
    | EmojiElement
    | LinkElement;

export type Editor = BaseEditor &
    ReactEditor &
    HistoryEditor & {
        nodeToDecorations?: Map<Element, Range[]>;
        enableEmoticons?: boolean;
        enableHoverToolbar?: boolean;
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
