<<<<<<< HEAD
=======
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
import {
    Button,
    Checkbox,
    Divider,
    Input,
    Paper,
    Radio,
    RadioGroup,
    randomHexColor,
    Slider,
    Stack,
    useColorInput,
    type Color,
    type ColorLike,
    type Size,
    type Variant,
<<<<<<< HEAD
} from "@mutualzz/ui";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
=======
} from "@ui";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36
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

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                p={20}
                spacing={variant === "all" ? 10 : 5}
            >
                {variant === "all" &&
                    allRadios.map((Radios, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {Radios}
                        </Stack>
                    ))}
                {variant !== "all" && Radios}
            </Paper>
            <Paper
                overflowY="auto"
                alignItems="center"
                direction="column"
                p={20}
            >
                <Divider>Playground</Divider>
                <Stack width="100%" direction="column" spacing={5}>
                    <Stack direction="column" spacing={5}>
                        <label>Variant</label>
                        <RadioGroup
                            onChange={(_, vriant) =>
                                setVariant(vriant as Variant)
                            }
                            value={variant}
                            name="variants"
                        >
                            <Radio
                                key="all"
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
                        <label>States</label>
                        <Stack direction="row" spacing={5}>
                            <Checkbox
                                checked={disabled}
                                label="Disabled"
                                onChange={() => setDisabled((prev) => !prev)}
                            />
                        </Stack>
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
                                        else setSize((28 + 10) / 2);
                                        return !prev;
                                    })
                                }
                            />
                        </Stack>
                        {customSizeToggle ? (
                            <Slider
                                value={size as number}
                                min={10}
                                max={28}
                                onChange={(e) =>
                                    setSize(Number(e.target.value))
                                }
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
                        <label>Custom Color</label>
                        <Stack
                            alignContent="center"
                            direction="row"
                            spacing={5}
                        >
                            <Input
                                variant="solid"
                                size="lg"
                                color="primary"
                                fullWidth
                                error={isInvalid}
                                placeholder="Enter a color (e.g., #ff0000)"
                                value={inputColorValue}
                                onChange={(e) => handleChange(e.target.value)}
                                onBlur={validate}
                            />
                            <Button
                                color="primary"
                                disabled={!customColor}
                                onClick={() => {
                                    setCustomColors(
                                        (prev) =>
                                            [
                                                ...prev,
                                                customColor,
                                            ] as ColorLike[],
                                    );
                                    setColorDirectly(randomHexColor());
                                    setColorToDelete(customColor as ColorLike);
                                }}
                            >
                                Add Color
                            </Button>
                        </Stack>
                        {customColors.length > 0 && (
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={5}
                            >
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
                                    Delete Color
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                    <Divider />
                    <Stack direction="column" spacing={5}>
                        <label>Label</label>
                        <Input
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
                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <label>Checked Icon</label>
                        <Stack direction="column" spacing={5}>
                            <RadioGroup
                                onChange={(_, library) =>
                                    setCheckedLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={checkedLibrary}
                                name="libraries"
                            >
                                <Radio
                                    key="none"
                                    value="none"
                                    label="None"
                                    checked={checkedLibrary === "none"}
                                    color="neutral"
                                    onChange={() => setCheckedLibrary("none")}
                                />
                                {Object.keys(iconLibraries).map((lib) => (
                                    <Radio
                                        key={lib}
                                        value={lib}
                                        label={
                                            libNames[
                                                lib as keyof typeof libNames
                                            ]
                                        }
                                        checked={checkedLibrary === lib}
                                        color="neutral"
                                        onChange={() =>
                                            setCheckedLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioGroup>
                            {checkedLibrary !== "none" && (
                                <select
                                    value={checkedIconName ?? ""}
                                    onChange={(e) =>
                                        setCheckedIconName(e.target.value)
                                    }
                                    css={{
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <option value="">Select an icon</option>
                                    {Object.keys(
                                        iconLibraries[checkedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <label>Unchecked Icon</label>
                        <Stack direction="column" spacing={5}>
                            <RadioGroup
                                onChange={(_, library) =>
                                    setUncheckedLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={uncheckedLibrary}
                                name="libraries"
                            >
                                <Radio
                                    key="none"
                                    value="none"
                                    label="None"
                                    checked={uncheckedLibrary === "none"}
                                    color="neutral"
                                    onChange={() => setUncheckedLibrary("none")}
                                />
                                {Object.keys(iconLibraries).map((lib) => (
                                    <Radio
                                        key={lib}
                                        value={lib}
                                        label={
                                            libNames[
                                                lib as keyof typeof libNames
                                            ]
                                        }
                                        checked={uncheckedLibrary === lib}
                                        color="neutral"
                                        onChange={() =>
                                            setUncheckedLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioGroup>
                            {uncheckedLibrary !== "none" && (
                                <select
                                    value={uncheckedIconName ?? ""}
                                    onChange={(e) =>
                                        setUncheckedIconName(e.target.value)
                                    }
                                    css={{
                                        padding: 10,
                                        borderRadius: 5,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <option value="">Select an icon</option>
                                    {Object.keys(
                                        iconLibraries[uncheckedLibrary],
                                    ).map((iconName) => (
                                        <option key={iconName} value={iconName}>
                                            {iconName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
