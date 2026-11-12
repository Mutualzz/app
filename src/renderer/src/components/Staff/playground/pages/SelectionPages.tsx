import type { Color, Orientation, Size, Variant } from "@mutualzz/ui-core";
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  type SliderValueLabelDisplay
} from "@mutualzz/ui-web";
import {
  capitalize,
  Demo,
  DocsPage,
  KnobSelect,
  KnobSwitch,
  playgroundColors,
  playgroundSizes,
  playgroundVariants,
  StyleKnobs,
  useKnobs
} from "../PlaygroundDocs";

const orientations: Orientation[] = ["horizontal", "vertical"];
const valueLabelDisplays: SliderValueLabelDisplay[] = ["auto", "on", "off"];
const groupOptions = ["Email", "Push", "SMS"];

export function CheckboxPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false,
    indeterminate: false
  });

  return (
    <DocsPage
      title="Checkbox"
      description="Turns a single option on or off, or picks several options from a group."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
            <KnobSwitch
              label="indeterminate"
              checked={knobs.indeterminate}
              onChange={(indeterminate) => updateKnobs({ indeterminate })}
            />
          </>
        }
      >
        <Checkbox
          defaultChecked
          label="Remember me"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
          indeterminate={knobs.indeterminate}
        />
      </Demo>

      <Demo title="Variants">
        {playgroundVariants.map((variant) => (
          <Checkbox
            key={variant}
            defaultChecked
            variant={variant}
            label={capitalize(variant)}
          />
        ))}
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <Checkbox
            key={color}
            defaultChecked
            color={color}
            label={capitalize(color)}
          />
        ))}
      </Demo>

      <Demo
        title="Group"
        description="The group sets color=success and the children set none, so green boxes mean the context reaches them."
      >
        <CheckboxGroup
          defaultValue={["Email"]}
          orientation="horizontal"
          color="success"
        >
          {groupOptions.map((option) => (
            <Checkbox key={option} value={option} label={option} />
          ))}
        </CheckboxGroup>
      </Demo>
    </DocsPage>
  );
}

export function RadioPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    orientation: "horizontal" as Orientation,
    disabled: false
  });

  return (
    <DocsPage
      title="Radio"
      description="Picks exactly one option from a group. Use RadioGroup so the radios share a name and value."
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
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
          </>
        }
      >
        <RadioGroup
          name="playground-radio"
          defaultValue="Email"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          orientation={knobs.orientation}
          disabled={knobs.disabled}
        >
          {groupOptions.map((option) => (
            <Radio key={option} value={option} label={option} />
          ))}
        </RadioGroup>
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <Radio
            key={color}
            defaultChecked
            name={`playground-radio-${color}`}
            color={color}
            label={capitalize(color)}
          />
        ))}
      </Demo>
    </DocsPage>
  );
}

export function SwitchPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false
  });

  return (
    <DocsPage
      title="Switch"
      description="An on/off setting that applies right away, with no save button."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
          </>
        }
      >
        <Switch
          defaultChecked
          label="Notifications"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
        />
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <Switch key={color} defaultChecked color={color} aria-label={color} />
        ))}
      </Demo>

      <Demo title="Sizes">
        {playgroundSizes.map((size) => (
          <Switch key={size} defaultChecked size={size} aria-label={size} />
        ))}
      </Demo>
    </DocsPage>
  );
}

export function SliderPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    valueLabelDisplay: "auto" as SliderValueLabelDisplay,
    marks: false,
    disabled: false
  });

  return (
    <DocsPage
      title="Slider"
      description="Picks a number, or a range with two thumbs, from a continuous scale."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSelect
              label="valueLabelDisplay"
              value={knobs.valueLabelDisplay}
              options={valueLabelDisplays}
              onChange={(valueLabelDisplay) =>
                updateKnobs({ valueLabelDisplay })
              }
            />
            <KnobSwitch
              label="marks"
              checked={knobs.marks}
              onChange={(marks) => updateKnobs({ marks })}
            />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
          </>
        }
      >
        <Box width="100%" maxWidth={360}>
          <Slider
            defaultValue={40}
            step={knobs.marks ? 10 : 1}
            variant={knobs.variant}
            color={knobs.color}
            size={knobs.size}
            valueLabelDisplay={knobs.valueLabelDisplay}
            marks={knobs.marks}
            disabled={knobs.disabled}
            getAriaLabel={() => "Volume"}
          />
        </Box>
      </Demo>

      <Demo title="Range">
        <Box width="100%" maxWidth={360}>
          <Slider
            defaultValue={[20, 70]}
            valueLabelDisplay="auto"
            getAriaLabel={(index) => (index === 0 ? "Minimum" : "Maximum")}
          />
        </Box>
      </Demo>

      <Demo title="Vertical">
        <Box height={160}>
          <Slider
            orientation="vertical"
            defaultValue={60}
            getAriaLabel={() => "Vertical"}
          />
        </Box>
      </Demo>
    </DocsPage>
  );
}
