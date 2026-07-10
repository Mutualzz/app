import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  title: string;
  icon?: ReactNode;
  backTo?: "/staff" | "home";
  backLabel?: string;
  trailing?: ReactNode;
}

export const StaffPanelHeader = ({
  title,
  icon,
  backTo = "/staff",
  backLabel,
  trailing
}: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const embossed = app.settings?.preferEmbossed;

  const label = backLabel ?? (backTo === "home" ? "Exit" : "Staff Panel");

  const handleBack = () => {
    if (backTo === "home") {
      navigate({
        to: app.settings?.preferredMode === "feed" ? "/feed" : "/spaces"
      });
      return;
    }

    navigate({ to: backTo });
  };

  return (
    <Paper
      borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
      px={{ xs: "0.5rem", sm: 3 }}
      py={{ xs: "0.5rem", sm: 4 }}
      borderLeftWidth="0px !important"
      elevation={embossed ? 3 : 0}
      alignItems="center"
      justifyContent="space-between"
      spacing={1.25}
      borderTop="0 !important"
      borderLeft="0 !important"
      direction="row"
    >
      <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
        <Button
          variant="soft"
          size="sm"
          startDecorator={<ArrowLeftIcon size={16} />}
          onClick={handleBack}
          css={{ flexShrink: 0 }}
        >
          {label}
        </Button>
        {icon}
        <Typography
          level={{ xs: "h6", sm: "h5" }}
          fontFamily="monospace"
          css={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {title}
        </Typography>
      </Stack>
      {trailing}
    </Paper>
  );
};
