import { Paper } from "@components/Paper";
import {
  PreviewThemeContext,
  type PreviewThemeMode
} from "@components/Staff/playground/PlaygroundDocs";
import { PlaygroundSidebar } from "@components/Staff/playground/PlaygroundSidebar";
import { findPlaygroundEntry } from "@components/Staff/playground/playgroundRegistry";
import { StaffPanelHeader } from "@components/Staff/StaffPanelHeader";
import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import { FlaskIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/staff/playground")({
  validateSearch: (search: Record<string, unknown>) => ({
    component:
      typeof search.component === "string" ? search.component : undefined
  }),
  component: observer(StaffPlaygroundRoute)
});

function StaffPlaygroundRoute() {
  const app = useAppStore();
  const { t } = useTranslation("staff");
  const navigate = useNavigate({ from: Route.fullPath });
  const { component } = Route.useSearch();
  const embossed = app.settings?.preferEmbossed;
  const [previewTheme, setPreviewTheme] = useState<PreviewThemeMode>("app");

  const activeEntry = findPlaygroundEntry(component);
  const ActivePage = activeEntry.Page;

  const selectComponent = (id: string) =>
    navigate({ search: { component: id }, replace: true });

  return (
    <Stack
      flex={1}
      height="100%"
      overflow="hidden"
      width="100%"
      direction="column"
    >
      <StaffPanelHeader
        title={t("pages.playground")}
        icon={<FlaskIcon size={22} weight="fill" />}
      />

      <Paper
        flex={1}
        minHeight={0}
        width="100%"
        overflow="hidden"
        borderTopRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        borderBottomRightRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
        elevation={embossed ? 2 : 0}
        direction="row"
        borderTop="0 !important"
        borderLeft="0 !important"
        borderBottom="0 !important"
      >
        <PlaygroundSidebar
          activeId={activeEntry.id}
          onSelect={selectComponent}
          previewTheme={previewTheme}
          onPreviewThemeChange={setPreviewTheme}
        />

        <Stack flex={1} minWidth={0} overflow="auto" direction="column">
          <Stack
            direction="column"
            width="100%"
            maxWidth={960}
            mx="auto"
            px={{ xs: 2, sm: 4, md: 6 }}
            py={{ xs: 3, md: 5 }}
          >
            <PreviewThemeContext.Provider value={previewTheme}>
              <ActivePage key={activeEntry.id} />
            </PreviewThemeContext.Provider>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
