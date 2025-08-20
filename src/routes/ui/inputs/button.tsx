import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    Button,
    Checkbox,
    type Color,
    type ColorLike,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    type Size,
    Slider,
    Stack,
    Typography,
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

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());
    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const allButtons = [...colors, ...customColors].map((c) =>
        variants.map((v) =>
            iconOnly ? (
                <IconButton
                    key={`${v}-${c}-button`}
                    variant={v}
                    color={c}
                    size={size}
                    loading={loading}
                    disabled={disabled}
                >
                    {icon}
                </IconButton>
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
            <IconButton
                key={`${variant}-${c}-button`}
                variant={variant as Variant}
                color={c}
                size={size}
                loading={loading}
                disabled={disabled}
            >
                {icon}
            </IconButton>
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
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={10}
            >
                {variant === "all" &&
                    allButtons.map((buttons, i) => (
                        <Stack direction="row" spacing={10} key={i}>
                            {buttons}
                        </Stack>
                    ))}
                {variant !== "all" && buttons}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variants"
                        color="neutral"
                        spacing={5}
                    >
                        <Radio value="all" label="All" />
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
                        <Typography>Size</Typography>
                        <Checkbox
                            checked={customSizeToggle}
                            label="Custom"
                            onChange={() =>
                                setCustomSizeToggle((prev) => {
                                    if (prev) setSize("md");
                                    else setSize(Math.round((24 + 8) / 2));
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={8}
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
                            orientation="horizontal"
                            spacing={10}
                            color="neutral"
                        >
                            {Object.keys(sizeNames).map((s) => (
                                <Radio
                                    key={s}
                                    value={s}
                                    label={sizeNames[s as Size]}
                                />
                            ))}
                        </RadioGroup>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>States</Typography>
                    <Stack direction="row" spacing={20}>
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
                    <Typography>Text</Typography>
                    <Input
                        type="text"
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
                    <Typography>Custom Color</Typography>
                    <Stack direction="column" spacing={10}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000)"
                            value={customColor}
                            onChange={setCustomColor}
                            endDecorator={
                                <IconButton
                                    color={customColor}
                                    variant="solid"
                                    onClick={() => {
                                        setCustomColors(
                                            (prev) =>
                                                [
                                                    ...prev,
                                                    customColor,
                                                ] as ColorLike[],
                                        );
                                        setCustomColor(randomColor());
                                        setColorToDelete(customColor);
                                    }}
                                >
                                    <FaIcons.FaPlus />
                                </IconButton>
                            }
                        />
                        {customColors.length > 0 && (
                            <Stack direction="column" spacing={10}>
                                <Select
                                    value={colorToDelete ?? ""}
                                    onValueChange={(value) => {
                                        setColorToDelete(
                                            value
                                                .toString()
                                                .trim() as ColorLike,
                                        );
                                    }}
                                    color={colorToDelete ?? "neutral"}
                                >
                                    {customColors.map((color) => (
                                        <Option
                                            color={color}
                                            key={color}
                                            value={color}
                                        >
                                            {color}
                                        </Option>
                                    ))}
                                </Select>
                                <Stack direction="column" spacing={10}>
                                    <Button
                                        color="danger"
                                        onClick={() => {
                                            setCustomColors((prev) => {
                                                const updated = prev.filter(
                                                    (color) =>
                                                        color !== colorToDelete,
                                                );
                                                setColorToDelete(
                                                    updated.length > 0
                                                        ? updated[
                                                              updated.length - 1
                                                          ]
                                                        : null,
                                                );
                                                return updated;
                                            });
                                        }}
                                    >
                                        {customColors.length > 1
                                            ? "Delete Selected Color"
                                            : "Delete Color"}
                                    </Button>
                                    {customColors.length > 1 && (
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={() => {
                                                setCustomColors([]);
                                            }}
                                        >
                                            Delete All
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={10}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={5}
                    >
                        <Typography>Icon</Typography>
                        {icon && (
                            <Checkbox
                                checked={iconOnly}
                                label="Icon Only"
                                onChange={() => setIconOnly((prev) => !prev)}
                                disabled={disabled}
                                size="sm"
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
                        spacing={10}
                        color="neutral"
                    >
                        <Radio value="none" label="None" />
                        <Radio value="left" label="Left" />
                        <Radio value="right" label="Right" />
                        <Radio value="both" label="Both" />
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
                                color="neutral"
                                spacing={5}
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
                                    />
                                ))}
                            </RadioGroup>
                            <Select
                                onValueChange={(value) => {
                                    const Icon =
                                        iconLibraries[iconLibrary][
                                            value as keyof (typeof iconLibraries)[typeof iconLibrary]
                                        ];
                                    setIcon(Icon);
                                }}
                                placeholder="Select an icon"
                            >
                                <Option value="">None</Option>
                                {Object.keys(iconLibraries[iconLibrary]).map(
                                    (icon) => (
                                        <Option key={icon} value={icon}>
                                            {icon}
                                        </Option>
                                    ),
                                )}
                            </Select>
                        </Stack>
                    )}
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
