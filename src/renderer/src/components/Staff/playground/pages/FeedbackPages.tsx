import type { Color, Size, Variant } from "@mutualzz/ui-core";
import {
  CircularProgress,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  type LinearProgressAnimation,
  type SkeletonAnimation,
  type SkeletonVariant
} from "@mutualzz/ui-web";
import {
  Demo,
  DocsPage,
  KnobSelect,
  KnobSlider,
  KnobSwitch,
  playgroundColors,
  ReducedMotionNotice,
  StyleKnobs,
  useKnobs
} from "../PlaygroundDocs";

const linearAnimations: LinearProgressAnimation[] = [
  "slide",
  "wave",
  "bounce",
  "scale-in-out"
];
const skeletonVariants: SkeletonVariant[] = [
  "text",
  "circular",
  "rectangular",
  "rounded"
];
const skeletonAnimations: SkeletonAnimation[] = ["shimmer", "pulse", "none"];

export function CircularProgressPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "soft" as Variant,
    color: "primary" as Color,
    size: "md" as Size,
    determinate: false,
    value: 60
  });

  return (
    <DocsPage
      title="CircularProgress"
      description="Spinner for work that's running. Make it determinate when you know how far along it is."
    >
      <ReducedMotionNotice effect="progress" />
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSwitch
              label="determinate"
              checked={knobs.determinate}
              onChange={(determinate) => updateKnobs({ determinate })}
            />
            <KnobSlider
              label="value"
              value={knobs.value}
              onChange={(value) => updateKnobs({ value })}
            />
          </>
        }
      >
        <CircularProgress
          aria-label="Loading"
          variant={knobs.variant}
          color={knobs.color}
          size={knobs.size}
          determinate={knobs.determinate}
          value={knobs.value}
        />
      </Demo>

      <Demo title="Colors">
        {playgroundColors.map((color) => (
          <CircularProgress key={color} aria-label={color} color={color} />
        ))}
      </Demo>

      <Demo title="Determinate">
        {[25, 50, 75, 100].map((value) => (
          <CircularProgress
            key={value}
            aria-label={`${value}%`}
            determinate
            value={value}
          >
            <Typography level="body-xs">{value}%</Typography>
          </CircularProgress>
        ))}
      </Demo>
    </DocsPage>
  );
}

export function LinearProgressPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "soft" as Variant,
    color: "primary" as Color,
    animation: "slide" as LinearProgressAnimation,
    determinate: false,
    value: 60
  });

  return (
    <DocsPage
      title="LinearProgress"
      description="Bar for progress across a page or inside a card."
    >
      <ReducedMotionNotice effect="progress" />
      <Demo
        title="Playground"
        knobs={
          <>
            <StyleKnobs values={knobs} onChange={updateKnobs} />
            <KnobSelect
              label="animation"
              value={knobs.animation}
              options={linearAnimations}
              onChange={(animation) => updateKnobs({ animation })}
            />
            <KnobSwitch
              label="determinate"
              checked={knobs.determinate}
              onChange={(determinate) => updateKnobs({ determinate })}
            />
            <KnobSlider
              label="value"
              value={knobs.value}
              onChange={(value) => updateKnobs({ value })}
            />
          </>
        }
      >
        <LinearProgress
          aria-label="Loading"
          length={280}
          variant={knobs.variant}
          color={knobs.color}
          animation={knobs.animation}
          determinate={knobs.determinate}
          value={knobs.value}
        />
      </Demo>

      <Demo title="Animations" align="start">
        <Stack direction="column" spacing={2} width="100%">
          {linearAnimations.map((animation) => (
            <Stack key={animation} direction="column" spacing={0.5}>
              <Typography level="label-xs" textColor="muted">
                {animation}
              </Typography>
              <LinearProgress
                aria-label={animation}
                length="100%"
                animation={animation}
              />
            </Stack>
          ))}
        </Stack>
      </Demo>
    </DocsPage>
  );
}

export function SkeletonPage() {
  const [knobs, updateKnobs] = useKnobs({
    variant: "rounded" as SkeletonVariant,
    animation: "shimmer" as SkeletonAnimation,
    loading: true
  });

  return (
    <DocsPage
      title="Skeleton"
      description="Placeholder shaped like the content that's loading. With children, loading=false shows the real content."
    >
      <ReducedMotionNotice effect="skeleton" />
      <Demo
        title="Playground"
        knobs={
          <>
            <KnobSelect
              label="variant"
              value={knobs.variant}
              options={skeletonVariants}
              onChange={(variant) => updateKnobs({ variant })}
            />
            <KnobSelect
              label="animation"
              value={knobs.animation}
              options={skeletonAnimations}
              onChange={(animation) => updateKnobs({ animation })}
            />
            <KnobSwitch
              label="loading"
              checked={knobs.loading}
              onChange={(loading) => updateKnobs({ loading })}
            />
          </>
        }
      >
        <Skeleton
          variant={knobs.variant}
          animation={knobs.animation}
          loading={knobs.loading}
        >
          <Typography level="body-md">Content has loaded.</Typography>
        </Skeleton>
      </Demo>

      <Demo
        title="Composed"
        description="A placeholder for a profile row."
        align="start"
      >
        <Stack direction="row" spacing={1.5} alignItems="center" width={320}>
          <Skeleton variant="circular" size={48} />
          <Stack direction="column" spacing={0.75} flex={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" lines={2} />
          </Stack>
        </Stack>
      </Demo>
    </DocsPage>
  );
}
