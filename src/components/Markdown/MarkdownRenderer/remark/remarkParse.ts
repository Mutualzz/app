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
    const self = this;

    self.parser = function (document: string) {
        return micromark(document, "utf-8", {
            ...self.data("settings"),
            ...options,
        });
    };
};
