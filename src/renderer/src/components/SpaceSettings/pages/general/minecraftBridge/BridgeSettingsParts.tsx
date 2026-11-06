import { Paper } from "@components/Paper";
import styled from "@emotion/styled";
import { Stack, Typography } from "@mutualzz/ui-web";
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { Button } from "@renderer/components/Button";
import { isElectron } from "@utils/index";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

interface TabProps extends PropsWithChildren {
  selected: boolean;
}

export const Tab = styled("div")<TabProps>(({ theme, selected }) => ({
  ...(selected && {
    borderBottom: `1px solid ${theme.typography.colors.accent}`,
    borderRadius: 6
  }),
  userSelect: "none",
  cursor: "pointer",
  padding: "5px 10px",
  ...(!selected && {
    "&:hover": {
      borderBottom: `1px solid ${theme.typography.colors.muted}`,
      borderRadius: 6
    }
  })
}));

export const ChecklistItem = ({
  done,
  label,
  onPress
}: {
  done: boolean;
  label: string;
  onPress?: () => void;
}) => (
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    css={onPress && !done ? { cursor: "pointer" } : undefined}
    onClick={done ? undefined : onPress}
  >
    {done ? (
      <CheckCircleIcon weight="fill" size={18} />
    ) : (
      <CircleIcon size={18} />
    )}
    <Typography
      level="body-sm"
      textColor={done ? undefined : "muted"}
      fontWeight={done ? "bold" : undefined}
    >
      {label}
    </Typography>
  </Stack>
);

export const BridgeSection = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <Paper
    variant="outlined"
    borderRadius={10}
    py={2.5}
    px={4}
    spacing={2}
    direction="column"
  >
    <Stack direction="column" spacing={0.5}>
      <Typography level="body-md" fontWeight="bold">
        {title}
      </Typography>
      {description && (
        <Typography level="body-xs" textColor="muted">
          {description}
        </Typography>
      )}
    </Stack>
    {children}
  </Paper>
);

export const BridgeCard = ({
  spacing = 2,
  children
}: {
  spacing?: number;
  children: ReactNode;
}) => (
  <Paper
    variant="outlined"
    borderRadius={10}
    py={2.5}
    px={4}
    spacing={spacing}
    direction="column"
  >
    {children}
  </Paper>
);

export const NoticeCard = ({ children }: { children: ReactNode }) => (
  <Paper
    variant="outlined"
    borderRadius={10}
    py={3}
    px={4}
    spacing={2}
    direction="column"
  >
    {children}
  </Paper>
);

export const BridgeTabGate = ({
  ready,
  isOwner,
  onGoToSetup,
  children
}: {
  ready: boolean;
  isOwner: boolean;
  onGoToSetup: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation("settings");

  if (!ready) {
    return (
      <NoticeCard>
        <Typography level="body-sm" textColor="muted">
          {t("minecraftBridge.selectBridgeFirst")}
        </Typography>
        <Stack direction="row">
          <Button size="sm" onClick={onGoToSetup}>
            {t("minecraftBridge.goToSetup")}
          </Button>
        </Stack>
      </NoticeCard>
    );
  }

  if (!isOwner) {
    return (
      <NoticeCard>
        <Typography level="body-sm" textColor="muted">
          {t("minecraftBridge.adminOnlySettings")}
        </Typography>
      </NoticeCard>
    );
  }

  return <>{children}</>;
};

export const useCopyFeedback = <TKind extends string>() => {
  const [copied, setCopied] = useState<TKind | null>(null);

  const copyText = async (text: string, kind: TKind) => {
    if (isElectron) await window.api.clipboard.write(text);
    else await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  return { copied, copyText };
};
