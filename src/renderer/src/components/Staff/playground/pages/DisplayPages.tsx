import { Paper as AppPaper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import type { Color, Shape, Size, TypographyLevel } from "@mutualzz/ui-core";
import {
  Avatar,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
  type DividerInset,
  type DividerVariant,
  type LinkUnderline,
  type LinkVariant,
  type PaperVariant,
  type TypographyVariant
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
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

const typographyLevels: TypographyLevel[] = [
  "display-lg",
  "display-md",
  "display-sm",
  "display-xs",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "body-xs",
  "label-sm",
  "label-xs"
];
const typographyVariants: TypographyVariant[] = ["none", ...playgroundVariants];
const avatarShapes: Shape[] = ["circle", "rounded", "square"];
const paperVariants: PaperVariant[] = ["elevation", ...playgroundVariants];
const paperElevations = ["0", "1", "2", "3", "4", "5"];
const dividerVariants: DividerVariant[] = [
  "solid",
  "dashed",
  "dotted",
  "double"
];
const dividerInsets: DividerInset[] = [
  "none",
  "half-start",
  "half-end",
  "start",
  "end"
];
const linkUnderlines: LinkUnderline[] = ["hover", "always", "none"];
const linkVariants: LinkVariant[] = ["none", ...playgroundVariants];

export function TypographyPage() {
  const [knobs, updateKnobs] = useKnobs({
    level: "body-md" as TypographyLevel,
    variant: "none" as TypographyVariant,
    color: "primary" as Color
  });

  return (
    <DocsPage
      title="Typography"
      description="All text goes through Typography so it follows the theme's type scale."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="level"
              value={knobs.level}
              options={typographyLevels}
              onChange={(level) => updateKnobs({ level })}
            />
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={typographyVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <KnobSelect
              label="color"
              value={knobs.color}
              options={playgroundColors}
              onChange={(color) => updateKnobs({ color })}
            />
          </>
        }
      >
        <Typography
          level={knobs.level}
          variant={knobs.variant}
          color={knobs.variant === "none" ? undefined : knobs.color}
        >
          The quick brown fox
        </Typography>
      </Demo>

      <Demo title="Type scale" align="start">
        <Stack direction="column" spacing={1} width="100%">
          {typographyLevels.map((level) => (
            <Stack
              key={level}
              direction="row"
              spacing={2}
              alignItems="baseline"
            >
              <Typography
                level="label-xs"
                textColor="muted"
                css={{ width: 88, flexShrink: 0 }}
              >
                {level}
              </Typography>
              <Typography level={level} css={{ minWidth: 0 }}>
                The quick brown fox
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export const AvatarPage = observer(function AvatarPage() {
  const app = useAppStore();
  const avatarUrl = app.account?.avatarUrl ?? undefined;
  const [knobs, updateKnobs] = useKnobs({
    shape: "circle" as Shape,
    size: "md" as Size,
    color: "primary" as Color,
    variant: "soft" as PaperVariant,
    image: true
  });

  return (
    <DocsPage
      title="Avatar"
      description="Shows a user's picture, or initials when there's no image."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="shape"
              value={knobs.shape}
              options={avatarShapes}
              onChange={(shape) => updateKnobs({ shape })}
            />
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={paperVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <StyleKnobs
              values={{ color: knobs.color, size: knobs.size }}
              onChange={updateKnobs}
            />
            <KnobSwitch
              label="image"
              checked={knobs.image}
              onChange={(image) => updateKnobs({ image })}
            />
          </>
        }
      >
        <Avatar
          src={knobs.image ? avatarUrl : undefined}
          alt="Avatar"
          shape={knobs.shape}
          size={knobs.size}
          color={knobs.color}
          variant={knobs.variant}
        >
          MZ
        </Avatar>
      </Demo>

      <Demo title="Sizes">
        {playgroundSizes.map((size) => (
          <Avatar key={size} src={avatarUrl} alt={size} size={size} />
        ))}
      </Demo>

      <Demo title="Shapes">
        {avatarShapes.map((shape) => (
          <Avatar key={shape} src={avatarUrl} alt={shape} shape={shape} />
        ))}
      </Demo>

      <Demo title="Initials">
        {playgroundColors.map((color) => (
          <Avatar key={color} color={color} variant="soft">
            {color.slice(0, 2).toUpperCase()}
          </Avatar>
        ))}
      </Demo>
    </DocsPage>
  );
});

export function DividerPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "solid" as DividerVariant,
    inset: "none" as DividerInset,
    text: false
  });

  return (
    <DocsPage
      title="Divider"
      description="A thin line that separates groups of content."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={dividerVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <KnobSelect
              label="inset"
              value={knobs.inset}
              options={dividerInsets}
              onChange={(inset) => updateKnobs({ inset })}
            />
            <KnobSwitch
              label="text"
              checked={knobs.text}
              onChange={(text) => updateKnobs({ text })}
            />
          </>
        }
      >
        <Stack direction="column" spacing={2} width="100%">
          <Typography level="body-sm">Above the line</Typography>
          <Divider variant={knobs.variant} inset={knobs.inset}>
            {knobs.text ? "OR" : undefined}
          </Divider>
          <Typography level="body-sm">Below the line</Typography>
        </Stack>
      </Demo>

      <Demo title="Vertical">
        <Stack direction="row" spacing={2} alignItems="center" height={32}>
          <Typography level="body-sm">Edit</Typography>
          <Divider orientation="vertical" />
          <Typography level="body-sm">Share</Typography>
          <Divider orientation="vertical" />
          <Typography level="body-sm">Delete</Typography>
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function LinkPage() {
  const [knobs, updateKnobs] = useKnobs({
    underline: "hover" as LinkUnderline,
    variant: "none" as LinkVariant,
    color: "primary" as Color,
    disabled: false
  });

  return (
    <DocsPage
      title="Link"
      description="Inline navigation inside text. Use Button for actions that don't navigate."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="underline"
              value={knobs.underline}
              options={linkUnderlines}
              onChange={(underline) => updateKnobs({ underline })}
            />
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={linkVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <KnobSelect
              label="color"
              value={knobs.color}
              options={playgroundColors}
              onChange={(color) => updateKnobs({ color })}
            />
            <KnobSwitch
              label="disabled"
              checked={knobs.disabled}
              onChange={(disabled) => updateKnobs({ disabled })}
            />
          </>
        }
      >
        <Typography level="body-md">
          Read the{" "}
          <Link
            href="#"
            underline={knobs.underline}
            variant={knobs.variant}
            color={knobs.color}
            disabled={knobs.disabled}
            onClick={(event) => event.preventDefault()}
          >
            community guidelines
          </Link>{" "}
          before posting.
        </Typography>
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <Link
            key={color}
            href="#"
            color={color}
            onClick={(event) => event.preventDefault()}
          >
            {capitalize(color)}
          </Link>
        ))}
      </Demo>
    </DocsPage>
  );
}

export function PaperPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "elevation" as PaperVariant,
    color: "neutral" as Color,
    elevation: "1"
  });

  return (
    <DocsPage
      title="Paper"
      description="The surface everything sits on. Elevation lightens or darkens it based on the theme."
    >
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={paperVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <KnobSelect
              label="color"
              value={knobs.color}
              options={playgroundColors}
              onChange={(color) => updateKnobs({ color })}
            />
            <KnobSelect
              label="elevation"
              value={knobs.elevation}
              options={paperElevations}
              onChange={(elevation) => updateKnobs({ elevation })}
            />
          </>
        }
      >
        <Paper
          variant={knobs.variant}
          color={knobs.color}
          elevation={Number(knobs.elevation)}
          width={200}
          height={120}
          borderRadius={12}
          alignItems="center"
          justifyContent="center"
        >
          <Typography level="body-sm">Paper</Typography>
        </Paper>
      </Demo>

      <Demo title="Elevation">
        {paperElevations.map((elevation) => (
          <Paper
            key={elevation}
            elevation={Number(elevation)}
            width={88}
            height={88}
            borderRadius={12}
            alignItems="center"
            justifyContent="center"
          >
            <Typography level="body-xs">{elevation}</Typography>
          </Paper>
        ))}
      </Demo>

      <Demo
        title="App wrapper"
        description="@components/Paper picks elevation when you prefer embossed and outlined otherwise, and drops elevation to 0 for soft. Left is the app wrapper, right is raw ui-web, both with no variant."
      >
        <AppPaper
          elevation={2}
          width={160}
          height={88}
          borderRadius={12}
          alignItems="center"
          justifyContent="center"
        >
          <Typography level="body-xs">App Paper</Typography>
        </AppPaper>
        <Paper
          elevation={2}
          width={160}
          height={88}
          borderRadius={12}
          alignItems="center"
          justifyContent="center"
        >
          <Typography level="body-xs">ui-web Paper</Typography>
        </Paper>
      </Demo>
    </DocsPage>
  );
}
