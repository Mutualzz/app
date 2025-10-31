import type { MzTheme, ThemeDraft } from "@app-types/theme";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    baseDarkTheme,
    createColor,
    extractColors,
    isValidGradient,
    type ColorResult,
    type ThemeStyle,
    type ThemeType,
} from "@mutualzz/ui-core";
import {
    Button,
    ButtonGroup,
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
import {
    revalidateLogic,
    useForm,
    type AnyFieldMeta,
    type AnyFormApi,
} from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { sortThemes } from "@utils/index";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

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
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }} width="100%">
        <Stack direction="column">
            <Typography
                fontWeight={500}
                level={{ xs: "body-sm", sm: "body-md" }}
                mb={{ xs: "0.25rem", sm: "0.5rem" }}
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
    const { draft, rest, theme: themeStore } = useAppStore();
    const { theme } = useTheme();
    const [apiErrors, setApiErrors] = useState<ApiErrors>({});
    const [loadedPreset, setLoadedPreset] = useState<MzTheme | null>(null);
    const [loadedDraft, setLoadedDraft] = useState<ThemeDraft | null>(null);
    const [loadedUserTheme, setLoadedUserTheme] = useState<MzTheme | null>(
        null,
    );

    const [colorType, setColorType] =
        useState<Omit<ThemeType, "system">>("dark");
    const [colorStyle, setColorStyle] = useState<ThemeStyle>("normal");

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

    const allDefaultThemes = themeStore.themes
        .filter((theme) => !theme.createdBy)
        .filter((theme) => theme.style === colorStyle);
    const allDrafts = draft.themes;
    const allUserThemes = themeStore.themes.filter((t) => t.createdBy);

    const defaultValues = {
        ...baseDarkTheme,
        name: "",
        description: "",
    };

    const derivedStyle: ThemeStyle =
        loadedUserTheme?.style ??
        loadedDraft?.style ??
        loadedPreset?.style ??
        "normal";

    useEffect(() => {
        form.setFieldValue("style", derivedStyle);
    }, [derivedStyle]);

    const load = (
        toLoad: string,
        type: "preset" | "draft" | "userTheme",
    ): MzTheme | ThemeDraft | undefined => {
        let theme: MzTheme | ThemeDraft | undefined;
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

        switch (type) {
            case "preset": {
                setPresetSelectValue("");
                setDraftSelectValue("");
                setUserThemeSelectValue("");
                break;
            }
            case "draft": {
                setPresetSelectValue("");
                setDraftSelectValue(theme.name);
                setUserThemeSelectValue("");
                break;
            }
            case "userTheme": {
                setPresetSelectValue("");
                setDraftSelectValue("");
                setUserThemeSelectValue((theme as MzTheme).id);
                break;
            }
        }

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
        mutationFn: async (values: any) => {
            const response = await rest.put<any, MzTheme>("@me/themes", values);

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
        mutationFn: async (values: any) => {
            const response = await rest.patch<any, MzTheme>(
                "@me/themes",
                values,
                {
                    id: loadedUserTheme?.id,
                },
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

    const themeDelete = useMutation({
        mutationFn: async (id: any) => {
            const response = await rest.delete<{ id: string }>("@me/themes", {
                id,
            });

            return response;
        },
        onSuccess: (data) => {
            themeStore.removeTheme(data.id);
            unload();
        },
    });

    const updateForm = (
        form: AnyFormApi,
        theme?: MzTheme | ThemeDraft,
        type?: "userTheme" | "draft" | "preset",
    ) => {
        if (theme && type) {
            form.setFieldValue("name", type === "preset" ? "" : theme.name);
            form.setFieldValue(
                "description",
                type === "preset" ? "" : (theme.description ?? ""),
            );
            form.setFieldValue("type", theme.type);
            form.setFieldValue("colors", theme.colors);
            form.setFieldValue("typography", theme.typography);

            setFormKey((prev) => prev + 1);
            return;
        }

        form.reset(defaultValues);
        setFormKey((prev) => prev + 1);
    };

    const unloadAndReset = (form: AnyFormApi) => {
        unload();
        updateForm(form);
    };

    const deleteDraft = () => {
        if (!loadedDraft) return;

        draft.deleteThemeDraft(loadedDraft);
        unloadAndReset(form);
    };

    const loadAndUpdate = (
        idOrName: string,
        type: "userTheme" | "draft" | "preset",
    ) => {
        const theme = load(idOrName, type);
        updateForm(form, theme, type);
    };

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
                draft.saveThemeDraft(value);

                load(value.name, "draft");
                return;
            }

            if (meta.submitAction === "update" && loadedUserTheme) {
                themePatch.mutate(value, {
                    onSuccess: (data) => {
                        themeStore.updateTheme(data);
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
                        themeStore.removeTheme(data.id);
                        unloadAndReset(form);
                    },
                });
                return;
            }

            if (meta.submitAction === "create") {
                themePut.mutate(value, {
                    onSuccess: (data) => {
                        themeStore.addTheme(data);
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
                    <Stack direction="column" alignItems="center" spacing={10}>
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
                            spacing={5}
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
                            spacing={5}
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
                                        {theme.name} (
                                        {capitalize(theme.type.toString())})
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
                            spacing={5}
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
        <Paper direction="row" nonTranslucent width="100%" height="100%">
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
                        maxWidth="800px"
                        flex={1}
                        p={{ xs: "0.75rem", sm: "1rem" }}
                        spacing={{ xs: 2, sm: 4, md: 6 }}
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
                                        {capitalize(colorType.toString())}{" "}
                                        {capitalize(
                                            chosenColorStyle.toString(),
                                        )}{" "}
                                        Theme
                                    </Typography>
                                )}
                            {loadedDraft && (
                                <Typography level="h6">
                                    Draft: {loadedDraft.name} (
                                    {capitalize(loadedDraft.style.toString())}{" "}
                                    {capitalize(loadedDraft.type.toString())}{" "}
                                    Theme)
                                </Typography>
                            )}
                            {loadedPreset && (
                                <Typography level="h6">
                                    Preset: {loadedPreset.name} (
                                    {capitalize(loadedPreset.style.toString())}{" "}
                                    {capitalize(loadedPreset.type)} Theme)
                                </Typography>
                            )}
                            {loadedUserTheme && (
                                <Typography level="h6">
                                    Your theme: {loadedUserTheme.name} (
                                    {capitalize(
                                        loadedUserTheme.style.toString(),
                                    )}{" "}
                                    {capitalize(loadedUserTheme.type)} Theme)
                                </Typography>
                            )}
                        </Stack>
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
                        <Stack direction="column" spacing={1}>
                            <Typography level="h4">Common Colors</Typography>
                            <Typography level="body-sm">
                                These colors are used to calibrate some UI
                                elements.
                            </Typography>
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
                                    label="Background Color"
                                    allowGradient
                                    description="The background color of the app"
                                    onChange={(result: ColorResult) => {
                                        const val = result.hex;
                                        handleChange(val);
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
                                            isDark = createColor(val).isDark();
                                        }
                                        if (isDark) setColorType("dark");
                                        else setColorType("light");
                                    }}
                                    onBlur={handleBlur}
                                    value={value}
                                />
                            )}
                        />
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
                                    description="This colors get applied to Cards (it automatically adapts to certain UI elements)"
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
                                    onBlur={handleBlur}
                                    value={value}
                                />
                            )}
                        />
                        <Divider />
                        <Stack direction="column" spacing={1}>
                            <Typography level="h4">Feedback Colors</Typography>
                            <Typography level="body-sm">
                                These colors are used to indicate the importance
                                of UI elements.
                            </Typography>
                        </Stack>
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
                                    description="Usually used to indicate the primary action or important elements"
                                    required
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
                                    onBlur={handleBlur}
                                    value={value}
                                />
                            )}
                        />
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
                                    onBlur={handleBlur}
                                    value={value}
                                    required
                                />
                            )}
                        />
                        <Divider />
                        <Stack direction="column" spacing={1}>
                            <Typography level="h4">Text Colors</Typography>
                            <Typography level="body-sm">
                                These colors are used for text elements in the
                                application.
                            </Typography>
                        </Stack>
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
                                    label="Primary Color"
                                    description="Used for important text"
                                    required
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
                                    onBlur={handleBlur}
                                    value={value}
                                />
                            )}
                        />
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
                                    label="Secondary Color"
                                    description="Used for less important text"
                                    required
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    description="Used for accentuating important elements"
                                    required
                                    label="Accent Color"
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
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
                                    description="Used for muted elements"
                                    label="Muted Color"
                                    onChange={(result: ColorResult) =>
                                        handleChange(result.hex)
                                    }
                                    onBlur={handleBlur}
                                    value={value}
                                    required
                                />
                            )}
                        />
                    </Stack>
                </Stack>
            </form>
        </Paper>
    );
});
