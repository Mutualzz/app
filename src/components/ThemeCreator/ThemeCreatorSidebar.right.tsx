import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import {
    type ThemeCreatorFilter,
    type ThemeCreatorLoadedType,
    useThemeCreator,
} from "@contexts/ThemeCreator.context";
import { useAppStore } from "@hooks/useStores";
import type { APITheme, HttpException } from "@mutualzz/types";
import type { MzTheme } from "@mutualzz/ui-core";
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

const availableFilters = [
    "light",
    "dark",
    "adaptive",
    "normal",
    "gradient",
] as const;

// TODO: Implement save and publish functionality (save is draft, publish is creating it in the api) make sure to update drafts and updating themes if they exist
export const ThemeCreatorSidebarRight = observer(() => {
    const app = useAppStore();
    const { changeTheme } = useTheme();
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
    }, [app.themes.all, app.drafts.themes, loadedType, filters]);

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

    const handleChange = (value: any) => {
        const theme = themes.find((theme) => theme.id === value);
        if (!theme) return;

        loadValues(Theme.toEmotion(theme));
    };

    const toggleFilter = (filter: ThemeCreatorFilter) => {
        if (filters.includes(filter)) {
            removeFilter(filter);
        } else {
            addFilter(filter);
        }
    };

    const resetThemeCreator = () => {
        resetValues();
        resetFilters();
        setLoadedType("default");
        setCurrentPage("details");
        setCurrentCategory("general");
    };

    // TODO: use memo for ownedByUser
    const ownedByUser = !!values.id && app.account?.id === values.authorId;

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
                            disabled={!userInteracted}
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
                                closeAllModals();
                            }}
                            disabled={loadedType === "default" || !ownedByUser}
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
                <Select
                    onValueChange={handleChange}
                    color="primary"
                    placeholder="Pick a theme"
                    disabled={themes.length === 0}
                    value={values.id || values.name || undefined}
                >
                    {sortThemes(themes).map((theme) => (
                        <Option key={theme.id} value={theme.id} variant="soft">
                            {theme.name}
                        </Option>
                    ))}
                </Select>
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
                <ButtonGroup fullWidth spacing={5} disabled={!userInteracted}>
                    <Button color="warning" disabled={ownedByUser}>
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
