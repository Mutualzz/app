import { Button } from "@components/Button";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { ArrowLeftIcon, XIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { navigateToPreferredMode } from "@utils/index";
import type { ReactNode } from "react";

interface Props {
  title: string;
  icon?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  showExit?: boolean;
}

export function SupportHeader({
  title,
  icon,
  onBack,
  backLabel = "Back",
  showExit = true
}: Props) {
  const app = useAppStore();
  const navigate = useNavigate();
  const embossed = app.settings?.preferEmbossed;

  const handleExit = () => {
    if (app.token) {
      navigateToPreferredMode(app, navigate);
      return;
    }

    navigate({ to: "/login" });
  };

  return (
    <Paper
      px={{ xs: "0.75rem", sm: 3 }}
      py={{ xs: "0.75rem", sm: 2 }}
      elevation={embossed ? 3 : 0}
      borderTop="0 !important"
      borderLeft="0 !important"
      borderRight="0 !important"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.25}
      width="100%"
      flexShrink={0}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
        {onBack && (
          <Button
            variant="soft"
            size="sm"
            startDecorator={<ArrowLeftIcon size={16} />}
            onClick={onBack}
            css={{ flexShrink: 0 }}
          >
            {backLabel}
          </Button>
        )}
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

      {showExit && (
        <Button
          variant="soft"
          size="sm"
          startDecorator={<XIcon size={16} />}
          onClick={handleExit}
          css={{ flexShrink: 0 }}
        >
          Close
        </Button>
      )}
    </Paper>
  );
}
