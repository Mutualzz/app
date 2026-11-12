import { Button as AppButton } from "@components/Button";
import { IconButton as AppIconButton } from "@components/IconButton";
import type { Color, Orientation, Size, Variant } from "@mutualzz/ui-core";
import { Button, ButtonGroup, IconButton } from "@mutualzz/ui-web";
import {
  ArrowRightIcon,
  HeartIcon,
  PlusIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon
} from "@phosphor-icons/react";
import { useState } from "react";
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

export function ButtonPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    disabled: false,
    loading: false,
    decorators: false
  });

  return (
    <DocsPage
      title="Button"
      description="Buttons trigger an action. Pick the variant by emphasis: solid for the main action, plain for the least important."
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
              label="loading"
              checked={knobs.loading}
              onChange={(loading) => updateKnobs({ loading })}
            />
            <KnobSwitch
              label="decorators"
              checked={knobs.decorators}
              onChange={(decorators) => updateKnobs({ decorators })}
            />
          </>
        }
      >
        <Button
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
          loading={knobs.loading}
          startDecorator={knobs.decorators ? <PlusIcon /> : undefined}
          endDecorator={knobs.decorators ? <ArrowRightIcon /> : undefined}
        >
          Button
        </Button>
      </Demo>

      <Demo title="Variants">
        {playgroundVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {capitalize(variant)}
          </Button>
        ))}
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <Button key={color} color={color}>
            {capitalize(color)}
          </Button>
        ))}
      </Demo>

      <Demo title="Sizes">
        {playgroundSizes.map((size) => (
          <Button key={size} size={size}>
            {capitalize(size)}
          </Button>
        ))}
      </Demo>

      <Demo
        title="Loading and disabled"
        description="Loading replaces the content with a spinner and blocks clicks."
      >
        <Button loading>Saving</Button>
        <Button loading variant="outlined">
          Saving
        </Button>
        <Button disabled>Disabled</Button>
        <Button disabled variant="soft">
          Disabled
        </Button>
      </Demo>

      <Demo
        title="App wrapper"
        description="@components/Button defaults color to the theme's text color. Left is the app wrapper, right is raw ui-web, both with no props."
      >
        <AppButton>App Button</AppButton>
        <Button>ui-web Button</Button>
      </Demo>
    </DocsPage>
  );
}

export function IconButtonPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "soft" as Variant,
    color: "neutral" as Color,
    size: "md" as Size,
    disabled: false,
    loading: false
  });

  return (
    <DocsPage
      title="IconButton"
      description="A square button holding only an icon. Always give it an aria-label."
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
              label="loading"
              checked={knobs.loading}
              onChange={(loading) => updateKnobs({ loading })}
            />
          </>
        }
      >
        <IconButton
          aria-label="Like"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          disabled={knobs.disabled}
          loading={knobs.loading}
        >
          <HeartIcon weight="fill" />
        </IconButton>
      </Demo>

      <Demo title="Variants">
        {playgroundVariants.map((variant) => (
          <IconButton key={variant} aria-label={variant} variant={variant}>
            <HeartIcon weight="fill" />
          </IconButton>
        ))}
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <IconButton
            key={color}
            aria-label={color}
            color={color}
            variant="soft"
          >
            <HeartIcon weight="fill" />
          </IconButton>
        ))}
      </Demo>

      <Demo
        title="App wrapper"
        description="@components/IconButton defaults to plain with the theme's text color. Left is the app wrapper, right is raw ui-web, both with no props."
      >
        <AppIconButton aria-label="App IconButton">
          <HeartIcon weight="fill" />
        </AppIconButton>
        <IconButton aria-label="ui-web IconButton">
          <HeartIcon weight="fill" />
        </IconButton>
      </Demo>
    </DocsPage>
  );
}

export function ButtonGroupPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "outlined" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    orientation: "horizontal" as Orientation,
    disabled: false
  });
  const [alignment, setAlignment] = useState("left");
  const [formats, setFormats] = useState<string[]>(["bold"]);

  return (
    <DocsPage
      title="ButtonGroup"
      description="Groups related buttons. With toggleable it works as a segmented control."
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
        <ButtonGroup
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          orientation={knobs.orientation}
          disabled={knobs.disabled}
        >
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </Demo>

      <Demo
        title="Exclusive toggle"
        description="One value at a time, like a radio group."
      >
        <ButtonGroup
          variant="soft"
          color="neutral"
          toggleable
          exclusive
          value={alignment}
          onChange={(value) => setAlignment(String(value))}
        >
          <Button value="left" aria-label="Align left">
            <TextAlignLeftIcon />
          </Button>
          <Button value="center" aria-label="Align center">
            <TextAlignCenterIcon />
          </Button>
          <Button value="right" aria-label="Align right">
            <TextAlignRightIcon />
          </Button>
        </ButtonGroup>
      </Demo>

      <Demo title="Multiple toggle" description="Any number of values.">
        <ButtonGroup
          variant="outlined"
          toggleable
          value={formats}
          onChange={(value) =>
            setFormats(Array.isArray(value) ? value.map(String) : [])
          }
        >
          <Button value="bold">Bold</Button>
          <Button value="italic">Italic</Button>
          <Button value="underline">Underline</Button>
        </ButtonGroup>
      </Demo>
    </DocsPage>
  );
}
