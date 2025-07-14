import { codes } from "micromark-util-symbol";
import type { Extension } from "micromark-util-types";
import { resolver as resolveText } from "./initialize/text";

import { attention } from "./marks/attention";
import { blockQuote } from "./marks/blockQuote";
import { characterEscape } from "./marks/characterEscape";
import { codeFenced } from "./marks/codeFenced";
import { codeIndented } from "./marks/codeIndented";
import { codeText } from "./marks/codeText";
import { hardBreakEscape } from "./marks/hardBreakEscape";
import { headingAtx } from "./marks/headingAtx";
import { labelEnd } from "./marks/labelEnd";
import { labelStartLink } from "./marks/labelStartLink";
import { lineEnding } from "./marks/lineEnding";
import { list } from "./marks/list";
import { spoiler } from "./marks/spoiler";
import { strikethrough } from "./marks/strikethrough";
import { thematicBreak } from "./marks/thematicBreak";
import { underline } from "./marks/underline";

export const document: Extension["document"] = {
    [codes.plusSign]: list,
    [codes.dash]: list,
    [codes.digit0]: list,
    [codes.digit1]: list,
    [codes.digit2]: list,
    [codes.digit3]: list,
    [codes.digit4]: list,
    [codes.digit5]: list,
    [codes.digit6]: list,
    [codes.digit7]: list,
    [codes.digit8]: list,
    [codes.digit9]: list,
    [codes.greaterThan]: blockQuote,
};

export const contentInitial: Extension["contentInitial"] = {};

export const flowInitial: Extension["flowInitial"] = {
    [codes.horizontalTab]: codeIndented,
    [codes.virtualSpace]: codeIndented,
    [codes.space]: codeIndented,
};

export const flow: Extension["flow"] = {
    [codes.numberSign]: headingAtx,
    [codes.asterisk]: thematicBreak,
    [codes.dash]: thematicBreak,
    [codes.underscore]: thematicBreak,
    [codes.graveAccent]: codeFenced,
    [codes.tilde]: codeFenced,
};

export const string: Extension["string"] = {
    [codes.backslash]: characterEscape,
};

export const text: Extension["text"] = {
    [codes.carriageReturn]: lineEnding,
    [codes.lineFeed]: lineEnding,
    [codes.carriageReturnLineFeed]: lineEnding,
    [codes.asterisk]: attention,
    [codes.leftSquareBracket]: labelStartLink,
    [codes.backslash]: [hardBreakEscape, characterEscape],
    [codes.rightSquareBracket]: labelEnd,
    [codes.graveAccent]: codeText,
    [codes.underscore]: [underline, attention],
    [codes.tilde]: strikethrough,
    [codes.verticalBar]: spoiler,
};

export const insideSpan: Extension["insideSpan"] = {
    null: [attention, underline, resolveText],
};

export const attentionMarkers: Extension["attentionMarkers"] = {
    null: [codes.asterisk],
};

export const underlineMarkers: Extension["underlineMarkers"] = {
    null: [codes.underscore],
};

export const strikethroughMarkers: Extension["strikethroughMarkers"] = {
    null: [codes.tilde],
};

export const spoilerMarkers: Extension["spoilerMarkers"] = {
    null: [codes.verticalBar],
};

export const disable: Extension["disable"] = { null: [] };
