import {
    type CompileContext,
    type Extension,
    type Token,
} from "mdast-util-from-markdown";

export const underlineFromMarkdown: Extension = {
    enter: {
        underline: function (this: CompileContext, token: Token) {
            this.enter(
                {
                    type: "underline",
                    children: [],
                    data: { hName: "underline" },
                },
                token,
            );
        },
    },
    exit: {
        underline: function (this: CompileContext, token: Token) {
            this.exit(token);
        },
    },
    canContainEols: ["underline"],
};
