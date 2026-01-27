import { InputWithLabel } from "@components/InputWIthLabel";
import {
    type ColorLike,
    createColor,
    extractColors,
    isValidGradient,
} from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { CiCircleInfo } from "react-icons/ci";
import { useAppStore } from "@hooks/useStores";

export const ThemeCreatorColorsAdaptive = observer(() => {
    const app = useAppStore();
    const { values, setValues } = app.themeCreator;

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                type="color"
                label="Base color"
                name="baseColor"
                description="The base color of the app"
                required
                value={values.colors.background}
                allowGradient
                // apiError={errors.backgroundColor}
                onChange={(color: ColorLike) => {
                    let isDark: boolean;
                    let isGradient: boolean;
                    if (
                        isValidGradient(color) &&
                        extractColors(color) &&
                        extractColors(color)!.length > 0
                    ) {
                        isDark = createColor(extractColors(color)![0]).isDark();
                        isGradient = true;
                    } else {
                        isDark = createColor(color).isDark();
                        isGradient = false;
                    }

                    setValues({
                        ...values,
                        type: isDark ? "dark" : "light",
                        style: isGradient ? "gradient" : "normal",
                        colors: {
                            ...values.colors,
                            background: color,
                        },
                    });
                }}
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="Primary Color"
                name="primaryColor"
                description={
                    <>
                        Usually used to indicate the primary action or important
                        elements{" "}
                        <Typography
                            level="body-sm"
                            display="inline-flex"
                            variant="plain"
                            color="info"
                            spacing={1}
                            alignItems="center"
                        >
                            <CiCircleInfo />
                            Auto-generated icons derive from this color
                        </Typography>
                    </>
                }
                required
                value={values.colors.primary}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            primary: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="Base Text Color"
                name="typographyBaseColor"
                description={
                    <Stack direction="column" justifyContent="center">
                        The base color for texts{" "}
                        <Typography
                            level="body-sm"
                            display="inline-flex"
                            variant="plain"
                            color="info"
                            spacing={1}
                        >
                            <CiCircleInfo />
                            Usually white-ish is used on dark backgrounds,
                            black-ish on light backgrounds
                        </Typography>
                    </Stack>
                }
                required
                value={values.typography.colors.primary}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        typography: {
                            ...values.typography,
                            colors: {
                                ...values.typography.colors,
                                primary: color,
                            },
                        },
                    })
                }
                fullWidth
            />
        </Stack>
    );
});
