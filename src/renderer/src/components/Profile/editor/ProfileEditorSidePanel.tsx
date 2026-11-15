import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { XIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  description?: string;
  onClose?: () => void;
  children: ReactNode;
}

export const PROFILE_EDITOR_SIDE_PANEL_WIDTH = 300;

export const ProfileEditorSidePanel = observer(
  ({ title, description, onClose, children }: Props) => {
    const { t } = useTranslation("common");
    const app = useAppStore();
    const embossed = app.settings?.preferEmbossed;

    return (
      <Paper
        width={PROFILE_EDITOR_SIDE_PANEL_WIDTH}
        minWidth={PROFILE_EDITOR_SIDE_PANEL_WIDTH}
        flexShrink={0}
        height="100%"
        direction="column"
        spacing={1.5}
        p={1.5}
        borderRadius={12}
        variant="elevation"
        elevation={embossed ? 5 : 1}
        css={{ overflowY: "auto" }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Stack direction="column" spacing={0.5} flex={1} minWidth={0}>
            <Typography level="title-sm" fontWeight={700}>
              {title}
            </Typography>
            {description && (
              <Typography
                level="body-xs"
                textColor="muted"
                css={{ lineHeight: 1.4 }}
              >
                {description}
              </Typography>
            )}
          </Stack>
          {onClose && (
            <IconButton
              size="sm"
              variant="plain"
              title={t("close")}
              onClick={onClose}
            >
              <XIcon />
            </IconButton>
          )}
        </Stack>
        {children}
      </Paper>
    );
  }
);
