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
import { useEffect } from "react";

export const ThemeCreatorColorsBase = observer(() => {
    const { values, setValues, setCurrentStyle, setCurrentType } =
        useThemeCreator();

    useEffect(() => {
        console.log("Current colors:", values.colors);
    }, [values]);

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                key={values.colors.background}
                type="color"
                label="Background color"
                name="backgroundColor"
                description="The background color of the app"
                required
                value={values.colors.background}
                allowGradient
                // apiError={errors.backgroundColor}
                onChangeResult={(result) => {
                    const val = result.hex;
                    let isDark = false;
                    if (
                        isValidGradient(val) &&
                        extractColors(val) &&
                        extractColors(val)!.length > 0
                    ) {
                        isDark = createColor(extractColors(val)![0]).isDark();
                        setCurrentStyle("gradient");
                    } else {
                        setCurrentStyle("normal");
                        isDark = createColor(val).isDark();
                    }

                    setCurrentType(isDark ? "dark" : "light");
                }}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            background: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                key={values.colors.surface}
                type="color"
                label="Surface Color"
                name="surfaceColor"
                description="This color gets applied to Cards (it automatically adapts to certain UI elements)"
                value={values.colors.surface}
                allowAlpha
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
                key={values.colors.common.black}
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
                key={values.colors.common.white}
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
