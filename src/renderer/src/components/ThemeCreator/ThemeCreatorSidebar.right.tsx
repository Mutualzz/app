import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { APITheme, HttpException } from "@mutualzz/types";
import { baseDarkTheme, baseLightTheme } from "@mutualzz/ui-core";
import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Divider,
  Option,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { applyAdaptiveThemeValues } from "@utils/adaptation";
import { sortThemes } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import Snowflake from "@utils/Snowflake";
import { usePrefersDark } from "@hooks/usePrefersDark";
import type {
  ThemeCreatorFilter,
  ThemeCreatorLoadedType
} from "@stores/ThemeCreator.store";

const availableFilters = [
  "light",
  "dark",
  "adaptive",
  "normal",
  "gradient"
] as const;

export const ThemeCreatorSidebarRight = observer(() => {
  const { t } = useTranslation("settings");
  const app = useAppStore();
  const prefersDark = usePrefersDark();
  const { theme: currentTheme, changeTheme } = useTheme();
  const {
    setCurrentCategory,
    setCurrentPage,
    loadedType,
    setLoadedType,
    resetValues,
    setErrors,
    values,
    loadValues,
    filters,
    resetFilters,
    addFilter,
    removeFilter,
    inPreview,
    startPreview,
    stopPreview,
    userInteracted,
    nameEmpty
  } = app.themeCreator;
  const { closeAllModals } = useModal();

  const themes = app.themeCreator.filter(
    loadedType === "custom"
      ? app.themes.all.filter((theme) =>
          app.themeCreator.spaceId
            ? theme.spaceId === app.themeCreator.spaceId
            : !!theme.authorId && !theme.spaceId
        )
      : loadedType === "draft"
        ? Array.from(app.drafts.themes.values()).map(
            (draft) => new Theme(app, draft)
          )
        : app.themes.all.filter((theme) => !theme.author && !theme.spaceId)
  );

  const ownedByUser =
    !!values.id &&
    (app.account?.id === values.authorId ||
      (!!app.themeCreator.spaceId &&
        values.spaceId === app.themeCreator.spaceId));

  const syncBackground = async (themeId: string) => {
    const spaceId = app.themeCreator.spaceId;
    const base = spaceId
      ? `/spaces/${spaceId}/themes/${themeId}/background`
      : `@me/themes/${themeId}/background`;

    if (app.themeCreator.pendingBackgroundFile) {
      const formData = new FormData();
      formData.append(
        "backgroundImage",
        app.themeCreator.pendingBackgroundFile
      );
      const updated = await app.rest.putFormData<APITheme>(base, formData);
      app.themes.add(updated);
      app.themeCreator.clearPendingBackground();
      return updated;
    }

    if (app.themeCreator.clearBackgroundImage) {
      const updated = await app.rest.delete<APITheme>(base);
      app.themes.add(updated);
      app.themeCreator.clearPendingBackground();
      return updated;
    }

    return null;
  };

  const { mutate: putTheme } = useMutation({
    mutationKey: ["put-theme", values.name, app.themeCreator.spaceId],
    mutationFn: async () => {
      const base = values.adaptive
        ? applyAdaptiveThemeValues(values)
        : values;
      const dataToPut = {
        ...Theme.serialize(base),
        id: Snowflake.generate()
      };

      const spaceId = app.themeCreator.spaceId;
      let created: APITheme;
      if (spaceId) {
        created = await app.rest.post<APITheme, APITheme>(
          `/spaces/${spaceId}/themes`,
          dataToPut
        );
      } else {
        created = await app.rest.post<APITheme, APITheme>(
          "@me/themes",
          dataToPut
        );
      }

      const withBackground = await syncBackground(created.id);
      return withBackground ?? created;
    },
    onSuccess: async (data) => {
      const newTheme = app.themes.add(data);
      setErrors({});

      const spaceId = app.themeCreator.spaceId;
      if (spaceId) {
        const space = app.spaces.get(spaceId);
        const formData = new FormData();
        formData.append("themeId", newTheme.id);
        await app.rest.patchFormData(`/spaces/${spaceId}`, formData);
        if (space) {
          space.themeId = newTheme.id;
          space.theme = Theme.serialize(newTheme);
        }
      } else {
        changeTheme(Theme.toEmotion(newTheme));
        app.settings?.setCurrentTheme(newTheme.id);
        app.themes.setCurrentTheme(newTheme.id);
      }

      setLoadedType("custom");
      loadValues(data);
    },
    onError: (error: HttpException) => {
      const next: Record<string, string> = {};
      error.errors.forEach((e) => {
        next[e.path] = e.message;
      });
      setErrors(next);
    }
  });

  const { mutate: patchTheme } = useMutation({
    mutationKey: ["patch-theme", values.id, app.themeCreator.spaceId],
    mutationFn: async () => {
      const dataToPatch = Theme.serialize(
        values.adaptive ? applyAdaptiveThemeValues(values) : values
      );

      const spaceId = app.themeCreator.spaceId;
      let updated: APITheme;
      if (spaceId) {
        updated = await app.rest.patch<APITheme, APITheme>(
          `/spaces/${spaceId}/themes/${values.id}`,
          dataToPatch
        );
      } else {
        updated = await app.rest.patch<APITheme, APITheme>(
          `@me/themes/${values.id}`,
          dataToPatch
        );
      }

      const withBackground = await syncBackground(updated.id);
      return withBackground ?? updated;
    },
    onSuccess: (data) => {
      app.themes.update(data);

      const spaceId = app.themeCreator.spaceId;
      if (spaceId) {
        const space = app.spaces.get(spaceId);
        if (space?.themeId === data.id) {
          space.theme = data;
        }
      } else if (app.settings?.currentTheme === data.id) {
        changeTheme(Theme.toEmotion(data));
      }

      setErrors({});
      loadValues(data);
    },
    onError: (error: HttpException) => {
      const next: Record<string, string> = {};
      error.errors?.forEach((e) => {
        next[e.path] = e.message;
      });
      setErrors(next);
    }
  });

  const { mutate: deleteTheme } = useMutation({
    mutationKey: ["theme-delete", app.themeCreator.spaceId],
    mutationFn: async () => {
      if (!values.id) throw new Error("Theme ID is required");

      const spaceId = app.themeCreator.spaceId;
      if (spaceId) {
        return app.rest.delete<{ id: string }>(
          `/spaces/${spaceId}/themes/${values.id}`
        );
      }

      return app.rest.delete<{ id: string }>(`@me/themes/${values.id}`);
    },
    onSuccess: ({ id: themeId }: { id: string }) => {
      const deletingCurrent = currentTheme.id === themeId;
      const spaceId = app.themeCreator.spaceId;

      app.themes.remove(themeId);

      if (spaceId) {
        const space = app.spaces.get(spaceId);
        if (space?.themeId === themeId) {
          space.themeId = null;
          space.theme = null;
        }
        app.themeCreator.resetToBaseTheme();
        return;
      }

      const remainingCustomThemes = app.themes.all.filter(
        (theme) => theme.authorId && !theme.spaceId
      );

      if (remainingCustomThemes.length === 0) {
        app.themeCreator.resetToBaseTheme();
        const fallback = prefersDark ? baseDarkTheme : baseLightTheme;
        changeTheme(Theme.toEmotion(fallback));
      } else if (deletingCurrent) {
        const fallback = prefersDark ? baseDarkTheme : baseLightTheme;
        app.settings?.setCurrentTheme(fallback.id);
        app.themes.setCurrentTheme(fallback.id);
        changeTheme(Theme.toEmotion(fallback));
      }

      app.themeCreator.resetToBaseTheme();
    }
  });

  const handleChange = (value: any) => {
    const theme = themes.find((theme) => theme.id === value);
    if (!theme) return;

    loadValues(Theme.serialize(theme));
  };

  const toggleFilter = (filter: ThemeCreatorFilter) => {
    if (filters.includes(filter)) removeFilter(filter);
    else addFilter(filter);
  };

  const resetThemeCreator = () => {
    resetValues();
    resetFilters();
    setLoadedType("default");
    setCurrentPage("details");
    setCurrentCategory("general");
  };

  return (
    <Paper
      direction="column"
      width="15em"
      height="100%"
      elevation={app.settings?.preferEmbossed ? 4 : 0}
      borderTop="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
      p={{ xs: "0.75rem", sm: "1rem" }}
      justifyContent="space-between"
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="column">
          <ButtonGroup spacing={5}>
            <Button
              expand
              color="danger"
              onClick={() => resetThemeCreator()}
              disabled={!userInteracted || inPreview}
            >
              {t("themeCreator.actions.reset")}
            </Button>
            <Button
              expand
              onClick={() => {
                if (inPreview) {
                  stopPreview(changeTheme);
                  return;
                }

                startPreview(changeTheme, currentTheme, app.account?.id);

                // Close modals after a tick to allow the theme and ref to update in ThemeCreatorModal
                setTimeout(() => closeAllModals(), 0);
              }}
              disabled={
                loadedType === "default" || ownedByUser || !userInteracted
              }
            >
              {inPreview
                ? t("themeCreator.preview.stopShort")
                : t("themeCreator.preview.preview")}
            </Button>
          </ButtonGroup>
        </Stack>
        <Divider
          css={{
            opacity: 0.25
          }}
          lineColor="muted"
        />
        <Stack direction="column" spacing={2.5}>
          <Typography textAlign="center">
            {t("themeCreator.manage.loadThemes")}
          </Typography>
          <RadioGroup
            value={loadedType}
            onChange={(_, value) =>
              setLoadedType(value as ThemeCreatorLoadedType)
            }
            spacing={10}
            orientation="horizontal"
            size="sm"
          >
            <Radio
              value="default"
              label={t("themeCreator.loadedTypes.default")}
            />
            <Radio value="draft" label={t("themeCreator.loadedTypes.draft")} />
            <Radio
              value="custom"
              label={t("themeCreator.loadedTypes.custom")}
            />
          </RadioGroup>
        </Stack>
        <Stack direction="column" spacing={2.5}>
          <Select
            onValueChange={handleChange}
            color="primary"
            placeholder={t("themeCreator.manage.pickTheme")}
            disabled={themes.length === 0}
            value={values.id}
          >
            {sortThemes(themes).map((theme) => (
              <Option key={theme.id} value={theme.id} variant="soft">
                {theme.name}
              </Option>
            ))}
          </Select>
          {loadedType === "draft" && app.drafts.existsThemeDraft(values) && (
            <Button
              color="danger"
              onClick={() => app.drafts.deleteThemeDraft(values)}
            >
              {t("themeCreator.actions.deleteDraft")}
            </Button>
          )}
          {loadedType === "custom" && values.id && values.id.trim() !== "" && (
            <Button color="danger" onClick={() => deleteTheme()}>
              {t("themeCreator.actions.deleteTheme")}
            </Button>
          )}
        </Stack>
        <Divider
          css={{
            opacity: 0.25
          }}
          lineColor="muted"
        />
        <Stack direction="column">
          <Typography textAlign="center">
            {t("themeCreator.manage.filters")}
          </Typography>
          <CheckboxGroup>
            <Checkbox
              key="theme-creator-filter-all"
              label={t("themeCreator.manage.all")}
              checked={filters.length === 0}
              onChange={() => resetFilters()}
            />
            {availableFilters.map((filter) => (
              <Checkbox
                key={`theme-creator-filter-${filter}`}
                label={t(`themeCreator.filters.${filter}`)}
                checked={filters.includes(filter)}
                onChange={() => toggleFilter(filter)}
              />
            ))}
          </CheckboxGroup>
        </Stack>
      </Stack>

      <Stack direction="column">
        <ButtonGroup
          fullWidth
          spacing={5}
          disabled={!userInteracted || nameEmpty}
        >
          <Button
            color="warning"
            disabled={ownedByUser}
            onClick={() =>
              app.drafts.existsThemeDraft(values)
                ? app.drafts.updateThemeDraft(values)
                : app.drafts.saveThemeDraft(values)
            }
          >
            {app.drafts.existsThemeDraft(values)
              ? t("themeCreator.actions.updateDraft")
              : t("themeCreator.actions.saveDraft")}
          </Button>
          <Button
            color="success"
            onClick={() => (ownedByUser ? patchTheme() : putTheme())}
          >
            {ownedByUser
              ? t("themeCreator.actions.update")
              : t("themeCreator.actions.publish")}
          </Button>
        </ButtonGroup>
      </Stack>
    </Paper>
  );
});
