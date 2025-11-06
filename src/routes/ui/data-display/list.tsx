import { PlaygroundContent } from "@components/Playground/PlaygroundContent";
import { PlaygroundRightSidebar } from "@components/Playground/PlaygroundRightSidebar";
import {
    allowedListStyleTypes,
    randomColor,
    type Color,
    type ColorLike,
    type ColorResult,
    type Orientation,
    type Size,
    type Variant,
} from "@mutualzz/ui-core";
import {
    Button,
    Checkbox,
    Divider,
    IconButton,
    Input,
    List,
    ListItem,
    ListItemButton,
    Option,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Stack,
    Typography,
    type AllowedListStyleTypes,
    type ListItemButtonProps,
    type ListItemProps,
} from "@mutualzz/ui-web";
import { seo } from "@seo";
import { createFileRoute } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import startCase from "lodash-es/startCase";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Route = createFileRoute("/ui/data-display/list")({
    component: RouteComponent,
    head: () => ({
        meta: [
            ...seo({
                title: "List - Mutualzz UI",
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

function RouteComponent() {
    const [variant, setVariant] = useState<Variant | "all">("outlined");
    const [size, setSize] = useState<Size | number>("md");
    const [marker, setMarker] = useState<string | undefined>();
    const [orientation, setOrientation] = useState<Orientation>("vertical");

    const [numberOfItems, setNumberOfItems] = useState(5);

    const [listItemMode, setListItemMode] = useState<"default" | "button">(
        "button",
    );

    const [customColor, setCustomColor] = useState<ColorLike>(randomColor());

    const [customSizeToggle, setCustomSizeToggle] = useState(false);
    const [customMarkerToggle, setCustomMarkerToggle] = useState(false);

    const [customColors, setCustomColors] = useState<ColorLike[]>([]);
    const [colorToDelete, setColorToDelete] = useState<ColorLike | null>(null);

    const ListItemComponent = ({
        ...props
    }: ListItemButtonProps | ListItemProps) => {
        if (listItemMode === "button") {
            return (
                <ListItem {...(props as ListItemProps)}>
                    <ListItemButton {...(props as ListItemButtonProps)} />
                </ListItem>
            );
        }
        return <ListItem {...(props as ListItemProps)} />;
    };

    const allLists = [...colors, ...customColors].map((c) =>
        variants.map((v) => (
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                key={`${v}-${c}`}
            >
                <Typography>
                    {capitalize(v)} {capitalize(c)}
                </Typography>
                <List
                    key={`${v}-${c}-progress`}
                    variant={v}
                    color={c}
                    orientation={orientation}
                    size={size}
                >
                    {new Array(numberOfItems).fill(0).map((_, index) => (
                        <ListItemComponent
                            color={c}
                            variant={v}
                            size={size}
                            key={`item-${index}`}
                        >
                            {`Item ${index + 1}`}
                        </ListItemComponent>
                    ))}
                </List>
            </Stack>
        )),
    );

    const lists = [...colors, ...customColors].map((c) => (
        <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            key={c}
        >
            <Typography>
                {capitalize(variant)} {capitalize(c)}
            </Typography>
            <List
                size={size}
                key={`${variant}-${c}-progress`}
                variant={variant as Variant}
                color={c}
                orientation={orientation}
                marker={listItemMode === "default" ? marker : undefined}
            >
                {new Array(numberOfItems).fill(0).map((_, index) => (
                    <ListItemComponent
                        key={`item-${index}`}
                        color={c}
                        variant={variant as Variant}
                        size={size}
                    >
                        <Typography>{`Item ${index + 1}`}</Typography>
                    </ListItemComponent>
                ))}
            </List>
        </Stack>
    ));

    return (
        <Stack width="100%" direction="row">
            <PlaygroundContent
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                spacing={25}
            >
                {variant === "all" &&
                    allLists.map((list, i) => (
                        <Stack direction="row" spacing={25} key={i}>
                            {list}
                        </Stack>
                    ))}
                {variant !== "all" && lists}
            </PlaygroundContent>
            <PlaygroundRightSidebar>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variant"
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
                                    else setSize((6 + 24) / 2);
                                    return !prev;
                                })
                            }
                            size="sm"
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={6}
                            max={24}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(val) => `${val}px`}
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
                    <Typography>Orientation</Typography>
                    <RadioGroup
                        onChange={(_, ori) =>
                            setOrientation(ori as Orientation)
                        }
                        value={orientation}
                        orientation="horizontal"
                        spacing={10}
                        color="neutral"
                    >
                        <Radio label="Vertical" value="vertical" />
                        <Radio label="Horizontal" value="horizontal" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>List Item Mode</Typography>
                    <RadioGroup
                        orientation="horizontal"
                        spacing={10}
                        value={listItemMode}
                        onChange={(_, mode) =>
                            setListItemMode(mode as "default" | "button")
                        }
                    >
                        <Radio label="Default" value="default" />
                        <Radio label="Button" value="button" />
                    </RadioGroup>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>
                        Number of Items:{" "}
                        <Typography fontWeight="bold">
                            {numberOfItems}
                        </Typography>
                    </Typography>
                    <Stack direction="row" spacing={5}>
                        <Button
                            color="warning"
                            variant="soft"
                            onClick={() =>
                                setNumberOfItems((prev) =>
                                    prev > 5 ? prev - 1 : prev,
                                )
                            }
                        >
                            <FaMinus />
                        </Button>
                        <Button
                            color="success"
                            variant="soft"
                            onClick={() => setNumberOfItems((prev) => prev + 1)}
                        >
                            <FaPlus />
                        </Button>
                        <Button
                            color="danger"
                            variant="solid"
                            onClick={() => setNumberOfItems(5)}
                        >
                            Reset
                        </Button>
                    </Stack>
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
                            onChangeResult={(result: ColorResult) =>
                                setCustomColor(result.hex)
                            }
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
                                    <FaPlus />
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
                {listItemMode === "default" && (
                    <>
                        <Divider />
                        <Stack direction="column" spacing={5}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Typography>Marker</Typography>
                                <Checkbox
                                    checked={customMarkerToggle}
                                    label="Custom"
                                    onChange={() =>
                                        setCustomMarkerToggle((prev) => {
                                            if (prev) setMarker(undefined);
                                            else setMarker("");
                                            return !prev;
                                        })
                                    }
                                />
                            </Stack>
                            {customMarkerToggle ? (
                                <Input
                                    type="text"
                                    variant="solid"
                                    value={marker ?? ""}
                                    onChange={(e) => setMarker(e.target.value)}
                                    placeholder="Enter custom marker"
                                />
                            ) : (
                                <Select
                                    value={marker}
                                    onValueChange={(value) =>
                                        setMarker(
                                            value as AllowedListStyleTypes,
                                        )
                                    }
                                >
                                    <Option value="">None</Option>
                                    {allowedListStyleTypes
                                        .filter((m) => m !== "none")
                                        .map((m) => (
                                            <Option key={m} value={m}>
                                                {startCase(m)}
                                            </Option>
                                        ))}
                                </Select>
                            )}
                        </Stack>
                    </>
                )}
            </PlaygroundRightSidebar>
        </Stack>
    );
}
