import { MarkdownInput } from "@components/Markdown/MarkdownInput/MarkdownInput";
import { MarkdownRenderer } from "@components/Markdown/MarkdownRenderer/MarkdownRenderer";
import {
    Button,
    Checkbox,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    Stack,
    Typography,
    useColorInput,
    type Color,
    type ColorLike,
    type TypographyColor,
    type Variant,
} from "@mutualzz/ui";
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

    const [customColorEnabled, setCustomColorEnabled] = useState(false);
    const [customTextColorEnabled, setCustomTextColorEnabled] = useState(false);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        setColorDirectly,
        validate,
    } = useColorInput<Color | ColorLike>();

    const {
        inputValue: inputTextColorValue,
        color: customTextColor,
        isInvalid: isTextColorInvalid,
        handleChange: handleTextColorChange,
        setColorDirectly: setTextColorDirectly,
        validate: validateTextColor,
    } = useColorInput<TypographyColor>();

    return (
        <Stack direction="row" width="100%" spacing={10}>
            <Paper width="50%" direction="column" pt={8}>
                <Typography level="title-sm" textAlign="center">
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
            </Paper>
            <Paper direction="column" p={12} pt={8} width="50%">
                <Typography level="title-sm" textAlign="center">
                    Markdown Renderer
                </Typography>
                <MarkdownRenderer
                    color={customColorEnabled ? customColor : color}
                    textColor={
                        customTextColorEnabled ? customTextColor : textColor
                    }
                    variant={variant}
                    value={markdown}
                    css={{
                        height: "100%",
                        p: 12,
                        mt: 10,
                    }}
                />
            </Paper>
            <Paper width="25%" overflowY="auto" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <label>Variant</label>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                    >
                        {variants.map((v) => (
                            <Radio
                                key={v}
                                value={v}
                                label={capitalize(v)}
                                checked={variant === v}
                                color="neutral"
                                onChange={() => setVariant(v)}
                            />
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
                        <label>Color</label>
                        <Checkbox
                            label="Custom"
                            checked={customColorEnabled}
                            onChange={(e) =>
                                setCustomColorEnabled(e.target.checked)
                            }
                        />
                    </Stack>
                    {customColorEnabled ? (
                        <Stack direction="row" spacing={5}>
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                error={isInvalid}
                                placeholder="Enter a color (e.g. #ff0000)"
                                value={inputColorValue}
                                onChange={(e) => {
                                    handleChange(e.target.value);
                                }}
                                onBlur={validate}
                            />
                            <Button
                                variant="solid"
                                color="neutral"
                                onClick={() => {
                                    setColorDirectly(randomHexColor());
                                }}
                            >
                                Random
                            </Button>
                        </Stack>
                    ) : (
                        <RadioGroup
                            onChange={(_, color) => setColor(color as Color)}
                            value={color}
                            name="colors"
                        >
                            {colors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                    checked={color === c}
                                    color="neutral"
                                    onChange={() => setColor(c)}
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
                        <label>Text Color</label>
                        <Checkbox
                            label="Custom"
                            checked={customTextColorEnabled}
                            onChange={(e) =>
                                setCustomTextColorEnabled(e.target.checked)
                            }
                        />
                    </Stack>
                    {customTextColorEnabled ? (
                        <Stack direction="row" spacing={5}>
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                error={isTextColorInvalid}
                                placeholder="Enter a text color (e.g. #ff0000)"
                                value={inputTextColorValue}
                                onChange={(e) => {
                                    handleTextColorChange(e.target.value);
                                }}
                                onBlur={validateTextColor}
                            />
                            <Button
                                variant="solid"
                                color="neutral"
                                onClick={() => {
                                    setTextColorDirectly(randomHexColor());
                                }}
                            >
                                Random
                            </Button>
                        </Stack>
                    ) : (
                        <RadioGroup
                            onChange={(_, textColor) =>
                                setTextColor(
                                    textColor as TypographyColor | "inherit",
                                )
                            }
                            value={textColor}
                            name="textColors"
                        >
                            {textColors.map((c) => (
                                <Radio
                                    key={c}
                                    value={c}
                                    label={capitalize(c)}
                                    checked={textColor === c}
                                    color="neutral"
                                    onChange={() =>
                                        setTextColor(c as TypographyColor)
                                    }
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
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
            </Paper>
        </Stack>
    );
}
