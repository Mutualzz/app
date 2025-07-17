import {
    allowedListStyleTypes,
    Checkbox,
    Divider,
    Input,
    List,
    ListItem,
    ListItemButton,
    Paper,
    Radio,
    RadioGroup,
    Slider,
    Stack,
    Typography,
    type AllowedListStyleTypes,
    type Color,
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

const dummyListItems = [
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "Item 6",
    "Item 7",
    "Item 8",
];

function RouteComponent() {
    const [variant, setVariant] = useState<Variant | "all">("outlined");
    const [size, setSize] = useState<Size | number>("md");
    const [marker, setMarker] = useState<string | undefined>();
    const [orientation, setOrientation] = useState<Orientation>("vertical");

    const [listItemMode, setListItemMode] = useState<"default" | "button">(
        "button",
    );
    const ListItemComponent = ({
        color,
        variant,
        size,
        ...props
    }: ListItemButtonProps | ListItemProps) => {
        if (listItemMode === "button") {
            return (
                <ListItemButton
                    color={color}
                    variant={variant}
                    size={size}
                    {...(props as ListItemButtonProps)}
                />
            );
        }
        return <ListItem {...(props as ListItemProps)} />;
    };

    const [customSizeToggle, setCustomSizeToggle] = useState(false);
    const [customMarkerToggle, setCustomMarkerToggle] = useState(false);

    const allLists = [...colors].map((c) =>
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
                    {dummyListItems.map((item, index) => (
                        <ListItemComponent
                            color={c}
                            variant={v}
                            size={size}
                            key={`${item}-${index}`}
                        >
                            {item}
                        </ListItemComponent>
                    ))}
                </List>
            </Stack>
        )),
    );

    const lists = [...colors].map((c) => (
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
                {dummyListItems.map((item, index) => (
                    <ListItemComponent
                        key={`${item}-${index}`}
                        color={c}
                        variant={variant as Variant}
                        size={size}
                    >
                        <Typography>{item}</Typography>
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
                    <label>Variant</label>
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
                        <label>Size</label>
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
                <Stack direction="column" spacing={5}>
                    <Stack direction="row" justifyContent="space-between">
                        <label>Marker</label>
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
                            variant="solid"
                            value={marker ?? ""}
                            onChange={(e) => setMarker(e.target.value)}
                            placeholder="Enter custom marker"
                        />
                    ) : (
                        <select
                            value={marker}
                            onChange={(e) =>
                                setMarker(
                                    e.target.value as AllowedListStyleTypes,
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            <option value="">None</option>
                            {allowedListStyleTypes
                                .filter((m) => m !== "none")
                                .map((m) => (
                                    <option key={m} value={m}>
                                        {startCase(m)}
                                    </option>
                                ))}
                        </select>
                    )}
                </Stack>
                <Divider />
                <Stack direction="column" spacing={5}>
                    <label>Orientation</label>
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
                    <label>List Item Mode</label>
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
                            onChange={() => setListItemMode("button")}
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}
