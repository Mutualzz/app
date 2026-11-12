import { Tooltip as AppTooltip } from "@components/Tooltip";
import type { Size } from "@mutualzz/ui-core";
import {
  Button,
  Drawer,
  Modal,
  Option,
  Paper,
  Popover,
  Select,
  Stack,
  Tooltip,
  Typography,
  type DrawerAnchor,
  type PopoverAlign,
  type PopoverPlacement,
  type TooltipPlacement
} from "@mutualzz/ui-web";
import { useState } from "react";
import {
  capitalize,
  Demo,
  DocsPage,
  KnobSelect,
  KnobSwitch,
  StyleKnobs,
  useKnobs
} from "../PlaygroundDocs";

type ModalLayout = "center" | "fullscreen";
type TooltipSource = "app" | "ui-web";

const tooltipSources: TooltipSource[] = ["app", "ui-web"];

const tooltipPlacements: TooltipPlacement[] = [
  "top",
  "top-start",
  "top-end",
  "right",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left"
];
const popoverPlacements: PopoverPlacement[] = [
  "top",
  "right",
  "bottom",
  "left"
];
const popoverAligns: PopoverAlign[] = ["start", "center", "end"];
const modalLayouts: ModalLayout[] = ["center", "fullscreen"];
const drawerAnchors: DrawerAnchor[] = ["left", "right", "top", "bottom"];

export function TooltipPage() {
  const [knobs, updateKnobs] = useKnobs({
    source: "app" as TooltipSource,
    placement: "top" as TooltipPlacement,
    followCursor: false,
    unstyled: false
  });

  const TooltipComponent = knobs.source === "app" ? AppTooltip : Tooltip;

  return (
    <DocsPage
      title="Tooltip"
      description="Short label shown on hover or focus. ui-web draws the surface (Paper with surfaceRole tooltip); the app's @components/Tooltip only raises elevation when you prefer embossed. unstyled renders the content bare, like the message hover toolbar."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="source"
              value={knobs.source}
              options={tooltipSources}
              onChange={(source) => updateKnobs({ source })}
            />
            <KnobSelect
              label="placement"
              value={knobs.placement}
              options={tooltipPlacements}
              onChange={(placement) => updateKnobs({ placement })}
            />
            <KnobSwitch
              label="followCursor"
              checked={knobs.followCursor}
              onChange={(followCursor) => updateKnobs({ followCursor })}
            />
            <KnobSwitch
              label="unstyled"
              checked={knobs.unstyled}
              onChange={(unstyled) => updateKnobs({ unstyled })}
            />
          </>
        }
      >
        <TooltipComponent
          title="Hello from the tooltip"
          placement={knobs.placement}
          followCursor={knobs.followCursor}
          unstyled={knobs.unstyled}
        >
          <Button variant="soft">Hover me</Button>
        </TooltipComponent>
      </Demo>
    </DocsPage>
  );
}

export function PopoverPage() {
  const [knobs, updateKnobs] = useKnobs({
    placement: "bottom" as PopoverPlacement,
    align: "center" as PopoverAlign,
    closeOnClickOutside: true
  });

  return (
    <DocsPage
      title="Popover"
      description="Floating panel opened by a trigger, for content that's richer than a tooltip."
    >
      <Demo
        title="Playground"
        description="Also try opening it near the window edge."
        knobs={
          <>
            <KnobSelect
              label="placement"
              value={knobs.placement}
              options={popoverPlacements}
              onChange={(placement) => updateKnobs({ placement })}
            />
            <KnobSelect
              label="align"
              value={knobs.align}
              options={popoverAligns}
              onChange={(align) => updateKnobs({ align })}
            />
            <KnobSwitch
              label="closeOnClickOutside"
              checked={knobs.closeOnClickOutside}
              onChange={(closeOnClickOutside) =>
                updateKnobs({ closeOnClickOutside })
              }
            />
          </>
        }
      >
        <Popover
          key={`${knobs.placement}-${knobs.align}`}
          placement={knobs.placement}
          align={knobs.align}
          closeOnClickOutside={knobs.closeOnClickOutside}
          surfaceRole="popover"
          elevation={4}
          p={2}
          borderRadius={12}
          trigger={<Button variant="soft">Open popover</Button>}
        >
          <Stack direction="column" spacing={0.5} maxWidth={220}>
            <Typography level="title-sm">Popover</Typography>
            <Typography level="body-sm" textColor="muted">
              Placed {knobs.placement}, aligned {knobs.align}.
            </Typography>
          </Stack>
        </Popover>
      </Demo>
    </DocsPage>
  );
}

export function ModalPage() {
  const [open, setOpen] = useState(false);
  const [knobs, updateKnobs] = useKnobs({
    layout: "center" as ModalLayout,
    showCloseButton: true,
    disableBackdropClick: false
  });

  return (
    <DocsPage
      title="Modal"
      description="Blocks the page until it's dismissed. Escape, the backdrop and the close button should all close it, and focus should return to the button that opened it."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="layout"
              value={knobs.layout}
              options={modalLayouts}
              onChange={(layout) => updateKnobs({ layout })}
            />
            <KnobSwitch
              label="showCloseButton"
              checked={knobs.showCloseButton}
              onChange={(showCloseButton) => updateKnobs({ showCloseButton })}
            />
            <KnobSwitch
              label="disableBackdropClick"
              checked={knobs.disableBackdropClick}
              onChange={(disableBackdropClick) =>
                updateKnobs({ disableBackdropClick })
              }
            />
          </>
        }
      >
        <Button onClick={() => setOpen(true)}>Open modal</Button>
      </Demo>

      <Modal
        open={open}
        layout={knobs.layout}
        showCloseButton={knobs.showCloseButton}
        disableBackdropClick={knobs.disableBackdropClick}
        onClose={() => setOpen(false)}
      >
        <Paper
          surfaceRole="modal"
          elevation={4}
          direction="column"
          spacing={2}
          p={3}
          {...(knobs.layout === "fullscreen"
            ? {
                width: "100%",
                height: "100%",
                borderRadius: 0,
                px: { xs: 3, md: 8 },
                py: { xs: 3, md: 6 }
              }
            : { width: 440, maxWidth: "95vw", borderRadius: 12 })}
        >
          <Typography level="h5">{capitalize(knobs.layout)} modal</Typography>
          <Typography level="body-sm" textColor="muted">
            Press Escape, click the backdrop or use the buttons. Open the select
            and press Escape: only the select should close.
          </Typography>
          <Select aria-label="Escape test" placeholder="Escape test">
            {["One", "Two", "Three"].map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </Stack>
        </Paper>
      </Modal>
    </DocsPage>
  );
}

export function DrawerPage() {
  const [open, setOpen] = useState(false);
  const [knobs, updateKnobs] = useKnobs({
    anchor: "left" as DrawerAnchor,
    size: "md" as Size,
    swipeable: true
  });

  return (
    <DocsPage
      title="Drawer"
      description="Panel that slides in from an edge. The app only uses the left edge so far, so top and bottom haven't been tested anywhere else."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="anchor"
              value={knobs.anchor}
              options={drawerAnchors}
              onChange={(anchor) => updateKnobs({ anchor })}
            />
            <StyleKnobs values={{ size: knobs.size }} onChange={updateKnobs} />
            <KnobSwitch
              label="swipeable"
              checked={knobs.swipeable}
              onChange={(swipeable) => updateKnobs({ swipeable })}
            />
          </>
        }
      >
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
      </Demo>

      <Drawer
        open={open}
        anchor={knobs.anchor}
        size={knobs.size}
        swipeable={knobs.swipeable}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Stack direction="column" spacing={2} p={3}>
          <Typography level="h6">Drawer ({knobs.anchor})</Typography>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Stack>
      </Drawer>
    </DocsPage>
  );
}
