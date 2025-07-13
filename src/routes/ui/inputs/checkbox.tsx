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

export const Route = createFileRoute("/ui/inputs/checkbox")({
    component: PlaygroundCheckbox,
    head: () => ({
        meta: [
            ...seo({
                title: "Checkbox - Mutualzz UI",
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

function PlaygroundCheckbox() {
    const [variant, setVariant] = useState<Variant | "all">("solid");
    const [label, setLabel] = useState<string | null>(null);
    const [size, setSize] = useState<Size | number>("md");
    const [disabled, setDisabled] = useState(false);
    const [rtl, setRtl] = useState(false);

    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);

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

    const [indeterminateLibrary, setIndeterminateLibrary] = useState<
        keyof typeof iconLibraries | "none"
    >("none");
    const [indeterminateIconName, setIndeterminateIconName] = useState<
        string | null
    >(null);

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

    const SelectedIndeterminateIcon =
        indeterminateLibrary !== "none" && indeterminateIconName
            ? (
                  iconLibraries[indeterminateLibrary] as Record<
                      string,
                      React.ComponentType<any>
                  >
              )[indeterminateIconName]
            : null;

    const {
        inputValue: inputColorValue,
        color: customColor,
        isInvalid,
        handleChange,
        validate,
        setColorDirectly,
    } = useColorInput<Color | ColorLike>();

    const allCheckboxes = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Checkbox
                key={`${c}-${v}`}
                label={label ?? `${capitalize(v)} ${capitalize(c)}`}
                checked={checked ? true : undefined}
                variant={v}
                rtl={rtl}
                color={c}
                indeterminate={indeterminate}
                size={size}
                disabled={disabled}
                checkedIcon={SelectedCheckedIcon && <SelectedCheckedIcon />}
                uncheckedIcon={
                    SelectedUncheckedIcon && <SelectedUncheckedIcon />
                }
                indeterminateIcon={
                    SelectedIndeterminateIcon && <SelectedIndeterminateIcon />
                }
            />
        )),
    );

    const checkboxes = [...colors, ...customColors].map((c) => (
        <Checkbox
            key={c}
            label={label ?? `${capitalize(variant)} ${capitalize(c)}`}
            checked={checked ? true : undefined}
            variant={variant as Variant}
            color={c}
            indeterminate={indeterminate}
            size={size}
            rtl={rtl}
            disabled={disabled}
            checkedIcon={SelectedCheckedIcon && <SelectedCheckedIcon />}
            uncheckedIcon={SelectedUncheckedIcon && <SelectedUncheckedIcon />}
            indeterminateIcon={
                SelectedIndeterminateIcon && <SelectedIndeterminateIcon />
            }
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
                    allCheckboxes.map((checkboxes, i) => (
                        <Stack direction="row" spacing={5} key={i}>
                            {checkboxes}
                        </Stack>
                    ))}
                {variant !== "all" && checkboxes}
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
                                        else setSize(Math.round((28 + 10) / 2));
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
                        <label>States</label>
                        <Checkbox
                            checked={checked}
                            label="Checked"
                            onChange={() => setChecked((prev) => !prev)}
                            disabled={disabled}
                        />
                        <Checkbox
                            checked={indeterminate}
                            label="Indeterminate"
                            onChange={() => setIndeterminate((prev) => !prev)}
                        />
                        <Checkbox
                            checked={disabled}
                            label="Disabled"
                            onChange={() => setDisabled((prev) => !prev)}
                        />
                        <Checkbox
                            checked={rtl}
                            label="Right to Left"
                            onChange={() => setRtl((prev) => !prev)}
                        />
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
                                placeholder="Enter a color (e.g., #ff0000)"
                                error={isInvalid}
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
                    <Divider />
                    <Stack
                        justifyContent="center"
                        direction="column"
                        spacing={5}
                    >
                        <label>Indeterminate Icon</label>
                        <Stack direction="column" spacing={5}>
                            <RadioGroup
                                onChange={(_, library) =>
                                    setIndeterminateLibrary(
                                        library as keyof typeof iconLibraries,
                                    )
                                }
                                value={indeterminateLibrary}
                                name="libraries"
                            >
                                <Radio
                                    key="none"
                                    value="none"
                                    label="None"
                                    checked={indeterminateLibrary === "none"}
                                    color="neutral"
                                    onChange={() =>
                                        setIndeterminateLibrary("none")
                                    }
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
                                            setIndeterminateLibrary(
                                                lib as keyof typeof iconLibraries,
                                            )
                                        }
                                    />
                                ))}
                            </RadioGroup>
                            {indeterminateLibrary !== "none" && (
                                <select
                                    value={indeterminateIconName ?? ""}
                                    onChange={(e) =>
                                        setIndeterminateIconName(e.target.value)
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
                                        iconLibraries[indeterminateLibrary],
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
