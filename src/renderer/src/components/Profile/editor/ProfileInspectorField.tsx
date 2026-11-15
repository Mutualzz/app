import { IconButton } from "@components/IconButton";
import { Tooltip } from "@components/Tooltip";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ArrowCounterClockwiseIcon, InfoIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  label: ReactNode;
  value?: ReactNode;
  hint?: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  children?: ReactNode;
}

export const ProfileInspectorFieldLabel = ({
  children
}: {
  children: ReactNode;
}) => (
  <Typography level="body-xs" fontWeight={700} css={{ opacity: 0.8 }}>
    {children}
  </Typography>
);

export const ProfileInspectorField = ({
  label,
  value,
  hint,
  onReset,
  resetLabel,
  children
}: Props) => {
  const { t } = useTranslation("settings");
  const resolvedResetLabel = resetLabel ?? t("profile.inspector.fields.reset");

  return (
    <Stack direction="column" spacing={0.75}>
      <Stack direction="row" alignItems="center" spacing={0.5} minHeight={24}>
        <ProfileInspectorFieldLabel>{label}</ProfileInspectorFieldLabel>
        {hint && (
          <Tooltip content={hint} placement="top">
            <span
              css={{ display: "inline-flex", opacity: 0.5, cursor: "help" }}
            >
              <InfoIcon size={13} />
            </span>
          </Tooltip>
        )}
        <span css={{ flex: 1 }} />
        {value != null && (
          <Typography
            level="body-xs"
            textColor="muted"
            css={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Typography>
        )}
        {onReset && (
          <Tooltip content={resolvedResetLabel} placement="top">
            <IconButton
              size="sm"
              variant="plain"
              aria-label={resolvedResetLabel}
              onClick={onReset}
            >
              <ArrowCounterClockwiseIcon size={14} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      {children}
    </Stack>
  );
};

export const ProfileInspectorGroup = ({
  title,
  children
}: {
  title: ReactNode;
  children: ReactNode;
}) => (
  <Stack direction="column" spacing={1.5}>
    <Typography
      level="body-xs"
      fontWeight={700}
      textColor="muted"
      css={{
        fontSize: 10.5,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}
    >
      {title}
    </Typography>
    <Stack direction="column" spacing={2}>
      {children}
    </Stack>
  </Stack>
);
