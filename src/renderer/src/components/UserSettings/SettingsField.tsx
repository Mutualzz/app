import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import {
  Option,
  Select,
  Slider,
  Stack,
  Switch,
  Typography
} from "@mutualzz/ui-web";
import { useEffect, useRef, useState, type ReactNode } from "react";

const SLIDER_COMMIT_DEBOUNCE_MS = 300;

export function SettingsSection({
  title,
  description,
  children
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={2.5} direction="column">
      {title ? (
        <Typography fontSize={20}>{title}</Typography>
      ) : null}
      <Paper
        variant="outlined"
        borderRadius={10}
        py={2.5}
        px={4}
        spacing={2.5}
        direction="column"
      >
        {description ? (
          <Typography level="body-sm" textColor="muted">
            {description}
          </Typography>
        ) : null}
        {children}
      </Paper>
    </Stack>
  );
}

export function SettingsToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
  beforeSwitch
}: {
  title: string;
  description?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  beforeSwitch?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
    >
      <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
        <Typography level="body-md" fontWeight="bold">
          {title}
        </Typography>
        {description ? (
          typeof description === "string" ? (
            <Typography level="body-sm" textColor="muted">
              {description}
            </Typography>
          ) : (
            description
          )
        ) : null}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {beforeSwitch}
        <Switch
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      </Stack>
    </Stack>
  );
}

export function SettingsSelectField({
  title,
  description,
  value,
  onChange,
  options
}: {
  title: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Stack spacing={1.25} direction="column">
      <Stack direction="column" spacing={0.5}>
        <Typography level="body-md" fontWeight="bold">
          {title}
        </Typography>
        {description ? (
          <Typography level="body-sm" textColor="muted">
            {description}
          </Typography>
        ) : null}
      </Stack>
      <Select value={value} onValueChange={(next) => {
        if (typeof next === "string") onChange(next);
      }}>
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Stack>
  );
}

export function SettingsSliderField({
  title,
  description,
  value,
  min,
  max,
  step,
  valueLabel,
  formatValueLabel,
  onChange,
  onPreviewChange,
  commitDebounceMs = SLIDER_COMMIT_DEBOUNCE_MS
}: {
  title: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueLabel?: string;
  formatValueLabel?: (value: number) => string;
  onChange: (value: number) => void;
  onPreviewChange?: (value: number) => void;
  commitDebounceMs?: number;
}) {
  const [localValue, setLocalValue] = useState(value);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
        onChange(localValue);
      }
    };
  }, [localValue, onChange]);

  const scheduleCommit = (next: number) => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = null;
      onChange(next);
    }, commitDebounceMs);
  };

  const resolvedLabel =
    formatValueLabel?.(localValue) ??
    valueLabel ??
    String(localValue);

  return (
    <Stack spacing={1.25} direction="column">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
          <Typography level="body-md" fontWeight="bold">
            {title}
          </Typography>
          {description ? (
            <Typography level="body-sm" textColor="muted">
              {description}
            </Typography>
          ) : null}
        </Stack>
        <Typography level="body-sm" textColor="muted">
          {resolvedLabel}
        </Typography>
      </Stack>
      <Slider
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(_, next) => {
          if (typeof next !== "number") return;
          setLocalValue(next);
          onPreviewChange?.(next);
          scheduleCommit(next);
        }}
        onChangeCommitted={(_, next) => {
          if (typeof next !== "number") return;
          setLocalValue(next);
          onPreviewChange?.(next);
          if (commitTimerRef.current) {
            clearTimeout(commitTimerRef.current);
            commitTimerRef.current = null;
          }
          onChange(next);
        }}
      />
    </Stack>
  );
}

export function SettingsActionRow({
  title,
  description,
  actionLabel,
  onClick,
  actionColor,
  actionDisabled
}: {
  title: string;
  description?: ReactNode;
  actionLabel: string;
  onClick: () => void;
  actionColor?: "primary" | "danger" | "neutral";
  actionDisabled?: boolean;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
    >
      <Stack direction="column" spacing={0.5} minWidth={0} flex={1}>
        <Typography level="body-md" fontWeight="bold">
          {title}
        </Typography>
        {description ? (
          typeof description === "string" ? (
            <Typography level="body-sm" textColor="muted">
              {description}
            </Typography>
          ) : (
            description
          )
        ) : null}
      </Stack>
      <Button
        variant="outlined"
        color={actionColor}
        size="sm"
        disabled={actionDisabled}
        onClick={onClick}
      >
        {actionLabel}
      </Button>
    </Stack>
  );
}
