import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { type ThemeCreatorFilter, type ThemeCreatorLoadedType, useThemeCreator, } from "@contexts/ThemeCreator.context";
import { useAppStore } from "@hooks/useStores";
import type { APITheme, HttpException } from "@mutualzz/types";
import { baseDarkTheme, baseLightTheme, type MzTheme } from "@mutualzz/ui-core";
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
    useTheme,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { useMutation } from "@tanstack/react-query";
import { adaptColors } from "@utils/adaptation";
import { sortThemes } from "@utils/index";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import Snowflake from "@utils/Snowflake.ts";
import { usePrefersDark } from "@hooks/usePrefersDark.ts";

const availableFilters = [
    "light",
    "dark",
    "adaptive",
    "normal",
    "gradient",
] as const;

export const ThemeCreatorSidebarRight = observer(() => {
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
        filter: themeFilter,
        filters,
        resetFilters,
        addFilter,
        removeFilter,
        inPreview,
        startPreview,
        stopPreview,
        userInteracted,
        nameEmpty,
    } = useThemeCreator();
    const { closeAllModals } = useModal();

    const themes = useMemo(() => {
        return themeFilter(
            loadedType === "custom"
                ? app.themes.all.filter((theme) => theme.authorId)
                : loadedType === "draft"
                  ? app.drafts.themes.map((draft) => new Theme(app, draft))
                  : app.themes.all.filter((theme) => !theme.author),
        );
    }, [app.drafts.themes, loadedType, themeFilter, app]);

    const ownedByUser = useMemo(
        () => !!values.id && app.account?.id === values.authorId,
        [values.id, values.authorId, app.account?.id],
    );

    const { mutate: themePut } = useMutation({
        mutationKey: ["theme-put"],
        mutationFn: async () => {
            let dataToPut = {
                ...values,
                id: Snowflake.generate(),
            };
            if (values.adaptive) {
                dataToPut = {
                    ...values,
                    ...(adaptColors({
                        baseColor: values.colors.background,
                        primaryColor: values.colors.primary,
                        primaryText: values.typography.colors.primary,
                    }) as Partial<MzTheme>),
                };
            }

            return app.rest.post<APITheme, APITheme>("@me/themes", dataToPut);
        },
        onSuccess: (data) => {
            const newTheme = app.themes.add(data);
            changeTheme(Theme.toEmotion(newTheme));
            resetValues();
        },
        onError: (error: HttpException) => {
            const next: Record<string, string> = {};
            error.errors.forEach((e) => {
                next[e.path] = e.message;
            });
            setErrors(next);
        },
    });

    const { mutate: themePatch } = useMutation({
        mutationKey: ["themePatch"],
        mutationFn: async () => {
            let dataToPatch = { ...values };
            if (values.adaptive) {
                dataToPatch = {
                    ...values,
                    ...(adaptColors({
                        baseColor: values.colors.background,
                        primaryColor: values.colors.primary,
                        primaryText: values.typography.colors.primary,
                    }) as Partial<MzTheme>),
                };
            }

            return app.rest.patch<APITheme, APITheme>(
                `@me/themes/${values.id}`,
                dataToPatch,
            );
        },
        onSuccess: (data) => {
            app.themes.update(data);

            // If the current theme is the one updated, change it
            if (app.settings?.currentTheme === data.id)
                changeTheme(Theme.toEmotion(data));

            setErrors({});
        },
        onError: (error: HttpException) => {
            const next: Record<string, string> = {};
            error.errors?.forEach((e) => {
                next[e.path] = e.message;
            });
            setErrors(next);
        },
    });

    const { mutate: themeDelete } = useMutation({
        mutationKey: ["theme-delete"],
        mutationFn: async () => {
            if (!values.id) return;

            return app.rest.delete<any>(`@me/themes/${values.id}`);
        },
        onSuccess: ({ id: themeId }: { id: string }) => {
            const deletingCurrent = currentTheme.id === themeId;

            // Remove theme from store first
            app.themes.remove(themeId);

            if (deletingCurrent) {
                const fallback = prefersDark ? baseDarkTheme : baseLightTheme;

                app.settings?.setCurrentTheme(fallback.id);
                app.themes.setCurrentTheme(fallback.id);

                changeTheme(Theme.toEmotion(fallback));
            }
        },
    });

    const handleChange = (value: any) => {
        const theme = themes.find((theme) => theme.id === value);
        if (!theme) return;

        loadValues(Theme.toEmotion(theme));
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
            elevation={app.preferEmbossed ? 4 : 0}
            borderTop="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
            p={{ xs: "0.75rem", sm: "1rem" }}
            justifyContent="space-between"
        >
            <Stack direction="column" spacing={2}>
                <Stack direction="column">
                    <ButtonGroup fullWidth spacing={5}>
                        <Button
                            color="danger"
                            onClick={() => resetThemeCreator()}
                            disabled={!userInteracted || inPreview}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={() => {
                                if (inPreview) {
                                    stopPreview();
                                    return;
                                }

                                startPreview();

                                // Close modals after a tick to allow the theme and ref to update in ThemeCreatorModal
                                setTimeout(() => closeAllModals(), 50);
                            }}
                            disabled={
                                loadedType === "default" ||
                                ownedByUser ||
                                !userInteracted
                            }
                        >
                            {inPreview ? "Stop Preview" : "Preview"}
                        </Button>
                    </ButtonGroup>
                </Stack>
                <Divider
                    css={{
                        opacity: 0.25,
                    }}
                    lineColor="muted"
                />
                <Stack direction="column" spacing={2.5}>
                    <Typography textAlign="center">Load Themes</Typography>
                    <RadioGroup
                        value={loadedType}
                        onChange={(_, value) =>
                            setLoadedType(value as ThemeCreatorLoadedType)
                        }
                        spacing={10}
                        orientation="horizontal"
                        size="sm"
                    >
                        <Radio value="default" label="Default" />
                        <Radio value="draft" label="Draft" />
                        <Radio value="custom" label="Custom" />
                    </RadioGroup>
                </Stack>
                <Stack direction="column" spacing={2.5}>
                    <Select
                        onValueChange={handleChange}
                        color="primary"
                        placeholder="Pick a theme"
                        disabled={themes.length === 0}
                        value={values.id || values.name || undefined}
                    >
                        {sortThemes(themes).map((theme) => (
                            <Option
                                key={
                                    theme.id ||
                                    `${theme.name}-${theme.authorId}`
                                }
                                value={theme.id || theme.name}
                                variant="soft"
                            >
                                {theme.name}
                            </Option>
                        ))}
                    </Select>
                    {loadedType === "custom" &&
                        values.id &&
                        values.id.trim() !== "" && (
                            <Button
                                color="danger"
                                onClick={() => themeDelete()}
                            >
                                Delete Theme
                            </Button>
                        )}
                </Stack>
                <Divider
                    css={{
                        opacity: 0.25,
                    }}
                    lineColor="muted"
                />
                <Stack direction="column">
                    <Typography textAlign="center">Filters</Typography>
                    <CheckboxGroup>
                        <Checkbox
                            key="theme-creator-filter-all"
                            label="All"
                            checked={filters.length === 0}
                            onChange={() => resetFilters()}
                        />
                        {availableFilters.map((filter) => (
                            <Checkbox
                                key={`theme-creator-filter-${filter}`}
                                label={startCase(filter)}
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
                        Save
                    </Button>
                    <Button
                        color="success"
                        onClick={() =>
                            ownedByUser ? themePatch() : themePut()
                        }
                    >
                        {ownedByUser ? "Update" : "Publish"}
                    </Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
