import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type TypographyColor,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Checkbox,
    Divider,
    Input,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";

export const Route = createFileRoute("/ui/data-display/markdown-renderer")({
    component: RouteComponent,
    head: () => ({
        meta: [
            ...seo({
                title: "Markdown Renderer - Mutualzz UI",
            }),
        ],
    }),
});

const variants = ["solid", "outlined", "plain", "soft"] as Variant[];
const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as Color[];

const textColors = [
    "primary",
    "secondary",
    "accent",
    "disabled",
    "inherit",
] as (TypographyColor | "inherit")[];

function RouteComponent() {
    const [markdown, setMarkdown] = useState("");

    const [variant, setVariant] = useState<Variant>("outlined");
    const [color, setColor] = useState<Color>("primary");
    const [textColor, setTextColor] = useState<TypographyColor | "inherit">(
        "primary",
    );

    const [emoticons, setEmoticons] = useState(true);
    const [hoverToolbar, setHoverToolbar] = useState(true);
    const [enlargeEmojiOnly, setEnlargeEmojiOnly] = useState(true);

    const [customColorEnabled, setCustomColorEnabled] = useState(false);
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customTextColor, setCustomTextColor] =
        useState<ColorLike>(randomColor());

    return (
        <Stack width="100%">
            <PlaygroundContent>
                <Stack width="50%" direction="column">
                    <Typography level="title-md" textAlign="center">
                        Markdown Editor
                    </Typography>
                    <Stack height="100%" p={12}>
                        <MarkdownInput
                            color="success"
                            textColor="primary"
                            emoticons={emoticons}
                            hoverToolbar={hoverToolbar}
                            value={markdown}
                            onChange={setMarkdown}
                        />
                    </Stack>
                </Stack>
                <Stack direction="column" width="50%">
                    <Typography level="title-md" textAlign="center">
                        Markdown Renderer
                    </Typography>
                    <MarkdownRenderer
                        color={customColorEnabled ? customColor : color}
                        textColor={
                            customTextColorEnabled ? customTextColor : textColor
                        }
                        variant={variant}
                        value={markdown}
                        enlargeEmojiOnly={enlargeEmojiOnly}
                        css={{
                            height: "100%",
                            p: 12,
                            mt: 10,
                        }}
                    />
                </Stack>
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        spacing={5}
                        color="neutral"
                    >
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Color</Typography>
                        <Checkbox
                            label="Custom"
                            checked={customColorEnabled}
                            onChange={(e) =>
                                setCustomColorEnabled(e.target.checked)
                            }
                            size="sm"
                        />
                    </Stack>
                    {customColorEnabled ? (
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            placeholder="Enter a color (e.g. #ff0000)"
                            value={customColor}
                            onChange={setCustomColor}
                            showRandom
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, color) => setColor(color as Color)}
                            value={color}
                            name="colors"
                            color="neutral"
                            spacing={5}
                        >
                            {colors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Text Color</Typography>
                        <Checkbox
                            label="Custom"
                            checked={customTextColorEnabled}
                            onChange={(e) =>
                                setCustomTextColorEnabled(e.target.checked)
                            }
                            size="sm"
                        />
                    </Stack>
                    {customTextColorEnabled ? (
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            fullWidth
                            placeholder="Enter a text color (e.g. #ff0000)"
                            value={customTextColor}
                            onChange={setCustomTextColor}
                            showRandom
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, textColor) =>
                                setTextColor(
                                    textColor as TypographyColor | "inherit",
                                )
                            }
                            value={textColor}
                            name="textColors"
                            color="neutral"
                            spacing={5}
                        >
                            {textColors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Editor Options</Typography>
                    <Checkbox
                        label="Emoticons"
                        checked={emoticons}
                        onChange={(e) => {
                            setEmoticons(e.target.checked);
                        }}
                    />
                    <Checkbox
                        label="Hover Toolbar"
                        checked={hoverToolbar}
                        onChange={(e) => {
                            setHoverToolbar(e.target.checked);
                        }}
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>Renderer Options</Typography>
                    <Checkbox
                        checked={enlargeEmojiOnly}
                        onChange={(e) => setEnlargeEmojiOnly(e.target.checked)}
                        label="Enlarge Emojis Only"
                    />
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
