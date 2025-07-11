import { Portal } from "@ui/components/utils/Portal/Portal";
import { Button, ButtonGroup, Paper, useTheme } from "@ui/index";
import { wrapSelectionWith } from "@utils/wrapSelectionWith";
import { type MouseEvent, useEffect, useRef } from "react";
import {
    FaBold,
    FaCode,
    FaItalic,
    FaStrikethrough,
    FaUnderline,
} from "react-icons/fa";
import { Range } from "slate";
import { useFocused, useSlate } from "slate-react";
import { getActiveFormats } from "../../utils/markdownUtils";

export const HoveringToolbar = () => {
    const { theme } = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const editor = useSlate();
    const inFocus = useFocused();

    const formats = getActiveFormats(editor, editor.selection);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const { selection } = editor;

        if (!selection || !inFocus || Range.isCollapsed(selection)) {
            el.removeAttribute("style");
            return;
        }

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
            el.removeAttribute("style");
            return;
        }
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();

        el.style.position = "absolute";
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
        el.style.left = `${
            rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
        }px`;
    }, [editor.selection, inFocus]);

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
                top={-1000}
                left={-1000}
                css={{
                    transition: "opacity 0.2s ease-in-out",
                }}
                zIndex={theme.zIndex.tooltip}
                boxShadow={theme.shadows[5]}
            >
                <ButtonGroup variant="soft">
                    <Button
                        variant="soft"
                        color={formats.includes("**") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "**")}
                    >
                        <FaBold />
                    </Button>
                    <Button
                        variant="soft"
                        color={formats.includes("*") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "*")}
                    >
                        <FaItalic />
                    </Button>
                    <Button
                        variant="soft"
                        color={formats.includes("__") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "__")}
                    >
                        <FaUnderline />
                    </Button>
                    <Button
                        variant="soft"
                        color={formats.includes("~~") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "~~")}
                    >
                        <FaStrikethrough />
                    </Button>
                    <Button
                        variant="soft"
                        color={formats.includes("`") ? "success" : "neutral"}
                        onClick={(e) => textFormat(e, "`")}
                    >
                        <FaCode />
                    </Button>
                </ButtonGroup>
            </Paper>
        </Portal>
    );
};
