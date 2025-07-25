import {
    Button,
    Checkbox,
    type Color,
    type ColorLike,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    type Size,
    Slider,
    Stack,
    useColorInput,
    type Variant,
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { type ReactNode, useState } from "react";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";

export const Route = createFileRoute("/ui/inputs/button")({
    component: PlaygroundButton,
    head: () => ({
        meta: [
            ...seo({
                title: "Button - Mutualzz UI",
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

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    ai: AiIcons,
};

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const libNames = {
    fa: "Font Awesome",
    md: "Material Design",
    ai: "Ant Design",
};

type IconPosition = "left" | "right" | "both" | "none";

function PlaygroundButton() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [text, setText] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [iconOnly, setIconOnly] = useState(false);

    const [iconPosition, setIconPosition] = useState<IconPosition>("none");

    const [iconLibrary, setIconLibrary] =
        useState<keyof typeof iconLibraries>("fa");

    const [icon, setIcon] = useState<ReactNode | null>(null);

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const allButtons = [...colors, ...customColors].map((c) =>
        variants.map((v) =>
            iconOnly ? (
                <Button
                    key={`${v}-${c}-button`}
                    variant={v}
                    color={c}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                    startDecorator={
                        iconPosition === "left" && icon ? icon : null
                    }
                    endDecorator={
                        iconPosition === "right" && icon ? icon : null
                    }
                />
            ) : (
                <Button
                    key={`${v}-${c}-button`}
                    variant={v}
                    color={c}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                    startDecorator={
                        (iconPosition === "left" || iconPosition === "both") &&
                        icon
                            ? icon
                            : null
                    }
                    endDecorator={
                        (iconPosition === "right" || iconPosition === "both") &&
                        icon
                            ? icon
                            : null
                    }
                >
                    {text ?? `${capitalize(v)} ${capitalize(c)}`}
                </Button>
            ),
        ),
    );

    const buttons = [...colors, ...customColors].map((c) =>
        iconOnly ? (
            <Button
                key={`${variant}-${c}-button`}
                variant={variant as Variant}
                color={c}
                size={size}
                loading={loading}
                disabled={disabled}
                startDecorator={
                    (iconPosition === "left" || iconPosition === "both") && icon
                        ? icon
                        : null
                }
                endDecorator={
                    (iconPosition === "right" || iconPosition === "both") &&
                    icon
                        ? icon
                        : null
                }
            />
        ) : (
            <Button
                key={`${variant}-${c}-button`}
                variant={variant as Variant}
                color={c}
                size={size}
                loading={loading}
                disabled={disabled}
                startDecorator={
                    (iconPosition === "left" || iconPosition === "both") && icon
                        ? icon
                        : null
                }
                endDecorator={
                    (iconPosition === "right" || iconPosition === "both") &&
                    icon
                        ? icon
                        : null
                }
            >
                {text ?? `${capitalize(variant)} ${capitalize(c)}`}
            </Button>
        ),
    );

    return (
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                p={20}
                spacing={variant === "all" ? 10 : 5}
                overflowY="auto"
            >
                {variant === "all" &&
                    allButtons.map((buttons, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {buttons}
                        </Stack>
                    ))}
                {variant !== "all" && buttons}
            </Paper>
            <Paper direction="column" overflowY="auto" width="25%" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <label>Variant</label>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                    >
                        <Radio
                            value="all"
                            label="All"
                            checked={variant === "all"}
                            color="neutral"
                            onChange={() => setVariant("all")}
                        />
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
                        <label>Size</label>
                        <Checkbox
                            checked={customSizeToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomSizeToggle((prev) => {
                                    if (prev) setSize("md");
                                    else setSize(Math.round((24 + 10) / 2));
                                    return !prev;
                                })
                            }
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={10}
                            max={24}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}px`}
                        />
                    ) : (
                        <RadioGroup
                            onChange={(_, size) => setSize(size as Size)}
                            value={size as Size}
                            name="sizes"
                            row
                        >
                            {Object.keys(sizeNames).map((s) => (
                                <Radio
                                    key={s}
                                    value={s}
                                    label={sizeNames[s as Size]}
                                    checked={size === s}
                                    color="neutral"
                                    onChange={() => setSize(s as Size)}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>States</label>
                    <Stack direction="row" spacing={5}>
                        <Checkbox
                            checked={loading}
                            label="Loading"
                            onChange={() => setLoading((prev) => !prev)}
                            disabled={disabled}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                            disabled={loading}
                        />
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>Custom Color</label>
                    <Stack alignContent="center" direction="row" spacing={5}>
                        <Input
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000)"
                            value={inputColorValue}
                            error={isInvalid}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={validate}
                        />
                        <Button
                            color="primary"
                            disabled={!customColor}
                            onClick={() => {
                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                setColorDirectly(randomHexColor());
                                setColorToDelete(customColor as ColorLike);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" spacing={10}>
                            <select
                                value={colorToDelete ?? ""}
                                onChange={(e) => {
                                    setColorToDelete(
                                        e.target.value.trim() as ColorLike,
                                    );
                                }}
                                css={{
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                    width: "100%",
                                }}
                            >
                                {customColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                            <Button
                                color="danger"
                                onClick={() => {
                                    setCustomColors((prev) => {
                                        const updated = prev.filter(
                                            (color) => color !== colorToDelete,
                                        );
                                        setColorToDelete(
                                            updated.length > 0
                                                ? updated[updated.length - 1]
                                                : null,
                                        );
                                        return updated;
                                    });
                                }}
                            >
                                Delete Color
                            </Button>
                        </Stack>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>Text</label>
                    <Input
                        variant="solid"
                        size="lg"
                        color="primary"
                        placeholder="Enter button text"
                        value={text ?? ""}
                        onChange={(e) =>
                            setText(
                                e.target.value.trim() === ""
                                    ? null
                                    : e.target.value,
                            )
                        }
                        fullWidth
                    />
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <label>Icon</label>
                        {icon && iconPosition !== "both" && (
                            <Checkbox
                                checked={iconOnly}
                                label="Icon Only"
                                onChange={() => setIconOnly((prev) => !prev)}
                                disabled={disabled}
                            />
                        )}
                    </Stack>
                    <RadioGroup
                        onChange={(_, iconPosition) =>
                            setIconPosition(() => {
                                if (iconPosition === "none") setIcon(null);

                                return iconPosition as IconPosition;
                            })
                        }
                        value={iconPosition}
                        name="icon-position"
                        row
                    >
                        <Radio
                            value="none"
                            label="None"
                            checked={iconPosition === "none"}
                            color="neutral"
                            onChange={() => setIconPosition("none")}
                        />
                        <Radio
                            value="left"
                            label="Left"
                            checked={iconPosition === "left"}
                            color="neutral"
                            onChange={() => setIconPosition("left")}
                        />
                        <Radio
                            value="right"
                            label="Right"
                            checked={iconPosition === "right"}
                            color="neutral"
                            onChange={() => setIconPosition("right")}
                        />
                        <Radio
                            value="both"
                            label="Both"
                            checked={iconPosition === "both"}
                            color="neutral"
                            onChange={() => setIconPosition("both")}
                        />
                    </RadioGroup>
                    {iconPosition !== "none" && (
                        <Stack direction="column" spacing={10}>
                            <RadioGroup
                                onChange={(_, library) =>
                                    setIconLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={iconLibrary}
                                name="icon-library"
                            >
                                {Object.keys(iconLibraries).map((lib) => (
                                    <Radio
                                        key={lib}
                                        value={lib}
                                        label={
                                            libNames[
                                                lib as keyof typeof libNames
                                            ]
                                        }
                                        checked={iconLibrary === lib}
                                        color="neutral"
                                        onChange={() =>
                                            setIconLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioGroup>
                            <select
                                name="icon-select"
                                onChange={(e) => {
                                    const Icon =
                                        iconLibraries[iconLibrary][
                                            e.target
                                                .value as keyof (typeof iconLibraries)[typeof iconLibrary]
                                        ];
                                    setIcon(Icon);
                                }}
                                css={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 5,
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <option value="">Select an icon</option>
                                {Object.keys(iconLibraries[iconLibrary]).map(
                                    (icon) => (
                                        <option key={icon} value={icon}>
                                            {icon}
                                        </option>
                                    ),
                                )}
                            </select>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}
