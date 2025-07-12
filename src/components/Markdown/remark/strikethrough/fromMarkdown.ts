import {
    type CompileContext,
    type Extension,
    type Token,
} from "mdast-util-from-markdown";

export const strikethroughFromMarkdown: Extension = {
    enter: {
        strikethrough: function (this: CompileContext, token: Token) {
            this.enter(
                {
                    type: "strikethrough",
                    children: [],
                    data: { hName: "strikethrough" },
                },
                token,
            );
        },
    },
    exit: {
        strikethrough: function (this: CompileContext, token: Token) {
            this.exit(token);
        },
    },
    canContainEols: ["strikethrough"],
};
