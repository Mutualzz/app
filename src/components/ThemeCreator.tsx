import type { MzTheme, ThemeDraft } from "@app-types/theme";
import { useAppStore } from "@hooks/useStores";
import type { HttpException } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    Divider,
    Drawer,
    Input,
    Option,
    Paper,
    randomColor,
    Select,
    Stack,
    Typography,
    useTheme,
    type InputProps,
} from "@mutualzz/ui";
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
import { useState } from "react";

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

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [presetSelectValue, setPresetSelectValue] = useState("");
    const [draftSelectValue, setDraftSelectValue] = useState("");
    const [userThemeSelectValue, setUserThemeSelectValue] = useState("");
    const [formKey, setFormKey] = useState(0);

    const allDefaultThemes = themeStore.themes.filter(
        (theme) => !theme.createdBy,
    );
    const allDrafts = draft.themes;
    const allUserThemes = themeStore.themes.filter((t) => t.createdBy);

    const defaultValues = {
        name: "",
        description: "",
        type: "dark" as "dark" | "light",
        mode: "normal" as "normal" | "gradient",
        colors: {
            common: {
                white: randomColor(),
                black: randomColor(),
            },
            primary: randomColor(),
            neutral: randomColor(),
            background: randomColor(),
            surface: randomColor(),
            danger: randomColor(),
            info: randomColor(),
            success: randomColor(),
            warning: randomColor(),
        },
        typography: {
            colors: {
                primary: randomColor(),
                secondary: randomColor(),
                accent: randomColor(),
                muted: randomColor(),
            },
        },
    };

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
            error.errors.forEach((err) => {
                setApiErrors({
                    [err.path]: err.message,
                });
            });
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
            error.errors.forEach((err) => {
                setApiErrors({
                    [err.path]: err.message,
                });
            });
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

    const getCurrentColorMode = () => {
        let currentMode: "normal" | "gradient" = "normal";
        if (loadedUserTheme) currentMode = loadedUserTheme.mode;
        if (loadedDraft) currentMode = loadedDraft.mode;
        if (loadedPreset) currentMode = loadedPreset.mode;

        form.setFieldValue("mode", currentMode);

        return currentMode;
    };

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
                <Stack
                    justifyContent="space-between"
                    p={{ xs: "0.75rem", sm: "1rem" }}
                    direction="column"
                    height="100%"
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
                            Start from scratch
                        </Button>
                        <Divider />
                        <Stack
                            direction="column"
                            spacing={5}
                            alignSelf="stretch"
                        >
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
                </Stack>
            )}
        />
    );

    return (
        <Paper
            width="100%"
            height="100%"
            maxWidth={{ xs: "100%", sm: 700, md: 900, lg: 1200 }}
            maxHeight={{ xs: 600, sm: 700, md: 800 }}
            p={{ xs: "0.5rem", sm: "1.5rem", md: "2rem" }}
            borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
            overflow="auto"
        >
            <form
                css={{
                    width: "100%",
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                key={formKey}
            >
                <Stack
                    width="100%"
                    height="100%"
                    direction="row"
                    spacing={{ xs: 2, sm: 4, md: 6 }}
                >
                    {isMobileQuery ? (
                        <Drawer
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                            onOpen={() => setDrawerOpen(true)}
                            swipeable
                            anchor="left"
                            size="sm"
                            disablePortal
                        >
                            <SidebarContent />
                        </Drawer>
                    ) : (
                        <SidebarContent />
                    )}
                    <Stack
                        direction="column"
                        width="100%"
                        height="100%"
                        p={{ xs: "0.75rem", sm: "1rem" }}
                        spacing={{ xs: 2, sm: 4, md: 6 }}
                        overflowY="auto"
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
                                Theme Creator{" "}
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
                            </Typography>
                            {loadedDraft && (
                                <Typography level="h5">
                                    (Draft &quot;{loadedDraft.name}&quot;)
                                </Typography>
                            )}
                            {loadedPreset && (
                                <Typography level="h5">
                                    (Preset &quot;{loadedPreset.name}&quot;)
                                </Typography>
                            )}
                            {loadedUserTheme && (
                                <Typography level="h5">
                                    (Theme &quot;{loadedUserTheme.name}&quot;)
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
                        <form.Field
                            name="mode"
                            children={({ handleChange, state: { value } }) => (
                                <Stack direction="column" spacing={5}>
                                    <Typography
                                        fontWeight={500}
                                        level="body-md"
                                    >
                                        Color Mode{" "}
                                        <Typography
                                            color="danger"
                                            variant="plain"
                                        >
                                            *
                                        </Typography>
                                    </Typography>
                                    <Typography level="body-xs">
                                        What type of color mode is your theme?
                                    </Typography>
                                    <ButtonGroup>
                                        <Button
                                            color="primary"
                                            disabled={value === "normal"}
                                            onClick={() => {
                                                handleChange("normal");
                                            }}
                                        >
                                            Normal
                                        </Button>
                                        <Button
                                            color="neutral"
                                            disabled={value === "gradient"}
                                            onClick={() => {
                                                handleChange("gradient");
                                            }}
                                        >
                                            Gradient
                                        </Button>
                                    </ButtonGroup>
                                </Stack>
                            )}
                        />

                        <form.Field
                            name="type"
                            children={({ handleChange, state: { value } }) => (
                                <Stack direction="column" spacing={5}>
                                    <Typography
                                        fontWeight={500}
                                        level="body-md"
                                    >
                                        Color Type{" "}
                                        <Typography
                                            color="danger"
                                            variant="plain"
                                        >
                                            *
                                        </Typography>
                                    </Typography>
                                    <Typography level="body-xs">
                                        What type of color type is your theme?
                                    </Typography>
                                    <ButtonGroup>
                                        <Button
                                            color="#fff"
                                            disabled={value === "light"}
                                            onClick={() =>
                                                handleChange("light")
                                            }
                                        >
                                            Light
                                        </Button>
                                        <Button
                                            color="#000"
                                            disabled={value === "dark"}
                                            onClick={() => handleChange("dark")}
                                        >
                                            Dark
                                        </Button>
                                    </ButtonGroup>
                                </Stack>
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={value}
                                />
                            )}
                        />
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
                                    allowGradient={
                                        getCurrentColorMode() === "gradient"
                                    }
                                    description="The background color of the app"
                                    onChange={handleChange}
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
                                    allowGradient={
                                        getCurrentColorMode() === "gradient"
                                    }
                                    description="This colors get applied to Cards (it automatically adapts to certain UI elements)"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={value}
                                    required
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
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
