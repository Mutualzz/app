import { SpaceProfileEditor } from "@components/Space/SpaceProfileEditor";
import { useAppStore } from "@hooks/useStores";
import { Option, Paper, Select, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const SpaceProfilesSettings = observer(() => {
  const { t } = useTranslation("space");
  const app = useAppStore();
  const spaces = app.spaces.all;
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(
    spaces[0]?.id ?? null
  );
  const selectedSpace =
    spaces.find((space) => space.id === selectedSpaceId) ?? null;

  return (
    <Paper
      variant="soft"
      borderRadius={12}
      p={2}
      direction="column"
      spacing={1.75}
    >
      <Stack direction="column" spacing={0.5}>
        <Typography level="title-sm" fontWeight={600}>
          {t("spaceProfile.settingsTitle")}
        </Typography>
        <Typography level="body-sm" css={{ opacity: 0.75 }}>
          {t("spaceProfile.description")}
        </Typography>
      </Stack>

      {spaces.length === 0 ? (
        <Typography level="body-sm" textColor="muted">
          {t("spaceProfile.noSpaces")}
        </Typography>
      ) : (
        <>
          <Select
            value={selectedSpaceId ?? undefined}
            placeholder={t("spaceProfile.pickSpace")}
            onValueChange={(value) => {
              if (typeof value === "string") setSelectedSpaceId(value);
            }}
          >
            {spaces.map((space) => (
              <Option key={space.id} value={space.id}>
                {space.name}
              </Option>
            ))}
          </Select>
          {selectedSpace && (
            <SpaceProfileEditor key={selectedSpace.id} space={selectedSpace} />
          )}
        </>
      )}
    </Paper>
  );
});
