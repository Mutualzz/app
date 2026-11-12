import type { ComponentType } from "react";
import {
  ButtonGroupPage,
  ButtonPage,
  IconButtonPage
} from "./pages/ActionPages";
import {
  AvatarPage,
  DividerPage,
  LinkPage,
  PaperPage,
  TypographyPage
} from "./pages/DisplayPages";
import {
  CircularProgressPage,
  LinearProgressPage,
  SkeletonPage
} from "./pages/FeedbackPages";
import {
  InputColorPage,
  InputNumberPage,
  InputPage,
  InputPasswordPage,
  SelectPage,
  TextareaPage
} from "./pages/InputPages";
import { ListPage, StackPage } from "./pages/LayoutPages";
import {
  DrawerPage,
  ModalPage,
  PopoverPage,
  TooltipPage
} from "./pages/OverlayPages";
import {
  CheckboxPage,
  RadioPage,
  SliderPage,
  SwitchPage
} from "./pages/SelectionPages";

export const playgroundGroups = [
  "Actions",
  "Inputs",
  "Selection",
  "Feedback",
  "Data display",
  "Layout",
  "Overlays"
] as const;

export type PlaygroundGroup = (typeof playgroundGroups)[number];

export interface PlaygroundEntry {
  id: string;
  name: string;
  group: PlaygroundGroup;
  Page: ComponentType;
}

export const playgroundEntries: PlaygroundEntry[] = [
  { id: "button", name: "Button", group: "Actions", Page: ButtonPage },
  {
    id: "icon-button",
    name: "IconButton",
    group: "Actions",
    Page: IconButtonPage
  },
  {
    id: "button-group",
    name: "ButtonGroup",
    group: "Actions",
    Page: ButtonGroupPage
  },
  { id: "input", name: "Input", group: "Inputs", Page: InputPage },
  {
    id: "input-number",
    name: "InputNumber",
    group: "Inputs",
    Page: InputNumberPage
  },
  {
    id: "input-password",
    name: "InputPassword",
    group: "Inputs",
    Page: InputPasswordPage
  },
  { id: "textarea", name: "Textarea", group: "Inputs", Page: TextareaPage },
  { id: "select", name: "Select", group: "Inputs", Page: SelectPage },
  {
    id: "input-color",
    name: "InputColor",
    group: "Inputs",
    Page: InputColorPage
  },
  { id: "checkbox", name: "Checkbox", group: "Selection", Page: CheckboxPage },
  { id: "radio", name: "Radio", group: "Selection", Page: RadioPage },
  { id: "switch", name: "Switch", group: "Selection", Page: SwitchPage },
  { id: "slider", name: "Slider", group: "Selection", Page: SliderPage },
  {
    id: "circular-progress",
    name: "CircularProgress",
    group: "Feedback",
    Page: CircularProgressPage
  },
  {
    id: "linear-progress",
    name: "LinearProgress",
    group: "Feedback",
    Page: LinearProgressPage
  },
  { id: "skeleton", name: "Skeleton", group: "Feedback", Page: SkeletonPage },
  {
    id: "typography",
    name: "Typography",
    group: "Data display",
    Page: TypographyPage
  },
  { id: "avatar", name: "Avatar", group: "Data display", Page: AvatarPage },
  { id: "divider", name: "Divider", group: "Data display", Page: DividerPage },
  { id: "link", name: "Link", group: "Data display", Page: LinkPage },
  { id: "paper", name: "Paper", group: "Data display", Page: PaperPage },
  { id: "list", name: "List", group: "Data display", Page: ListPage },
  { id: "stack", name: "Stack", group: "Layout", Page: StackPage },
  { id: "tooltip", name: "Tooltip", group: "Overlays", Page: TooltipPage },
  { id: "popover", name: "Popover", group: "Overlays", Page: PopoverPage },
  { id: "modal", name: "Modal", group: "Overlays", Page: ModalPage },
  { id: "drawer", name: "Drawer", group: "Overlays", Page: DrawerPage }
];

export const findPlaygroundEntry = (id: string | undefined) =>
  playgroundEntries.find((entry) => entry.id === id) ?? playgroundEntries[0];
