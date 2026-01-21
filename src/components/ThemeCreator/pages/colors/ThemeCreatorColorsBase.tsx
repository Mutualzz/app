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

export const ThemeCreatorColorsBase = observer(() => {
    const { values, setValues } = useThemeCreator();

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                type="color"
                label="Background color"
                name="backgroundColor"
                description="The background color of the app"
                required
                value={values.colors.background}
                allowGradient
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
                label="Surface Color"
                name="surfaceColor"
                description="This color gets applied to Cards (it automatically adapts to certain UI elements)"
                value={values.colors.surface}
                allowGradient
                // apiError={errors.surfaceColor}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: { ...values.colors, surface: color },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="Black Color"
                name="blackColor"
                description="The color to use for text and icons on a light background"
                value={values.colors.common.black}
                // apiError={errors.whiteColor}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            common: {
                                ...values.colors.common,
                                black: color,
                            },
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="White Color"
                name="whiteColor"
                description="The color to use for text and icons on a dark background"
                value={values.colors.common.white}
                // apiError={errors.whiteColor}
                fullWidth
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            common: {
                                ...values.colors.common,
                                white: color,
                            },
                        },
                    })
                }
            />
        </Stack>
    );
});
