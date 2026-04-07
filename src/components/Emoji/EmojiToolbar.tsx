import { useSlate } from "slate-react";
import { useContext, useEffect, useRef, useState } from "react";
import { MarkdownInputContext } from "@components/Markdown/MarkdownInput/MarkdownInput.context.ts";

export const EmojiToolbar = () => {
    const editor = useSlate();
    const { enableEmojis } = useContext(MarkdownInputContext);

    const ref = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!enableEmojis) return;

        const el = ref.current;
        if (!el) return;
    }, [editor.selection, enableEmojis]);

    return <></>;
};
