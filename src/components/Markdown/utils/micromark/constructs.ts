import { codes } from "micromark-util-symbol";
import type { Extension } from "micromark-util-types";
import { resolver as resolveText } from "./initialize/text";

import { attention } from "./marks/attention.js";
import { autolink } from "./marks/autolink.js";
import { blockQuote } from "./marks/blockQuote.js";
import { characterEscape } from "./marks/characterEscape.js";
import { characterReference } from "./marks/characterReference.js";
import { codeFenced } from "./marks/codeFenced.js";
import { codeIndented } from "./marks/codeIndented.js";
import { codeText } from "./marks/codeText.js";
import { definition } from "./marks/definition.js";
import { hardBreakEscape } from "./marks/hardBreakEscape.js";
import { headingAtx } from "./marks/headingAtx.js";
import { htmlFlow } from "./marks/htmlFlow.js";
import { htmlText } from "./marks/htmlText.js";
import { labelEnd } from "./marks/labelEnd.js";
import { labelStartImage } from "./marks/labelStartImage.js";
import { labelStartLink } from "./marks/labelStartLink.js";
import { lineEnding } from "./marks/lineEnding.js";
import { list } from "./marks/list.js";
import { setextUnderline } from "./marks/setextUnderline.js";
import { thematicBreak } from "./marks/thematicBreak.js";
import { underline } from "./marks/underline.js";

export const document: Extension["document"] = {
    [codes.asterisk]: list,
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

export const contentInitial: Extension["contentInitial"] = {
    [codes.leftSquareBracket]: definition,
};

export const flowInitial: Extension["flowInitial"] = {
    [codes.horizontalTab]: codeIndented,
    [codes.virtualSpace]: codeIndented,
    [codes.space]: codeIndented,
};

export const flow: Extension["flow"] = {
    [codes.numberSign]: headingAtx,
    [codes.asterisk]: thematicBreak,
    [codes.dash]: [setextUnderline, thematicBreak],
    [codes.lessThan]: htmlFlow,
    [codes.equalsTo]: setextUnderline,
    [codes.underscore]: thematicBreak,
    [codes.graveAccent]: codeFenced,
    [codes.tilde]: codeFenced,
};

export const string: Extension["string"] = {
    [codes.ampersand]: characterReference,
    [codes.backslash]: characterEscape,
};

export const text: Extension["text"] = {
    [codes.carriageReturn]: lineEnding,
    [codes.lineFeed]: lineEnding,
    [codes.carriageReturnLineFeed]: lineEnding,
    [codes.exclamationMark]: labelStartImage,
    [codes.ampersand]: characterReference,
    [codes.asterisk]: attention,
    [codes.lessThan]: [autolink, htmlText],
    [codes.leftSquareBracket]: labelStartLink,
    [codes.backslash]: [hardBreakEscape, characterEscape],
    [codes.rightSquareBracket]: labelEnd,
    [codes.graveAccent]: codeText,
    [codes.underscore]: [underline, attention],
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

export const disable: Extension["disable"] = { null: [] };
