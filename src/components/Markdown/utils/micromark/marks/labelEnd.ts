import { ok as assert } from "devlop";
import { factoryDestination } from "micromark-factory-destination";
import { factoryLabel } from "micromark-factory-label";
import { factoryTitle } from "micromark-factory-title";
import { factoryWhitespace } from "micromark-factory-whitespace";
import { markdownLineEndingOrSpace } from "micromark-util-character";
import { push, splice } from "micromark-util-chunked";
import { normalizeIdentifier } from "micromark-util-normalize-identifier";
import { resolveAll } from "micromark-util-resolve-all";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    Event,
    State,
    Token,
    TokenizeContext,
} from "micromark-util-types";

export const labelEnd: Construct = {
    name: "labelEnd",
    resolveAll: resolveAllLabelEnd,
    resolveTo: resolveToLabelEnd,
    tokenize: tokenizeLabelEnd,
};

const resourceConstruct: Construct = { tokenize: tokenizeResource };

const referenceFullConstruct: Construct = { tokenize: tokenizeReferenceFull };

const referenceCollapsedConstruct: Construct = {
    tokenize: tokenizeReferenceCollapsed,
};

function resolveAllLabelEnd(events: Event[]) {
    let index = -1;

    const newEvents: Event[] = [];
    while (++index < events.length) {
        const token = events[index][1];
        newEvents.push(events[index]);

        if (
            token.type === types.labelImage ||
            token.type === types.labelLink ||
            token.type === types.labelEnd
        ) {
            // Remove the marker.
            const offset = token.type === types.labelImage ? 4 : 2;
            token.type = types.data;
            index += offset;
        }
    }

    // If the events are equal, we don't have to copy newEvents to events
    if (events.length !== newEvents.length) {
        splice(events, 0, events.length, newEvents);
    }

    return events;
}

function resolveToLabelEnd(events: Event[], context: TokenizeContext) {
    let index = events.length;
    let offset = 0;

    let token: Token;
    let open: number | undefined;
    let close: number | undefined;
    let media: Event[];

    // Find an opening.
    while (index--) {
        token = events[index][1];

        if (open) {
            // If we see another link, or inactive link label, we’ve been here before.
            if (
                token.type === types.link ||
                (token.type === types.labelLink && token._inactive)
            ) {
                break;
            }

            // Mark other link openings as inactive, as we can’t have links in
            // links.
            if (
                events[index][0] === "enter" &&
                token.type === types.labelLink
            ) {
                token._inactive = true;
            }
        } else if (close) {
            if (
                events[index][0] === "enter" &&
                (token.type === types.labelImage ||
                    token.type === types.labelLink) &&
                !token._balanced
            ) {
                open = index;

                if (token.type !== types.labelLink) {
                    offset = 2;
                    break;
                }
            }
        } else if (token.type === types.labelEnd) {
            close = index;
        }
    }

    assert(open !== undefined, "`open` is supposed to be found");
    assert(close !== undefined, "`close` is supposed to be found");

    const group = {
        type:
            events[open][1].type === types.labelLink ? types.link : types.image,
        start: { ...events[open][1].start },
        end: { ...events[events.length - 1][1].end },
    };

    const label = {
        type: types.label,
        start: { ...events[open][1].start },
        end: { ...events[close][1].end },
    };

    const text = {
        type: types.labelText,
        start: { ...events[open + offset + 2][1].end },
        end: { ...events[close - 2][1].start },
    };

    media = [
        ["enter", group, context],
        ["enter", label, context],
    ];

    // Opening marker.
    media = push(media, events.slice(open + 1, open + offset + 3));

    // Text open.
    media = push(media, [["enter", text, context]]);

    // Always populated by defaults.
    assert(
        context.parser.constructs.insideSpan.null,
        "expected `insideSpan.null` to be populated",
    );
    // Between.
    media = push(
        media,
        resolveAll(
            context.parser.constructs.insideSpan.null,
            events.slice(open + offset + 4, close - 3),
            context,
        ),
    );

    // Text close, marker close, label close.
    media = push(media, [
        ["exit", text, context],
        events[close - 2],
        events[close - 1],
        ["exit", label, context],
    ]);

    // Reference, resource, or so.
    media = push(media, events.slice(close + 1));

    // Media close.
    media = push(media, [["exit", group, context]]);

    splice(events, open, events.length, media);

    return events;
}

function tokenizeLabelEnd(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    let index = self.events.length;
    let labelStart: Token;
    let defined: boolean;

    // Find an opening.
    while (index--) {
        if (
            (self.events[index][1].type === types.labelImage ||
                self.events[index][1].type === types.labelLink) &&
            !self.events[index][1]._balanced
        ) {
            labelStart = self.events[index][1];
            break;
        }
    }

    return start;

    /**
     * Start of label end.
     *
     * ```markdown
     * > | [a](b) c
     *       ^
     * > | [a][b] c
     *       ^
     * > | [a][] b
     *       ^
     * > | [a] b
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.rightSquareBracket, "expected `]`");

        // If there is not an okay opening.
        if (!labelStart) {
            return nok(code);
        }

        // If the corresponding label (link) start is marked as inactive,
        // it means we’d be wrapping a link, like this:
        //
        // ```markdown
        // > | a [b [c](d) e](f) g.
        //                  ^
        // ```
        //
        // We can’t have that, so it’s just balanced brackets.
        if (labelStart._inactive) {
            return labelEndNok(code);
        }

        defined = self.parser.defined.includes(
            normalizeIdentifier(
                self.sliceSerialize({ start: labelStart.end, end: self.now() }),
            ),
        );
        effects.enter(types.labelEnd);
        effects.enter(types.labelMarker);
        effects.consume(code);
        effects.exit(types.labelMarker);
        effects.exit(types.labelEnd);
        return after;
    }

    /**
     * After `]`.
     *
     * ```markdown
     * > | [a](b) c
     *       ^
     * > | [a][b] c
     *       ^
     * > | [a][] b
     *       ^
     * > | [a] b
     *       ^
     * ```
     *
     */
    function after(code: Code) {
        // Note: `markdown-rs` also parses GFM footnotes here, which for us is in
        // an extension.

        // Resource (`[asd](fgh)`)?
        if (code === codes.leftParenthesis) {
            return effects.attempt(
                resourceConstruct,
                labelEndOk,
                defined ? labelEndOk : labelEndNok,
            )(code);
        }

        // Full (`[asd][fgh]`) or collapsed (`[asd][]`) reference?
        if (code === codes.leftSquareBracket) {
            return effects.attempt(
                referenceFullConstruct,
                labelEndOk,
                defined ? referenceNotFull : labelEndNok,
            )(code);
        }

        // Shortcut (`[asd]`) reference?
        return defined ? labelEndOk(code) : labelEndNok(code);
    }

    /**
     * After `]`, at `[`, but not at a full reference.
     *
     * > 👉 **Note**: we only get here if the label is defined.
     *
     * ```markdown
     * > | [a][] b
     *        ^
     * > | [a] b
     *        ^
     * ```
     *
     */
    function referenceNotFull(code: Code) {
        return effects.attempt(
            referenceCollapsedConstruct,
            labelEndOk,
            labelEndNok,
        )(code);
    }

    /**
     * Done, we found something.
     *
     * ```markdown
     * > | [a](b) c
     *           ^
     * > | [a][b] c
     *           ^
     * > | [a][] b
     *          ^
     * > | [a] b
     *        ^
     * ```
     *
     */
    function labelEndOk(code: Code) {
        // Note: `markdown-rs` does a bunch of stuff here.
        return ok(code);
    }

    /**
     * Done, it’s nothing.
     *
     * There was an okay opening, but we didn’t match anything.
     *
     * ```markdown
     * > | [a](b c
     *        ^
     * > | [a][b c
     *        ^
     * > | [a] b
     *        ^
     * ```
     *
     */
    function labelEndNok(code: Code) {
        labelStart._balanced = true;
        return nok(code);
    }
}

function tokenizeResource(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return resourceStart;

    /**
     * At a resource.
     *
     * ```markdown
     * > | [a](b) c
     *        ^
     * ```
     *
     */
    function resourceStart(code: Code) {
        assert(code === codes.leftParenthesis, "expected left paren");
        effects.enter(types.resource);
        effects.enter(types.resourceMarker);
        effects.consume(code);
        effects.exit(types.resourceMarker);
        return resourceBefore;
    }

    /**
     * In resource, after `(`, at optional whitespace.
     *
     * ```markdown
     * > | [a](b) c
     *         ^
     * ```
     *
     */
    function resourceBefore(code: Code) {
        return markdownLineEndingOrSpace(code)
            ? factoryWhitespace(effects, resourceOpen)(code)
            : resourceOpen(code);
    }

    /**
     * In resource, after optional whitespace, at `)` or a destination.
     *
     * ```markdown
     * > | [a](b) c
     *         ^
     * ```
     *
     */
    function resourceOpen(code: Code) {
        if (code === codes.rightParenthesis) {
            return resourceEnd(code);
        }

        return factoryDestination(
            effects,
            resourceDestinationAfter,
            resourceDestinationMissing,
            types.resourceDestination,
            types.resourceDestinationLiteral,
            types.resourceDestinationLiteralMarker,
            types.resourceDestinationRaw,
            types.resourceDestinationString,
            constants.linkResourceDestinationBalanceMax,
        )(code);
    }

    /**
     * In resource, after destination, at optional whitespace.
     *
     * ```markdown
     * > | [a](b) c
     *          ^
     * ```
     *
     */
    function resourceDestinationAfter(code: Code) {
        return markdownLineEndingOrSpace(code)
            ? factoryWhitespace(effects, resourceBetween)(code)
            : resourceEnd(code);
    }

    /**
     * At invalid destination.
     *
     * ```markdown
     * > | [a](<<) b
     *         ^
     * ```
     *
     */
    function resourceDestinationMissing(code: Code) {
        return nok(code);
    }

    /**
     * In resource, after destination and whitespace, at `(` or title.
     *
     * ```markdown
     * > | [a](b ) c
     *           ^
     * ```
     *
     */
    function resourceBetween(code: Code) {
        if (
            code === codes.quotationMark ||
            code === codes.apostrophe ||
            code === codes.leftParenthesis
        ) {
            return factoryTitle(
                effects,
                resourceTitleAfter,
                nok,
                types.resourceTitle,
                types.resourceTitleMarker,
                types.resourceTitleString,
            )(code);
        }

        return resourceEnd(code);
    }

    /**
     * In resource, after title, at optional whitespace.
     *
     * ```markdown
     * > | [a](b "c") d
     *              ^
     * ```
     *
     */
    function resourceTitleAfter(code: Code) {
        return markdownLineEndingOrSpace(code)
            ? factoryWhitespace(effects, resourceEnd)(code)
            : resourceEnd(code);
    }

    /**
     * In resource, at `)`.
     *
     * ```markdown
     * > | [a](b) d
     *          ^
     * ```
     *
     */
    function resourceEnd(code: Code) {
        if (code === codes.rightParenthesis) {
            effects.enter(types.resourceMarker);
            effects.consume(code);
            effects.exit(types.resourceMarker);
            effects.exit(types.resource);
            return ok;
        }

        return nok(code);
    }
}

function tokenizeReferenceFull(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return referenceFull;

    /**
     * In a reference (full), at the `[`.
     *
     * ```markdown
     * > | [a][b] d
     *        ^
     * ```
     *
     */
    function referenceFull(code: Code) {
        assert(code === codes.leftSquareBracket, "expected left bracket");
        return factoryLabel.call(
            self,
            effects,
            referenceFullAfter,
            referenceFullMissing,
            types.reference,
            types.referenceMarker,
            types.referenceString,
        )(code);
    }

    /**
     * In a reference (full), after `]`.
     *
     * ```markdown
     * > | [a][b] d
     *          ^
     * ```
     *
     */
    function referenceFullAfter(code: Code) {
        return self.parser.defined.includes(
            normalizeIdentifier(
                self
                    .sliceSerialize(self.events[self.events.length - 1][1])
                    .slice(1, -1),
            ),
        )
            ? ok(code)
            : nok(code);
    }

    /**
     * In reference (full) that was missing.
     *
     * ```markdown
     * > | [a][b d
     *        ^
     * ```
     *
     */
    function referenceFullMissing(code: Code) {
        return nok(code);
    }
}

function tokenizeReferenceCollapsed(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return referenceCollapsedStart;

    /**
     * In reference (collapsed), at `[`.
     *
     * > 👉 **Note**: we only get here if the label is defined.
     *
     * ```markdown
     * > | [a][] d
     *        ^
     * ```
     *
     */
    function referenceCollapsedStart(code: Code) {
        // We only attempt a collapsed label if there’s a `[`.
        assert(code === codes.leftSquareBracket, "expected left bracket");
        effects.enter(types.reference);
        effects.enter(types.referenceMarker);
        effects.consume(code);
        effects.exit(types.referenceMarker);
        return referenceCollapsedOpen;
    }

    /**
     * In reference (collapsed), at `]`.
     *
     * > 👉 **Note**: we only get here if the label is defined.
     *
     * ```markdown
     * > | [a][] d
     *         ^
     * ```
     *
     */
    function referenceCollapsedOpen(code: Code) {
        if (code === codes.rightSquareBracket) {
            effects.enter(types.referenceMarker);
            effects.consume(code);
            effects.exit(types.referenceMarker);
            effects.exit(types.reference);
            return ok;
        }

        return nok(code);
    }
}
