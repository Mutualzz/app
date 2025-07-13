import {
    type CompileContext,
    type Extension,
    type Token,
} from "mdast-util-from-markdown";

export const spoilerFromMarkdown: Extension = {
    enter: {
        spoiler: function (this: CompileContext, token: Token) {
            this.enter(
                { type: "spoiler", children: [], data: { hName: "spoiler" } },
                token,
            );
        },
    },
    exit: {
        spoiler: function (this: CompileContext, token: Token) {
            this.exit(token);
        },
    },
    canContainEols: ["spoiler"],
};
