import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    randomColor,
    type Color,
    type ColorLike,
    type Size,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    Option,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { useState } from "react";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";

export const Route = createFileRoute("/ui/inputs/radio-button")({
    component: PlaygroundRadio,
    head: () => ({
        meta: [
            ...seo({
                title: "Radio Button - Mutualzz UI",
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

const sizeNames = {
    sm: "Small",
    md: "Medium",
    lg: "Large",
};

const iconLibraries = {
    fa: FaIcons,
    md: MdIcons,
    ai: AiIcons,
};

const libNames = {
    fa: "Font Awesome",
    md: "Material Design",
    ai: "Ant Design",
};

function PlaygroundRadio() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [label, setLabel] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);

    const [currentChecked, setCurrentChecked] = useState<string>("primary");

    const [customSizeToggle, setCustomSizeToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const [checkedLibrary, setCheckedLibrary] = useState<
        keyof typeof iconLibraries | "none"
    >("none");
    const [checkedIconName, setCheckedIconName] = useState<string | null>(null);

    const [uncheckedLibrary, setUncheckedLibrary] = useState<
        keyof typeof iconLibraries | "none"
    >("none");
    const [uncheckedIconName, setUncheckedIconName] = useState<string | null>(
        null,
    );
    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

    const SelectedCheckedIcon =
        checkedLibrary !== "none" && checkedIconName
            ? (
                  iconLibraries[checkedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[checkedIconName]
            : null;

    const SelectedUncheckedIcon =
        uncheckedLibrary !== "none" && uncheckedIconName
            ? (
                  iconLibraries[uncheckedLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[uncheckedIconName]
            : null;

    const allRadios = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Radio
                name={c}
                checked={currentChecked === c}
                key={c}
                color={c}
                variant={v}
                size={size}
                label={label ?? `${capitalize(v)} ${capitalize(c)}`}
                onChange={(e) => setCurrentChecked(e.target.value)}
                disabled={disabled}
                checkedIcon={
                    SelectedCheckedIcon ? <SelectedCheckedIcon /> : undefined
                }
                uncheckedIcon={
                    SelectedUncheckedIcon ? (
                        <SelectedUncheckedIcon />
                    ) : undefined
                }
                value={c}
            />
        )),
    );
    const Radios = [...colors, ...customColors].map((c) => (
        <Radio
            name={c}
            checked={currentChecked === c}
            key={c}
            color={c}
            variant={variant as Variant}
            size={size}
            label={label ?? `${capitalize(variant)} ${capitalize(c)}`}
            onChange={(e) => setCurrentChecked(e.target.value)}
            disabled={disabled}
            checkedIcon={
                SelectedCheckedIcon ? <SelectedCheckedIcon /> : undefined
            }
            uncheckedIcon={
                SelectedUncheckedIcon ? <SelectedUncheckedIcon /> : undefined
            }
            value={c}
        />
    ));

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={20}
            >
                {variant === "all" &&
                    allRadios.map((Radios, i) => (
                        <Stack direction="row" spacing={10} key={i}>
                            {Radios}
                        </Stack>
                    ))}
                {variant !== "all" && Radios}
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
                        <Radio key="all" value="all" label="All" />
                        {variants.map((v) => (
                            <Radio key={v} value={v} label={capitalize(v)} />
                        ))}
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>States</Typography>
                    <Checkbox
                        checked={disabled}
                        label="Disabled"
                        onChange={() => setDisabled((prev) => !prev)}
                    />
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
                                    else setSize((28 + 10) / 2);
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={10}
                            max={28}
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
                            color="neutral"
                            spacing={10}
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
                    <Typography>Label</Typography>
                    <Input
                        type="text"
                        variant="solid"
                        size="lg"
                        color="primary"
                        fullWidth
                        value={label ?? ""}
                        onChange={(e) =>
                            setLabel(
                                e.target.value.trim() === ""
                                    ? null
                                    : e.target.value,
                            )
                        }
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
                <Stack justifyContent="center" direction="column" spacing={5}>
                    <Typography>Checked Icon</Typography>
                    <Stack direction="column" spacing={5}>
                        <RadioGroup
                            onChange={(_, library) =>
                                setCheckedLibrary(
                                    library as keyof typeof iconLibraries,
                                )
                            }
                            value={checkedLibrary}
                            name="libraries"
                            color="neutral"
                            spacing={5}
                        >
                            <Radio key="none" value="none" label="None" />
                            {Object.keys(iconLibraries).map((lib) => (
                                <Radio
                                    key={lib}
                                    value={lib}
                                    label={
                                        libNames[lib as keyof typeof libNames]
                                    }
                                />
                            ))}
                        </RadioGroup>
                        {checkedLibrary !== "none" && (
                            <Select
                                value={checkedIconName ?? ""}
                                onValueChange={(value) =>
                                    setCheckedIconName(value.toString())
                                }
                                placeholder="Select an icon"
                            >
                                <Option value="">None</Option>
                                {Object.keys(iconLibraries[checkedLibrary]).map(
                                    (iconName) => (
                                        <Option key={iconName} value={iconName}>
                                            {iconName}
                                        </Option>
                                    ),
                                )}
                            </Select>
                        )}
                    </Stack>
                </Stack>
                <Divider />
                <Stack justifyContent="center" direction="column" spacing={5}>
                    <Typography>Unchecked Icon</Typography>
                    <Stack direction="column" spacing={5}>
                        <RadioGroup
                            onChange={(_, library) =>
                                setUncheckedLibrary(
                                    library as keyof typeof iconLibraries,
                                )
                            }
                            value={uncheckedLibrary}
                            name="libraries"
                            color="neutral"
                            spacing={5}
                        >
                            <Radio key="none" value="none" label="None" />
                            {Object.keys(iconLibraries).map((lib) => (
                                <Radio
                                    key={lib}
                                    value={lib}
                                    label={
                                        libNames[lib as keyof typeof libNames]
                                    }
                                />
                            ))}
                        </RadioGroup>
                        {uncheckedLibrary !== "none" && (
                            <Select
                                value={uncheckedIconName ?? ""}
                                onValueChange={(value) =>
                                    setUncheckedIconName(value.toString())
                                }
                                placeholder="Select an icon"
                            >
                                <Option value="">None</Option>
                                {Object.keys(
                                    iconLibraries[uncheckedLibrary],
                                ).map((iconName) => (
                                    <Option key={iconName} value={iconName}>
                                        {iconName}
                                    </Option>
                                ))}
                            </Select>
                        )}
                    </Stack>
                </Stack>
            </PlaygroundRightSidebar>
        </Stack>
    );
}
