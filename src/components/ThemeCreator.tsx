import type { MzTheme, ThemeDraft } from "@app-types/theme";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    baseDarkTheme,
    baseLightTheme,
    createColor,
    extractColors,
    isValidGradient,
    randomColor,
    type ColorLike,
    type ColorResult,
    type ThemeStyle,
    type ThemeType,
} from "@mutualzz/ui-core";
import {
    Button,
    ButtonGroup,
    Checkbox,
    Divider,
    Drawer,
    Input,
    Option,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
    useTheme,
    type InputProps,
} from "@mutualzz/ui-web";
import { validateThemePut } from "@mutualzz/validators";
import { useMediaQuery } from "@react-hookz/web";
import { Theme } from "@stores/objects/Theme";
import {
    revalidateLogic,
    useForm,
    type AnyFieldMeta,
    type AnyFormApi,
} from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { adaptColors } from "@utils/adaptation";
import { sortThemes } from "@utils/index";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaShuffle } from "react-icons/fa6";
import { AnimatedPaper } from "./Animated/AnimatedPaper";

type ApiErrors = Record<string, string>;

const InputWithLabel = ({
    apiErrors,
    meta,
    label,
    description,
    name,
    ...props
}: {
    name: string;
    meta: AnyFieldMeta;
    label: string;
    description?: string;
    apiErrors: ApiErrors;
} & InputProps) => (
    <Stack
        direction="column"
        spacing={{ xs: 0.125, sm: 0.25, md: 0.5 }}
        width="100%"
    >
        <Stack direction="column">
            <Typography
                fontWeight={500}
                level={{ xs: "body-sm", sm: "body-md" }}
            >
                {label}{" "}
                {props.required && (
                    <Typography variant="plain" color="danger">
                        *
                    </Typography>
                )}
            </Typography>
            {description && (
                <Typography level={{ xs: "body-xs", sm: "body-sm" }}>
                    {description}
                </Typography>
            )}
        </Stack>

        <Input
            textColor="primary"
            showRandom
            size={{ xs: "md", sm: "lg" }}
            {...props}
        />

        {!meta.isValid && meta.isTouched && (
            <Typography variant="plain" color="danger" level="body-sm">
                {meta.errors[0].message}
            </Typography>
        )}
        {apiErrors[name] && (
            <Typography variant="plain" color="danger" level="body-sm">
                {apiErrors[name]}
            </Typography>
        )}
    </Stack>
);

interface FormMeta {
    submitAction: "saveDraft" | "create" | "delete" | "update";
}

const defaultMeta: FormMeta = {
    submitAction: "create",
};

export const ThemeCreator = observer(() => {
    const app = useAppStore();
    const { theme, changeTheme } = useTheme();
    const prefersDark = usePrefersDark();
    const [apiErrors, setApiErrors] = useState<ApiErrors>({});
    const [loadedPreset, setLoadedPreset] = useState<MzTheme | null>(null);
    const [loadedDraft, setLoadedDraft] = useState<ThemeDraft | null>(null);
    const [loadedUserTheme, setLoadedUserTheme] = useState<MzTheme | null>(
        null,
    );

    const [colorType, setColorType] = useState<ThemeType>("dark");
    const [colorStyle, setColorStyle] = useState<ThemeStyle>("normal");

    const [adaptationEnabled, setAdaptationEnabled] = useState(true);

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [chosenColorStyle, setChosenColorStyle] =
        useState<ThemeStyle>("normal");

    const [presetSelectValue, setPresetSelectValue] = useState("");
    const [draftSelectValue, setDraftSelectValue] = useState("");
    const [userThemeSelectValue, setUserThemeSelectValue] = useState("");
    const [formKey, setFormKey] = useState(0);

    const allDefaultThemes = useMemo(
        () =>
            app.themes.all
                .filter((theme) => !theme.author)
                .filter((theme) => theme.style === colorStyle),
        [app.themes.all, colorStyle],
    );
    const allDrafts = useMemo(() => app.drafts.themes, [app.drafts.themes]);
    const allUserThemes = useMemo(
        () => app.themes.all.filter((t) => t.author),
        [app.themes.all],
    );

    const defaultValues = {
        ...(prefersDark ? baseDarkTheme : baseLightTheme),
        name: "",
        description: "",
    };

    const loaded = loadedUserTheme ?? loadedDraft ?? loadedPreset;

    const derivedType = loaded
        ? loaded.type
        : colorType || (prefersDark ? "dark" : "light");
    const derivedStyle = loaded ? loaded.style : colorStyle || "normal";
    const derivedAdaptive = loaded ? loaded.adaptive : adaptationEnabled;

    useEffect(() => {
        if (form.getFieldValue("style") !== derivedStyle) {
            form.setFieldValue("style", derivedStyle);
        }
    }, [derivedStyle]);

    useEffect(() => {
        if (form.getFieldValue("type") !== derivedType) {
            form.setFieldValue("type", derivedType);
        }
    }, [derivedType]);

    useEffect(() => {
        if (form.getFieldValue("adaptive") === derivedAdaptive) return;
        form.setFieldValue("adaptive", derivedAdaptive);
        setAdaptationEnabled(derivedAdaptive);
    }, [derivedAdaptive]);

    const load = (
        toLoad: string,
        type: "preset" | "draft" | "userTheme",
    ): Theme | MzTheme | ThemeDraft | undefined => {
        let theme: MzTheme | Theme | ThemeDraft | undefined;
        switch (type) {
            case "draft":
                theme = allDrafts.find((t) => t.name === toLoad);
                break;
            case "userTheme":
                theme = allUserThemes.find((t) => t.id === toLoad);
                break;
            case "preset":
                theme = allDefaultThemes.find((t) => t.id === toLoad);
        }
        if (!theme) return;

        setLoadedPreset(type === "preset" ? (theme as MzTheme) : null);
        setLoadedDraft(type === "draft" ? (theme as ThemeDraft) : null);
        setLoadedUserTheme(type === "userTheme" ? (theme as MzTheme) : null);

        setPresetSelectValue(type === "preset" ? toLoad : "");
        setDraftSelectValue(type === "draft" ? (theme as ThemeDraft).name : "");
        setUserThemeSelectValue(
            type === "userTheme" ? (theme as MzTheme).id : "",
        );

        return theme;
    };

    const unload = (type?: "preset" | "draft" | "userTheme") => {
        if (!type) {
            setLoadedPreset(null);
            setLoadedDraft(null);
            setLoadedUserTheme(null);
            setPresetSelectValue("");
            setDraftSelectValue("");
            setUserThemeSelectValue("");
            return;
        }
        if (type === "preset") {
            setLoadedPreset(null);
            setPresetSelectValue("");
        }
        if (type === "draft") {
            setLoadedDraft(null);
            setDraftSelectValue("");
        }
        if (type === "userTheme") {
            setLoadedUserTheme(null);
            setUserThemeSelectValue("");
        }
    };

    const themePut = useMutation({
        mutationKey: ["create-theme"],
        mutationFn: async (values: any) => {
            let dataToSubmit = values;
            if (adaptationEnabled)
                dataToSubmit = {
                    ...values,
                    ...adaptColors({
                        baseColor: values.colors.background,
                        primaryColor: values.colors.primary,
                        primaryText: values.typography.colors.primary,
                    }),
                };

            const response = await app.rest.post<any, MzTheme>(
                "@me/themes",
                dataToSubmit,
            );

            return response;
        },

        onError: (error: HttpException) => {
            const next: Record<string, string> = {};
            error.errors.forEach((e) => {
                next[e.path] = e.message;
            });
            setApiErrors(next);
        },
    });

    const themePatch = useMutation({
        mutationKey: ["update-theme"],
        mutationFn: async (values: any) => {
            let dataToSubmit = values;
            if (adaptationEnabled)
                dataToSubmit = {
                    ...values,
                    ...adaptColors({
                        baseColor: values.colors.background,
                        primaryColor: values.colors.primary,
                        primaryText: values.typography.colors.primary,
                    }),
                };

            const response = await app.rest.patch<any, MzTheme>(
                `@me/themes/${loadedUserTheme?.id}`,
                dataToSubmit,
            );
            return response;
        },
        onSuccess: (data) => {
            app.themes.update(data);
            setApiErrors({});
        },
        onError: (error: HttpException) => {
            const next: Record<string, string> = {};
            error.errors.forEach((e) => {
                next[e.path] = e.message;
            });
            setApiErrors(next);
        },
    });

    const themeDelete = useMutation({
        mutationKey: ["delete-theme"],
        mutationFn: async (id: any) => {
            const response = await app.rest.delete<{ id: string }>(
                `@me/themes/${id}`,
            );

            return response;
        },
        onSuccess: (data) => {
            app.themes.remove(data.id);
            if (app.themes.currentTheme === data.id) changeTheme(null);
            setApiErrors({});
            unload();
        },
    });

    const updateForm = (
        form: AnyFormApi,
        theme?: Theme | MzTheme | ThemeDraft,
        type?: "userTheme" | "draft" | "preset",
    ) => {
        if (theme) {
            if (type) {
                form.setFieldValue("name", type === "preset" ? "" : theme.name);
                form.setFieldValue(
                    "description",
                    type === "preset" ? "" : (theme.description ?? ""),
                );
                form.setFieldValue("adaptive", theme.adaptive);

                form.setFieldValue("style", theme.style);
                form.setFieldValue("type", theme.type);
            }

            form.setFieldValue("colors", theme.colors);
            form.setFieldValue("typography", theme.typography);
        } else form.reset(defaultValues);

        setFormKey((prev) => prev + 1);
    };

    const unloadAndReset = (form: AnyFormApi) => {
        unload();
        updateForm(form);
    };

    const deleteDraft = useCallback(() => {
        if (!loadedDraft) return;

        app.drafts.deleteThemeDraft(loadedDraft);
        unloadAndReset(form);
    }, [loadedDraft, app.drafts]);

    const loadAndUpdate = useCallback(
        (idOrName: string, type: "userTheme" | "draft" | "preset") => {
            const theme = load(idOrName, type);
            updateForm(form, theme, type);
        },
        [],
    );

    const form = useForm({
        defaultValues,
        validationLogic: revalidateLogic(),
        validators: {
            onDynamic: validateThemePut as any,
        },
        onSubmitMeta: defaultMeta,
        onSubmit: async ({
            value,
            meta,
        }: {
            value: ThemeDraft | MzTheme;
            meta: FormMeta;
        }) => {
            if (meta.submitAction === "saveDraft") {
                app.drafts.saveThemeDraft(value);

                load(value.name, "draft");
                return;
            }

            if (meta.submitAction === "update" && loadedUserTheme) {
                themePatch.mutate(value, {
                    onSuccess: (data) => {
                        app.themes.update(data);
                        changeTheme(Theme.toEmotionTheme(data));
                        setApiErrors({});

                        // Directly set the loaded state instead of using the load function (because we want to avoid timing issues)
                        setLoadedUserTheme(data);
                        setLoadedPreset(null);
                        setLoadedDraft(null);
                        setUserThemeSelectValue(data.id);
                        setPresetSelectValue("");
                        setDraftSelectValue("");

                        updateForm(form, data, "userTheme");
                    },
                });
                return;
            }
            if (meta.submitAction === "delete" && loadedUserTheme) {
                themeDelete.mutate(loadedUserTheme.id, {
                    onSuccess: (data) => {
                        app.themes.remove(data.id);
                        changeTheme(null);
                        unloadAndReset(form);
                    },
                });
                return;
            }

            if (meta.submitAction === "create") {
                themePut.mutate(value, {
                    onSuccess: (data) => {
                        app.themes.add(data);
                        changeTheme(Theme.toEmotionTheme(data));
                        setApiErrors({});

                        // Directly set the loaded state instead of using the load function (because we want to avoid timing issues)
                        setLoadedUserTheme(data);
                        setLoadedPreset(null);
                        setLoadedDraft(null);
                        setUserThemeSelectValue(data.id);
                        setPresetSelectValue("");
                        setDraftSelectValue("");

                        updateForm(form, data, "userTheme");
                    },
                });
                return;
            }
        },
    });

    const randomizeColors = useCallback(() => {
        const data = {
            name: form.getFieldValue("name"),
            description: form.getFieldValue("description"),
            adaptive: adaptationEnabled,
            style: form.getFieldValue("style"),
            type: form.getFieldValue("type"),
            colors: {
                background: randomColor("hex"),
                primary: randomColor("hex"),
                ...(!adaptationEnabled && {
                    common: {
                        black: randomColor("hex"),
                        white: randomColor("hex"),
                    },
                    surface: randomColor("hex"),
                    neutral: randomColor("hex"),
                    success: randomColor("hex"),
                    info: randomColor("hex"),
                    warning: randomColor("hex"),
                    danger: randomColor("hex"),
                }),
            },
            typography: {
                colors: {
                    primary: randomColor("hex"),
                    ...(!adaptationEnabled && {
                        secondary: randomColor("hex"),
                        accent: randomColor("hex"),
                        muted: randomColor("hex"),
                    }),
                },
            },
        };

        updateForm(form, data as MzTheme);
    }, [form, adaptationEnabled]);

    const SidebarContent = () => (
        <form.Subscribe
            selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                themePut.isPending,
                themeDelete.isPending,
            ]}
            children={([
                canSubmit,
                isSubmitting,
                putPending,
                deletePending,
            ]) => (
                <Paper
                    justifyContent="space-between"
                    p={{ xs: "0.75rem", sm: "1rem" }}
                    direction="column"
                    height="100%"
                    elevation={1}
                >
                    <Stack direction="column" alignItems="center" spacing={2.5}>
                        <Button
                            color="danger"
                            onClick={() => {
                                unloadAndReset(form);
                            }}
                            css={{
                                alignSelf: "stretch",
                            }}
                            disabled={
                                !canSubmit ||
                                isSubmitting ||
                                putPending ||
                                deletePending
                            }
                        >
                            Reset
                        </Button>
                        <Divider />
                        <Stack
                            direction="column"
                            spacing={1.25}
                            alignSelf="stretch"
                        >
                            <RadioGroup
                                onChange={(_, val) =>
                                    setColorStyle(val as ThemeStyle)
                                }
                                orientation="horizontal"
                                spacing={10}
                                value={colorStyle}
                            >
                                <Radio label="Normal" value="normal" />
                                <Radio label="Gradient" value="gradient" />
                            </RadioGroup>
                            <Typography level="body-sm">
                                Pick a preset
                            </Typography>
                            <Select
                                variant="solid"
                                color="primary"
                                onValueChange={(value) => {
                                    loadAndUpdate(value.toString(), "preset");
                                }}
                                value={presetSelectValue}
                                placeholder="Pick a preset"
                                disabled={
                                    isSubmitting || putPending || deletePending
                                }
                            >
                                {sortThemes(allDefaultThemes).map((theme) => (
                                    <Option key={theme.id} value={theme.id}>
                                        {theme.name} ({capitalize(theme.type)})
                                    </Option>
                                ))}
                            </Select>
                        </Stack>
                        <Divider />
                        <Stack
                            direction="column"
                            spacing={1.25}
                            alignSelf="stretch"
                        >
                            <Typography level="body-sm">
                                Pick your drafts
                            </Typography>
                            <Select
                                onValueChange={(value) => {
                                    loadAndUpdate(value.toString(), "draft");
                                }}
                                value={draftSelectValue}
                                placeholder={
                                    allDrafts.length === 0
                                        ? "No drafts available"
                                        : "Pick a draft"
                                }
                                disabled={
                                    isSubmitting ||
                                    putPending ||
                                    deletePending ||
                                    allDrafts.length === 0
                                }
                            >
                                {allDrafts.map((theme) => (
                                    <Option key={theme.name} value={theme.name}>
                                        {theme.name} ({capitalize(theme.type)})
                                    </Option>
                                ))}
                            </Select>
                            {loadedDraft && (
                                <Button
                                    onClick={() => {
                                        deleteDraft();
                                    }}
                                    css={{
                                        alignSelf: "stretch",
                                    }}
                                    disabled={
                                        isSubmitting ||
                                        putPending ||
                                        deletePending
                                    }
                                    type="submit"
                                >
                                    Delete Draft
                                </Button>
                            )}
                        </Stack>
                        <Divider />
                        <Stack
                            direction="column"
                            spacing={1.25}
                            alignSelf="stretch"
                        >
                            <Typography level="body-sm">
                                Pick your theme
                            </Typography>
                            <Select
                                onValueChange={(value) => {
                                    loadAndUpdate(
                                        value.toString(),
                                        "userTheme",
                                    );
                                }}
                                placeholder={
                                    allUserThemes.length === 0
                                        ? "No themes available"
                                        : "Pick your theme"
                                }
                                value={userThemeSelectValue}
                                disabled={
                                    isSubmitting ||
                                    putPending ||
                                    deletePending ||
                                    allUserThemes.length === 0
                                }
                            >
                                {allUserThemes.map((theme) => (
                                    <Option key={theme.id} value={theme.id}>
                                        {theme.name} ({capitalize(theme.type)})
                                    </Option>
                                ))}
                            </Select>
                            {loadedUserTheme && (
                                <Button
                                    onClick={() => {
                                        form.handleSubmit({
                                            submitAction: "delete",
                                        });
                                    }}
                                    css={{
                                        alignSelf: "stretch",
                                    }}
                                    type="submit"
                                    disabled={
                                        !canSubmit ||
                                        isSubmitting ||
                                        putPending ||
                                        deletePending
                                    }
                                >
                                    Delete Theme
                                </Button>
                            )}
                        </Stack>
                    </Stack>

                    <ButtonGroup orientation="vertical">
                        <Button
                            onClick={() =>
                                form.handleSubmit({
                                    submitAction: "saveDraft",
                                })
                            }
                            type="submit"
                            color={
                                loadedDraft &&
                                allDrafts.some(
                                    (draft) => draft.name === loadedDraft.name,
                                )
                                    ? "info"
                                    : "warning"
                            }
                            disabled={
                                !canSubmit ||
                                isSubmitting ||
                                putPending ||
                                deletePending
                            }
                        >
                            {loadedDraft &&
                            allDrafts.some(
                                (draft) => draft.name === loadedDraft.name,
                            )
                                ? "Update Draft"
                                : "Save Draft"}
                        </Button>
                        <Button
                            onClick={() =>
                                form.handleSubmit({
                                    submitAction:
                                        loadedUserTheme &&
                                        allUserThemes.some(
                                            (theme) =>
                                                theme.id === loadedUserTheme.id,
                                        )
                                            ? "update"
                                            : "create",
                                })
                            }
                            type="submit"
                            color="success"
                            loading={
                                isSubmitting || putPending || deletePending
                            }
                            disabled={!canSubmit}
                        >
                            {loadedUserTheme &&
                            allUserThemes.some(
                                (theme) => theme.id === loadedUserTheme.id,
                            )
                                ? "Update"
                                : "Create"}
                        </Button>
                    </ButtonGroup>
                </Paper>
            )}
        />
    );

    return (
        <AnimatedPaper
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            direction="row"
            width="100%"
            height="100%"
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                key={formKey}
                css={{
                    width: "100%",
                    height: "100%",
                }}
            >
                <Stack
                    direction="row"
                    height="100%"
                    width="100%"
                    justifyContent="center"
                    spacing={{ xs: 2, sm: 4, md: 6 }}
                    pt={{ xs: 0, sm: "0.5rem", md: "1rem" }}
                >
                    <Stack justifyContent="space-between" height="100%">
                        {isMobileQuery ? (
                            <Drawer
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                onOpen={() => setDrawerOpen(true)}
                                swipeable
                                anchor="left"
                                size="sm"
                            >
                                <SidebarContent />
                            </Drawer>
                        ) : (
                            <SidebarContent />
                        )}
                    </Stack>
                    <Stack
                        direction="column"
                        width="100%"
                        height="100%"
                        maxWidth={800}
                        flex={1}
                        p={{ xs: "0.75rem", sm: "1rem" }}
                        spacing={{ xs: 2, sm: 4, md: 8 }}
                        overflowY="auto"
                    >
                        <Stack
                            direction="column"
                            alignItems="center"
                            spacing={1}
                        >
                            <Stack
                                alignItems="center"
                                direction={{ xs: "column", sm: "row" }}
                                spacing={5}
                            >
                                <Typography
                                    level={{ xs: "h5", sm: "h4" }}
                                    fontSize={{
                                        xs: "1.25rem",
                                        sm: "1.5rem",
                                        md: "2rem",
                                    }}
                                >
                                    Theme Creator
                                </Typography>
                            </Stack>
                            {isMobileQuery &&
                                !loadedDraft &&
                                !loadedPreset &&
                                !loadedUserTheme && (
                                    <Typography
                                        level={{
                                            xs: "body-sm",
                                            sm: "body-md",
                                        }}
                                    >
                                        (Swipe to access the sidebar)
                                    </Typography>
                                )}
                            {!loadedDraft &&
                                !loadedPreset &&
                                !loadedUserTheme && (
                                    <Typography level="body-sm">
                                        {capitalize(colorType)}{" "}
                                        {capitalize(chosenColorStyle)} Theme
                                    </Typography>
                                )}
                            {loadedDraft && (
                                <Typography level="h6">
                                    Draft: {loadedDraft.name} (
                                    {capitalize(loadedDraft.style)}{" "}
                                    {capitalize(loadedDraft.type)} Theme)
                                </Typography>
                            )}
                            {loadedPreset && (
                                <Typography level="h6">
                                    Preset: {loadedPreset.name} (
                                    {capitalize(loadedPreset.style)}{" "}
                                    {capitalize(loadedPreset.type)} Theme)
                                </Typography>
                            )}
                            {loadedUserTheme && (
                                <Typography level="h6">
                                    Your theme: {loadedUserTheme.name} (
                                    {capitalize(loadedUserTheme.style)}{" "}
                                    {capitalize(loadedUserTheme.type)} Theme)
                                </Typography>
                            )}
                        </Stack>
                        <Stack direction="column" width="100%" spacing={2.5}>
                            <form.Field
                                name="name"
                                children={({
                                    state: { meta, value },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <InputWithLabel
                                        type="text"
                                        apiErrors={apiErrors}
                                        meta={meta}
                                        name="name"
                                        label="Name"
                                        description="The name for your theme"
                                        onChange={(e) =>
                                            handleChange(e.target.value)
                                        }
                                        onBlur={handleBlur}
                                        value={value}
                                        required
                                    />
                                )}
                            />
                            <form.Field
                                name="description"
                                children={({
                                    state: { meta, value },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <InputWithLabel
                                        type="text"
                                        apiErrors={apiErrors}
                                        meta={meta}
                                        name="description"
                                        label="Description"
                                        description="A brief description of your theme"
                                        onChange={(e) =>
                                            handleChange(e.target.value)
                                        }
                                        onBlur={handleBlur}
                                        value={value}
                                    />
                                )}
                            />
                            <Divider />
                            <Stack
                                direction="row"
                                spacing={2.5}
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Typography level="h4">Colors</Typography>
                                <Stack
                                    justifyContent="center"
                                    alignItems="center"
                                    spacing={2.5}
                                >
                                    <Button
                                        startDecorator={<FaShuffle />}
                                        color="danger"
                                        onClick={() => randomizeColors()}
                                    >
                                        Randomize
                                    </Button>
                                    <Checkbox
                                        label="Adapt"
                                        checked={adaptationEnabled}
                                        onChange={() =>
                                            setAdaptationEnabled(
                                                (prev) => !prev,
                                            )
                                        }
                                        variant="outlined"
                                    />
                                </Stack>
                            </Stack>
                            <form.Field
                                name="colors.background"
                                children={({
                                    state: { meta, value },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <InputWithLabel
                                        type="color"
                                        apiErrors={apiErrors}
                                        meta={meta}
                                        name="colors.background"
                                        required
                                        label={
                                            adaptationEnabled
                                                ? "Base Color"
                                                : "Background Color"
                                        }
                                        allowGradient
                                        description={`The ${adaptationEnabled ? "base" : "background"} color of the app`}
                                        onChangeResult={(
                                            result: ColorResult,
                                        ) => {
                                            const val = result.hex;
                                            let isDark = false;
                                            if (
                                                isValidGradient(val) &&
                                                extractColors(val) &&
                                                extractColors(val)!.length > 0
                                            ) {
                                                isDark = createColor(
                                                    extractColors(val)![0],
                                                ).isDark();
                                            } else {
                                                isDark =
                                                    createColor(val).isDark();
                                            }
                                            if (isDark) setColorType("dark");
                                            else setColorType("light");
                                        }}
                                        onChange={(color: ColorLike) => {
                                            if (isValidGradient(color))
                                                setChosenColorStyle("gradient");
                                            else setChosenColorStyle("normal");

                                            handleChange(color);
                                        }}
                                        onBlur={handleBlur}
                                        value={value}
                                    />
                                )}
                            />
                            {!adaptationEnabled && (
                                <>
                                    <form.Field
                                        name="colors.surface"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.surface"
                                                label="Surface Color"
                                                allowGradient
                                                description="This color gets applied to Cards (it automatically adapts to certain UI elements)"
                                                onChange={(color: ColorLike) =>
                                                    handleChange(color)
                                                }
                                                onBlur={handleBlur}
                                                value={value}
                                                required
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.common.black"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.common.black"
                                                label="Black"
                                                description="The color to use for text and icons on a light background"
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                                required
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.common.white"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.common.white"
                                                label="White"
                                                description="The color to use for text and icons on a dark background"
                                                required
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                </>
                            )}
                            <form.Field
                                name="colors.primary"
                                children={({
                                    state: { meta, value },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <InputWithLabel
                                        type="color"
                                        apiErrors={apiErrors}
                                        meta={meta}
                                        name="colors.primary"
                                        label="Primary Color"
                                        description={
                                            adaptationEnabled
                                                ? "Usually used to indicate the primary action or important elements"
                                                : "Usually used to indicate the primary action or important elements"
                                        }
                                        required
                                        onChangeResult={(result: ColorResult) =>
                                            handleChange(result.hex)
                                        }
                                        onBlur={handleBlur}
                                        value={value}
                                    />
                                )}
                            />
                            {!adaptationEnabled && (
                                <>
                                    <form.Field
                                        name="colors.neutral"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.neutral"
                                                label="Neutral Color"
                                                description="Usually used to indicate a neutral or inactive state"
                                                required
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.danger"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.danger"
                                                label="Danger Color"
                                                description="Usually used to indicate errors and failure within the app"
                                                required
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.warning"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.warning"
                                                label="Warning Color"
                                                description="Usually used to indicate caution and requires user attention"
                                                required
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.info"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.info"
                                                required
                                                label="Info Color"
                                                description="Usually used to indicate additional information"
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="colors.success"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="colors.success"
                                                label="Success Color"
                                                description="Usually used to indicate a successful or positive action"
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                                required
                                            />
                                        )}
                                    />
                                </>
                            )}
                            <form.Field
                                name="typography.colors.primary"
                                children={({
                                    state: { meta, value },
                                    handleChange,
                                    handleBlur,
                                }) => (
                                    <InputWithLabel
                                        type="color"
                                        apiErrors={apiErrors}
                                        meta={meta}
                                        name="typography.colors.primary"
                                        label={
                                            adaptationEnabled
                                                ? "Base Text Color"
                                                : "Primary Text Color"
                                        }
                                        description="The primary color for texts, usually white is used on dark backgrounds and black on light backgrounds"
                                        required
                                        onChangeResult={(result: ColorResult) =>
                                            handleChange(result.hex)
                                        }
                                        onBlur={handleBlur}
                                        value={value}
                                    />
                                )}
                            />
                            {!adaptationEnabled && (
                                <>
                                    <form.Field
                                        name="typography.colors.secondary"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="typography.colors.secondary"
                                                label="Secondary Text Color"
                                                description="Used for less important text"
                                                required
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="typography.colors.accent"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="typography.colors.accent"
                                                description="Used for accentuating important texts"
                                                required
                                                label="Accent Text Color"
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                            />
                                        )}
                                    />
                                    <form.Field
                                        name="typography.colors.muted"
                                        children={({
                                            state: { meta, value },
                                            handleChange,
                                            handleBlur,
                                        }) => (
                                            <InputWithLabel
                                                type="color"
                                                apiErrors={apiErrors}
                                                meta={meta}
                                                name="typography.colors.muted"
                                                description="Used for muted texts"
                                                label="Muted Text Color"
                                                onChangeResult={(
                                                    result: ColorResult,
                                                ) => handleChange(result.hex)}
                                                onBlur={handleBlur}
                                                value={value}
                                                required
                                            />
                                        )}
                                    />
                                </>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </form>
        </AnimatedPaper>
    );
});
