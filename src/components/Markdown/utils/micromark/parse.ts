import { combineExtensions } from "micromark-util-combine-extensions";
import type {
    Create,
    FullNormalizedExtension,
    InitialConstruct,
    ParseContext,
    ParseOptions,
    Point,
    TokenizeContext,
} from "micromark-util-types";
import * as defaultConstructs from "./constructs";
import { createTokenizer } from "./create-tokenizer";
import { content } from "./initialize/content";
import { document } from "./initialize/document";
import { flow } from "./initialize/flow";
import { string, text } from "./initialize/text";

export function parse(options: ParseOptions | null | undefined): ParseContext {
    const settings = options || {};
    const constructs: FullNormalizedExtension = combineExtensions([
        defaultConstructs,
        ...(settings.extensions || []),
    ]) as FullNormalizedExtension;

    const parser: ParseContext = {
        constructs,
        content: create(content),
        defined: [],
        document: create(document),
        flow: create(flow),
        lazy: {},
        string: create(string),
        text: create(text),
    };

    return parser;

    function create(initial: InitialConstruct): Create {
        return creator;

        function creator(
            from: Omit<Point, "_bufferIndex" | "_index"> | undefined,
        ): TokenizeContext {
            return createTokenizer(parser, initial, from);
        }
    }
}
