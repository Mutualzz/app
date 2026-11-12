import {
  ThemeProvider as EmotionThemeProvider,
  type Theme
} from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import type { Color, Size, Variant } from "@mutualzz/ui-core";
import {
  baseDarkTheme,
  baseLightTheme,
  formatColor,
  styled,
  themeToCssVars
} from "@mutualzz/ui-core";
import {
  Option,
  Select,
  Slider,
  Stack,
  Switch,
  ThemeContext,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export const playgroundVariants: Variant[] = [
  "solid",
  "soft",
  "outlined",
  "plain"
];

export const playgroundColors: Color[] = [
  "primary",
  "neutral",
  "success",
  "danger",
  "warning",
  "info"
];

export const playgroundSizes: Size[] = ["sm", "md", "lg"];

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const subtleTextColor = (theme: Theme, alpha: number) =>
  formatColor(theme.typography.colors.primary, { alpha, format: "hexa" });

export function useKnobs<Values extends object>(initialValues: Values) {
  const [knobs, setKnobs] = useState<Values>(initialValues);

  const updateKnobs = (changes: Partial<Values>) =>
    setKnobs((previous) => ({ ...previous, ...changes }));

  return [knobs, updateKnobs] as const;
}

const DemoFrame = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  border: `1px solid ${subtleTextColor(theme, 0.1)}`,
  borderRadius: 12,
  overflow: "hidden"
}));

const DemoPreview = styled("div")<{
  centered: boolean;
  isolatedTheme: boolean;
}>(({ theme, centered, isolatedTheme }) => ({
  flex: "1 1 360px",
  minWidth: 0,
  minHeight: 160,
  padding: "40px 32px",
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  alignContent: "center",
  justifyContent: centered ? "center" : "flex-start",
  backgroundImage: `radial-gradient(${subtleTextColor(theme, 0.07)} 1px, transparent 1px)`,
  backgroundSize: "16px 16px",
  ...(isolatedTheme && {
    ...themeToCssVars(theme),
    backgroundColor: formatColor(theme.colors.background),
    color: formatColor(theme.typography.colors.primary)
  })
}));

export type PreviewThemeMode = "app" | "light" | "dark";

export const previewThemeModes: PreviewThemeMode[] = ["app", "light", "dark"];

export const PreviewThemeContext = createContext<PreviewThemeMode>("app");

function PreviewThemeScope({ children }: { children: ReactNode }) {
  const mode = useContext(PreviewThemeContext);
  const appThemeContext = useTheme();
  const scopedTheme = mode === "light" ? baseLightTheme : baseDarkTheme;

  const scopedContextValue = useMemo(
    () => ({
      theme: scopedTheme,
      changeTheme: appThemeContext.changeTheme,
      type: scopedTheme.type
    }),
    [scopedTheme, appThemeContext.changeTheme]
  );

  if (mode === "app") return <>{children}</>;

  return (
    <ThemeContext.Provider value={scopedContextValue}>
      <EmotionThemeProvider theme={scopedTheme}>
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}

const reducedMotionEffects = {
  skeleton:
    "Skeleton turns its shimmer and pulse off completely, so every animation option looks like none.",
  progress:
    "Indeterminate spinners turn at 2.4s per rotation instead of 1s, and indeterminate bars stop sliding and gently pulse in place."
};

export const ReducedMotionNotice = observer(function ReducedMotionNotice({
  effect
}: {
  effect: keyof typeof reducedMotionEffects;
}) {
  const app = useAppStore();
  const osReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const appReducedMotion = app.settings?.reducedMotion ?? false;

  if (!osReducedMotion && !appReducedMotion) return null;

  const source = osReducedMotion
    ? "your OS has animation effects turned off (prefers-reduced-motion: reduce)"
    : "Reduced motion is on in the app's Appearance settings";

  return (
    <Typography
      level="body-sm"
      variant="soft"
      color="warning"
      css={{ padding: "12px 16px", borderRadius: 10 }}
    >
      Reduced motion is active because {source}. {reducedMotionEffects[effect]}
    </Typography>
  );
});

const KnobsPanel = styled("div")(({ theme }) => ({
  flex: "0 1 240px",
  minWidth: 200,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  marginLeft: -1,
  marginTop: -1,
  borderLeft: `1px solid ${subtleTextColor(theme, 0.1)}`,
  borderTop: `1px solid ${subtleTextColor(theme, 0.1)}`,
  backgroundColor: subtleTextColor(theme, 0.025)
}));

const KnobLabel = styled("span")(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: theme.typography.colors.muted
}));

export function DocsPage({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="column" spacing={6} width="100%">
      <Stack direction="column" spacing={1}>
        <Typography level="h3" fontWeight={700}>
          {title}
        </Typography>
        <Typography level="body-md" textColor="muted" maxWidth={640}>
          {description}
        </Typography>
      </Stack>
      {children}
    </Stack>
  );
}

export function Demo({
  title,
  description,
  knobs,
  align = "center",
  children
}: {
  title: string;
  description?: string;
  knobs?: ReactNode;
  align?: "center" | "start";
  children: ReactNode;
}) {
  const previewThemeMode = useContext(PreviewThemeContext);

  return (
    <Stack direction="column" spacing={1.5}>
      <Stack direction="column" spacing={0.25}>
        <Typography level="title-md" fontWeight={600}>
          {title}
        </Typography>
        {description && (
          <Typography level="body-sm" textColor="muted">
            {description}
          </Typography>
        )}
      </Stack>
      <DemoFrame>
        <PreviewThemeScope>
          <DemoPreview
            centered={align === "center"}
            isolatedTheme={previewThemeMode !== "app"}
          >
            {children}
          </DemoPreview>
        </PreviewThemeScope>
        {knobs && <KnobsPanel>{knobs}</KnobsPanel>}
      </DemoFrame>
    </Stack>
  );
}

export function KnobSelect<Value extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: Value;
  options: readonly Value[];
  onChange: (value: Value) => void;
}) {
  return (
    <Stack direction="column" spacing={0.5}>
      <KnobLabel>{label}</KnobLabel>
      <Select
        size="sm"
        variant="outlined"
        color="neutral"
        aria-label={label}
        value={value}
        onValueChange={(selected) => onChange(selected as Value)}
      >
        {options.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Select>
    </Stack>
  );
}

export function KnobSwitch({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <KnobLabel>{label}</KnobLabel>
      <Switch
        size="sm"
        aria-label={label}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </Stack>
  );
}

export function KnobSlider({
  label,
  value,
  min = 0,
  max = 100,
  onChange
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Stack direction="column" spacing={0.5}>
      <KnobLabel>
        {label}: {value}
      </KnobLabel>
      <Slider
        size="sm"
        value={value}
        min={min}
        max={max}
        getAriaLabel={() => label}
        onChange={(_event, next) =>
          onChange(Array.isArray(next) ? next[0] : next)
        }
      />
    </Stack>
  );
}

export function StyleKnobs({
  values,
  onChange
}: {
  values: { variant?: Variant; color?: Color; size?: Size };
  onChange: (changes: {
    variant?: Variant;
    color?: Color;
    size?: Size;
  }) => void;
}) {
  return (
    <>
      {values.variant !== undefined && (
        <KnobSelect
          label="variant"
          value={values.variant}
          options={playgroundVariants}
          onChange={(variant) => onChange({ variant })}
        />
      )}
      {values.color !== undefined && (
        <KnobSelect
          label="color"
          value={values.color}
          options={playgroundColors}
          onChange={(color) => onChange({ color })}
        />
      )}
      {values.size !== undefined && (
        <KnobSelect
          label="size"
          value={values.size}
          options={playgroundSizes}
          onChange={(size) => onChange({ size })}
        />
      )}
    </>
  );
}
