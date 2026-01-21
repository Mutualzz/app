import { InputWithLabel } from "@components/InputWIthLabel";
import { useThemeCreator } from "@contexts/ThemeCreator.context";
import {
    createColor,
    extractColors,
    isValidGradient,
    type ColorLike,
} from "@mutualzz/ui-core";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const ThemeCreatorColorsAdaptive = observer(() => {
    const { values, setValues } = useThemeCreator();

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
                    let isDark = false;
                    let isGradient = false;
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
                        elements
                        <br />
                        <b>Auto-generated icons derive from this color</b>
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
                description="The base color for texts, usually white-ish is used on dark backgrounds and black-ish on light backgrounds"
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
