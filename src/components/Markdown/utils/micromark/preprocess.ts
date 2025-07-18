import { codes, constants } from "micromark-util-symbol";
import type { Chunk, Code, Encoding, Value } from "micromark-util-types";

export type Preprocessor = (
    value: Value,
    encoding?: Encoding | null | undefined,
    end?: boolean | null | undefined,
) => Chunk[];

const search = /[\0\t\n\r]/g;

export function preprocess(): Preprocessor {
    let column = 1;
    let buffer = "";
    let start: boolean | undefined = true;
    let atCarriageReturn: boolean | undefined;

    return preprocessor;

    function preprocessor(
        value: Value,
        encoding: Encoding | null | undefined,
        end: boolean | null | undefined,
    ) {
        const chunks: Chunk[] = [];
        let match: RegExpMatchArray | null;
        let next: number;
        let startPosition: number;
        let endPosition: number;
        let code: Code;

        value =
            buffer +
            (typeof value === "string"
                ? value.toString()
                : new TextDecoder(encoding || undefined).decode(value));

        startPosition = 0;
        buffer = "";

        if (start) {
            // To do: `markdown-rs` actually parses BOMs (byte order mark).
            if (value.charCodeAt(0) === codes.byteOrderMarker) {
                startPosition++;
            }

            start = undefined;
        }

        while (startPosition < value.length) {
            search.lastIndex = startPosition;
            match = search.exec(value);
            endPosition =
                match && match.index !== undefined ? match.index : value.length;
            code = value.charCodeAt(endPosition);

            if (!match) {
                buffer = value.slice(startPosition);
                break;
            }

            if (
                code === codes.lf &&
                startPosition === endPosition &&
                atCarriageReturn
            ) {
                chunks.push(codes.carriageReturnLineFeed);
                atCarriageReturn = undefined;
            } else {
                if (atCarriageReturn) {
                    chunks.push(codes.carriageReturn);
                    atCarriageReturn = undefined;
                }

                if (startPosition < endPosition) {
                    chunks.push(value.slice(startPosition, endPosition));
                    column += endPosition - startPosition;
                }

                switch (code) {
                    case codes.nul: {
                        chunks.push(codes.replacementCharacter);
                        column++;

                        break;
                    }

                    case codes.ht: {
                        next =
                            Math.ceil(column / constants.tabSize) *
                            constants.tabSize;
                        chunks.push(codes.horizontalTab);
                        while (column++ < next) chunks.push(codes.virtualSpace);

                        break;
                    }

                    case codes.lf: {
                        chunks.push(codes.lineFeed);
                        column = 1;

                        break;
                    }

                    default: {
                        atCarriageReturn = true;
                        column = 1;
                    }
                }
            }

            startPosition = endPosition + 1;
        }

        if (end) {
            if (atCarriageReturn) chunks.push(codes.carriageReturn);
            if (buffer) chunks.push(buffer);
            chunks.push(codes.eof);
        }

        return chunks;
    }
}
