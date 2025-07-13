import {
    Button,
    ButtonGroup,
    Divider,
    Paper,
    Portal,
    useTheme,
} from "@mutualzz/ui";
import {
    getActiveFormats,
    isBlockActive,
    toggleBlockquote,
} from "@utils/markdownUtils";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
    FaBold,
    FaCode,
    FaEye,
    FaEyeSlash,
    FaItalic,
    FaQuoteLeft,
    FaStrikethrough,
    FaUnderline,
} from "react-icons/fa";
import { Range } from "slate";
import { useFocused, useSlate } from "slate-react";

export const HoverToolbar = () => {
    const { theme } = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const editor = useSlate();
    const inFocus = useFocused();

    const [visible, setVisible] = useState(false);

    const formats = getActiveFormats(editor, editor.selection);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const { selection } = editor;

        if (
            !editor.enableHoverToolbar ||
            !selection ||
            !inFocus ||
            Range.isCollapsed(selection) ||
            !editor.selection
        ) {
            setVisible(false);
            return;
        }

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
            setVisible(false);
            return;
        }

        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();

        const top = rect.top + window.scrollY - el.offsetHeight - 8;
        const left =
            rect.left + window.scrollX + rect.width / 2 - el.offsetWidth / 2;

        el.style.top = `${top}px`;
        el.style.left = `${left}px`;

        setVisible(true);
    }, [editor.selection, inFocus, editor.enableHoverToolbar]);

    useEffect(() => {
        if (!inFocus) {
            const timeout = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timeout);
        } else {
            setVisible(true);
        }
    }, [inFocus]);

    const textFormat = (e: MouseEvent<HTMLButtonElement>, syntax: string) => {
        e.preventDefault();
        wrapSelectionWith(editor, syntax, formats);
    };

    return (
        <Portal>
            <Paper
                elevation={5}
                ref={ref}
                onMouseDown={(e) => e.preventDefault()}
                css={{
                    position: "absolute",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "scale(1)" : "scale(0.95)",
                    transition:
                        "opacity 150ms ease-out, transform 150ms ease-out",
                    zIndex: theme.zIndex.tooltip,
                    boxShadow: theme.shadows[5],
                    pointerEvents: visible ? "auto" : "none",
                }}
            >
                <ButtonGroup variant="plain" size="lg">
                    <Button
                        title="Bold"
                        color={formats.includes("**") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "**")}
                    >
                        <FaBold />
                    </Button>
                    <Button
                        title="Italic"
                        color={formats.includes("*") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "*")}
                    >
                        <FaItalic />
                    </Button>
                    <Button
                        title="Underline"
                        color={formats.includes("__") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "__")}
                    >
                        <FaUnderline />
                    </Button>
                    <Button
                        title="Strikethrough"
                        color={formats.includes("~~") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "~~")}
                    >
                        <FaStrikethrough />
                    </Button>
                </ButtonGroup>
                <Divider orientation="vertical" />
                <ButtonGroup variant="plain" size="lg">
                    <Button
                        title="Blockquote"
                        color={
                            isBlockActive(editor, "blockquote")
                                ? "success"
                                : "neutral"
                        }
                        onClick={() => toggleBlockquote(editor)}
                    >
                        <FaQuoteLeft />
                    </Button>
                    <Button
                        title="Code"
                        color={formats.includes("`") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "`")}
                    >
                        <FaCode />
                    </Button>
                    <Button
                        title="Spoiler"
                        color={formats.includes("||") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "||")}
                    >
                        {formats.includes("||") ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                </ButtonGroup>
            </Paper>
        </Portal>
    );
};
