import type { Color, Orientation, Size, Variant } from "@mutualzz/ui-core";
import {
  List,
  ListItem,
  ListItemButton,
  Paper,
  Stack,
  Typography
} from "@mutualzz/ui-web";
import {
  BellIcon,
  CaretRightIcon,
  GearIcon,
  HouseIcon,
  UserIcon
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  Demo,
  DocsPage,
  KnobSelect,
  KnobSlider,
  KnobSwitch,
  playgroundColors,
  StyleKnobs,
  useKnobs
} from "../PlaygroundDocs";

type StackDirection = "row" | "column" | "row-reverse" | "column-reverse";
type StackAlign = "flex-start" | "center" | "flex-end" | "stretch";
type StackJustify =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around";

const stackDirections: StackDirection[] = [
  "row",
  "column",
  "row-reverse",
  "column-reverse"
];
const stackAligns: StackAlign[] = [
  "flex-start",
  "center",
  "flex-end",
  "stretch"
];
const stackJustifies: StackJustify[] = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around"
];
const orientations: Orientation[] = ["vertical", "horizontal"];
const listMarkers = ["none", "disc", "circle", "square", "decimal"];

const navigationItems = [
  { id: "home", label: "Home", icon: <HouseIcon /> },
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  { id: "settings", label: "Settings", icon: <GearIcon /> }
];

export function StackPage() {
  const [knobs, updateKnobs] = useKnobs({
    direction: "row" as StackDirection,
    spacing: 2,
    alignItems: "center" as StackAlign,
    justifyContent: "flex-start" as StackJustify,
    wrap: false
  });

  return (
    <DocsPage
      title="Stack"
      description="Flex container for laying out children in a row or column. spacing is in theme units and becomes gap."
    >
      <Demo
        title="Playground"
        align="start"
        knobs={
          <>
            <KnobSelect
              label="direction"
              value={knobs.direction}
              options={stackDirections}
              onChange={(direction) => updateKnobs({ direction })}
            />
            <KnobSlider
              label="spacing"
              value={knobs.spacing}
              min={0}
              max={6}
              onChange={(spacing) => updateKnobs({ spacing })}
            />
            <KnobSelect
              label="alignItems"
              value={knobs.alignItems}
              options={stackAligns}
              onChange={(alignItems) => updateKnobs({ alignItems })}
            />
            <KnobSelect
              label="justifyContent"
              value={knobs.justifyContent}
              options={stackJustifies}
              onChange={(justifyContent) => updateKnobs({ justifyContent })}
            />
            <KnobSwitch
              label="flexWrap"
              checked={knobs.wrap}
              onChange={(wrap) => updateKnobs({ wrap })}
            />
          </>
        }
      >
        <Stack
          width="100%"
          minHeight={200}
          direction={knobs.direction}
          spacing={knobs.spacing}
          alignItems={knobs.alignItems}
          justifyContent={knobs.justifyContent}
          flexWrap={knobs.wrap ? "wrap" : "nowrap"}
          css={{ outline: "1px dashed currentColor", outlineOffset: 4 }}
        >
          {playgroundColors.slice(0, 5).map((color, index) => (
            <Paper
              key={color}
              variant="soft"
              color={color}
              borderRadius={8}
              alignItems="center"
              justifyContent="center"
              minWidth={56}
              minHeight={40 + index * 8}
              px={2}
            >
              <Typography level="body-sm">{index + 1}</Typography>
            </Paper>
          ))}
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function ListPage() {
  const [activeItem, setActiveItem] = useState("home");
  const [knobs, updateKnobs] = useKnobs({
    variant: "plain" as Variant,
    color: "neutral" as Color,
    size: "md" as Size,
    orientation: "vertical" as Orientation,
    marker: "none"
  });

  return (
    <DocsPage
      title="List"
      description="List, ListItem and ListItemButton. Use ListItemButton for rows you can click, like navigation."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSelect
              label="orientation"
              value={knobs.orientation}
              options={orientations}
              onChange={(orientation) => updateKnobs({ orientation })}
            />
            <KnobSelect
              label="marker"
              value={knobs.marker}
              options={listMarkers}
              onChange={(marker) => updateKnobs({ marker })}
            />
          </>
        }
      >
        <List
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          orientation={knobs.orientation}
          marker={knobs.marker === "none" ? undefined : knobs.marker}
        >
          <ListItem>First item</ListItem>
          <ListItem>Second item, a bit longer than the first</ListItem>
          <ListItem endDecorator={<CaretRightIcon />}>
            Items can have decorators
          </ListItem>
        </List>
      </Demo>

      <Demo
        title="Navigation"
        description="ListItemButton rows; the selected one uses the soft variant. Each should be one tab stop and never submit a form."
      >
        <Stack width={240}>
          <List>
            {navigationItems.map((item) => {
              const active = item.id === activeItem;
              return (
                <ListItemButton
                  key={item.id}
                  variant={active ? "soft" : "plain"}
                  color={active ? "primary" : "neutral"}
                  startDecorator={item.icon}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setActiveItem(item.id)}
                >
                  {item.label}
                </ListItemButton>
              );
            })}
          </List>
        </Stack>
      </Demo>
    </DocsPage>
  );
}
