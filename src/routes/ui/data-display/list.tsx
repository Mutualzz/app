import {
    allowedListStyleTypes,
    Button,
    Checkbox,
    Divider,
    Input,
    List,
    ListItem,
    ListItemButton,
    Option,
    Paper,
    Radio,
    RadioGroup,
    randomColor,
    Select,
    Slider,
    Stack,
    Typography,
    type AllowedListStyleTypes,
    type Color,
    type ColorLike,
    type ListItemButtonProps,
    type ListItemProps,
    type Orientation,
    type Size,
    type Variant,
} from "@mutualzz/ui";
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
                marker={marker}
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
        <Stack width="100%" spacing={10} direction="row">
            <Paper
                width="100%"
                direction={variant === "all" ? "column" : "row"}
                alignItems="flex-start"
                alignContent="flex-start"
                wrap={variant === "all" ? "nowrap" : "wrap"}
                p={20}
                spacing={25}
                overflowY="auto"
            >
                {variant === "all" &&
                    allLists.map((list, i) => (
                        <Stack direction="row" spacing={25} key={i}>
                            {list}
                        </Stack>
                    ))}
                {variant !== "all" && lists}
            </Paper>
            <Paper width="25%" overflowY="auto" direction="column" p={20}>
                <Divider>Playground</Divider>
                <Stack direction="column" spacing={5}>
                    <Typography>Variant</Typography>
                    <RadioGroup
                        onChange={(_, vriant) => setVariant(vriant as Variant)}
                        value={variant}
                        name="variant"
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
                                    else setSize((24 + 72) / 2);
                                    return !prev;
                                })
                            }
                        />
                    </Stack>
                    {customSizeToggle ? (
                        <Slider
                            value={size as number}
                            min={24}
                            max={72}
                            onChange={(e) => setSize(Number(e.target.value))}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(val) => `${val}px`}
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
                {listItemMode === "default" && (
                    <>
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
                        <Divider />
                    </>
                )}
                <Stack direction="column" spacing={5}>
                    <Typography>Orientation</Typography>
                    <Stack direction="row" spacing={5}>
                        <Radio
                            label="Vertical"
                            value="vertical"
                            checked={orientation === "vertical"}
                            onChange={() => setOrientation("vertical")}
                        />
                        <Radio
                            label="Horizontal"
                            value="horizontal"
                            checked={orientation === "horizontal"}
                            onChange={() => setOrientation("horizontal")}
                        />
                    </Stack>
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <Typography>List Item Mode</Typography>
                    <Stack direction="row" spacing={5}>
                        <Radio
                            label="Default"
                            value="default"
                            checked={listItemMode === "default"}
                            onChange={() => setListItemMode("default")}
                        />
                        <Radio
                            label="Button"
                            value="button"
                            checked={listItemMode === "button"}
                            onChange={() => {
                                setMarker(undefined);
                                setCustomMarkerToggle(false);
                                setListItemMode("button");
                            }}
                        />
                    </Stack>
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
                    <Stack alignContent="center" direction="row" spacing={5}>
                        <Input
                            type="color"
                            variant="solid"
                            size="lg"
                            color="primary"
                            placeholder="Enter a color (e.g., #ff0000)"
                            value={customColor}
                            onChange={setCustomColor}
                        />
                        <Button
                            color="primary"
                            disabled={!customColor}
                            onClick={() => {
                                setCustomColors(
                                    (prev) =>
                                        [...prev, customColor] as ColorLike[],
                                );
                                setCustomColor(randomColor());
                                setColorToDelete(customColor);
                            }}
                        >
                            Add Color
                        </Button>
                    </Stack>
                    {customColors.length > 0 && (
                        <Stack alignItems="center" direction="row" spacing={10}>
                            <Select
                                value={colorToDelete ?? ""}
                                onValueChange={(value) => {
                                    setColorToDelete(
                                        value.toString().trim() as ColorLike,
                                    );
                                }}
                            >
                                {customColors.map((color) => (
                                    <Option key={color} value={color}>
                                        {color}
                                    </Option>
                                ))}
                            </Select>
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
            </Paper>
        </Stack>
    );
}
