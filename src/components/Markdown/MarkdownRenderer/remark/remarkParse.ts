import type { Root } from "mdast";

import type { Options as FromMarkdownOptions } from "@app-types/micromark";
import type { Plugin } from "unified";
import { micromark } from "../../utils/micromark";

type Options = Omit<FromMarkdownOptions, "extensions" | "mdastExtensions">;

export const remarkParse: Plugin<
    [(Readonly<Options> | null | undefined)?],
    string,
    Root
> = function (this: any, options?: Readonly<Options> | null) {
    this.parser = function (document: string) {
        return micromark(document, "utf-8", {
            ...this.data("settings"),
            ...options,
        });
    };
};
