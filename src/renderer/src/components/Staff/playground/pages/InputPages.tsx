import type { Color, ColorLike, Size, Variant } from "@mutualzz/ui-core";
import {
  Input,
  InputNumber,
  InputPassword,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
  type InputType
} from "@mutualzz/ui-web";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useState } from "react";
import {
  capitalize,
  Demo,
  DocsPage,
  KnobSelect,
  KnobSwitch,
  playgroundSizes,
  playgroundVariants,
  StyleKnobs,
  useKnobs
} from "../PlaygroundDocs";

const inputTypes: InputType[] = [
  "text",
  "password",
  "number",
  "search",
  "email",
  "date",
  "time"
];

const fruitOptions = ["Apple", "Banana", "Cherry", "Grape", "Mango"];

export function InputPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false,
    error: false,
    decorator: false
  });

  return (
    <DocsPage
      title="Input"
      description="Single-line text field. The type prop switches to the password, number or color input under the hood."
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
              label="error"
              checked={knobs.error}
              onChange={(error) => updateKnobs({ error })}
            />
            <KnobSwitch
              label="start decorator"
              checked={knobs.decorator}
              onChange={(decorator) => updateKnobs({ decorator })}
            />
          </>
        }
      >
        <Input
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
          error={knobs.error}
          placeholder="Type something…"
          startDecorator={knobs.decorator ? <MagnifyingGlassIcon /> : undefined}
        />
      </Demo>

      <Demo title="Variants">
        {playgroundVariants.map((variant) => (
          <Input
            key={variant}
            variant={variant}
            placeholder={capitalize(variant)}
          />
        ))}
      </Demo>

      <Demo title="Sizes">
        {playgroundSizes.map((size) => (
          <Input key={size} size={size} placeholder={capitalize(size)} />
        ))}
      </Demo>

      <Demo
        title="Types"
        description="Password and number render their own components with extra controls."
        align="start"
      >
        <Stack direction="column" spacing={1.5} width="100%" maxWidth={320}>
          {inputTypes.map((inputType) => (
            <Input
              key={inputType}
              type={inputType}
              placeholder={inputType}
              fullWidth
            />
          ))}
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function TextareaPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false,
    error: false,
    resizable: true
  });

  return (
    <DocsPage
      title="Textarea"
      description="Multi-line text field that grows between minRows and maxRows."
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
              label="error"
              checked={knobs.error}
              onChange={(error) => updateKnobs({ error })}
            />
            <KnobSwitch
              label="resizable"
              checked={knobs.resizable}
              onChange={(resizable) => updateKnobs({ resizable })}
            />
          </>
        }
      >
        <Stack width="100%" maxWidth={420}>
          <Textarea
            variant={knobs.variant}
            color={knobs.color}
            size={knobs.size}
            disabled={knobs.disabled}
            error={knobs.error}
            resizable={knobs.resizable}
            minRows={3}
            maxRows={8}
            placeholder="Write something long…"
          />
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function SelectPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false
  });
  const [pickedFruits, setPickedFruits] = useState<string[]>(["Apple"]);

  return (
    <DocsPage title="Select" description="Pick one or more values from a list.">
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
        <Select
          aria-label="Fruit"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
          placeholder="Choose a fruit"
        >
          {fruitOptions.map((fruit) => (
            <Option key={fruit} value={fruit}>
              {fruit}
            </Option>
          ))}
        </Select>
      </Demo>

      <Demo title="Multiple">
        <Stack direction="column" spacing={1} alignItems="center">
          <Select
            aria-label="Fruits"
            multiple
            value={pickedFruits}
            onValueChange={(value) =>
              setPickedFruits(
                (Array.isArray(value) ? value : [value]).map(String)
              )
            }
          >
            {fruitOptions.map((fruit) => (
              <Option key={fruit} value={fruit}>
                {fruit}
              </Option>
            ))}
          </Select>
          <Typography level="body-xs" textColor="muted">
            value: {pickedFruits.join(", ") || "none"}
          </Typography>
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function InputColorPage() {
  const [pickedColor, setPickedColor] = useState<ColorLike>("#7c5cff");
  const [knobs, updateKnobs] = useKnobs({
    size: "md" as Size,
    alpha: true,
    gradient: false,
    random: true,
    disabled: false
  });

  return (
    <DocsPage
      title="InputColor"
      description="Color field with a picker popup. This is the only public way into ui-web's ColorPicker."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSwitch
              label="allowAlpha"
              checked={knobs.alpha}
              onChange={(alpha) => updateKnobs({ alpha })}
            />
            <KnobSwitch
              label="allowGradient"
              checked={knobs.gradient}
              onChange={(gradient) => updateKnobs({ gradient })}
            />
            <KnobSwitch
              label="showRandom"
              checked={knobs.random}
              onChange={(random) => updateKnobs({ random })}
            />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
          </>
        }
      >
        <Stack direction="column" spacing={1} alignItems="center">
          <Input
            type="color"
            value={pickedColor}
            showColorPicker
            size={knobs.size}
            allowAlpha={knobs.alpha}
            allowGradient={knobs.gradient}
            showRandom={knobs.random}
            disabled={knobs.disabled}
            onChange={(color) => setPickedColor(color)}
          />
          <Typography level="body-xs" textColor="muted">
            value: {pickedColor}
          </Typography>
        </Stack>
      </Demo>
    </DocsPage>
  );
}

const numberSteps = ["1", "0.5", "5"];

export function InputNumberPage() {
  const [value, setValue] = useState("3");
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    step: "1",
    disabled: false,
    error: false
  });

  return (
    <DocsPage
      title="InputNumber"
      description="Number field with increment and decrement buttons, clamped between min and max. Same as Input with type=number."
    >
      <Demo
        title="Playground"
        description="min 0, max 10. Type 99 and click away: it should clamp to 10 and the value below should update too."
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSelect
              label="step"
              value={knobs.step}
              options={numberSteps}
              onChange={(step) => updateKnobs({ step })}
            />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
            <KnobSwitch
              label="error"
              checked={knobs.error}
              onChange={(error) => updateKnobs({ error })}
            />
          </>
        }
      >
        <Stack direction="column" spacing={1} alignItems="center">
          <InputNumber
            aria-label="Quantity"
            value={value}
            min={0}
            max={10}
            step={Number(knobs.step)}
            variant={knobs.variant}
            color={knobs.color}
            size={knobs.size}
            disabled={knobs.disabled}
            error={knobs.error}
            onChange={(event) => setValue(event.target.value)}
          />
          <Typography level="body-xs" textColor="muted">
            value: {value || "empty"}
          </Typography>
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function InputPasswordPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    iconVisible: true,
    disabled: false,
    error: false
  });

  return (
    <DocsPage
      title="InputPassword"
      description="Password field with a show/hide toggle. Same as Input with type=password."
    >
      <Demo
        title="Playground"
        description="Tab to the eye button and press Enter or Space; it should toggle. When disabled, the field must not be editable."
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSwitch
              label="iconVisible"
              checked={knobs.iconVisible}
              onChange={(iconVisible) => updateKnobs({ iconVisible })}
            />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
            <KnobSwitch
              label="error"
              checked={knobs.error}
              onChange={(error) => updateKnobs({ error })}
            />
          </>
        }
      >
        <InputPassword
          aria-label="Password"
          placeholder="Password"
          defaultValue="hunter2"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          iconVisible={knobs.iconVisible}
          disabled={knobs.disabled}
          error={knobs.error}
        />
      </Demo>
    </DocsPage>
  );
}
