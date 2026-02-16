import { InputWithLabel } from "@components/InputWithLabel.tsx";

import {
    type ColorLike,
    createColor,
    extractColors,
    isValidGradient,
} from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { CiCircleInfo, CiWarning } from "react-icons/ci";
import { useAppStore } from "@hooks/useStores";

export const ThemeCreatorColorsBase = observer(() => {
    const app = useAppStore();
    const { values, setValues } = app.themeCreator;

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
                label="Surface Color"
                name="surfaceColor"
                description={
                    <>
                        This color gets applied to cards, sheets, and menus
                        <Typography
                            level="body-sm"
                            display="flex"
                            variant="plain"
                            color="info"
                            spacing={1}
                            alignItems="center"
                        >
                            <CiCircleInfo />
                            it automatically adapts to certain UI elements
                        </Typography>
                        <Typography
                            level="body-sm"
                            color="warning"
                            display="flex"
                            spacing={1}
                            variant="plain"
                            alignItems="center"
                        >
                            <CiWarning />
                            If you prefer using embossed style, I recommend
                            modifying this color
                        </Typography>
                    </>
                }
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
