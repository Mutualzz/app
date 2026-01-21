import { InputWithLabel } from "@components/InputWIthLabel";
import { useThemeCreator } from "@contexts/ThemeCreator.context";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const ThemeCreatorColorsTypography = observer(() => {
    const { values, setValues } = useThemeCreator();

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                type="color"
                label="Primary Text Color"
                name="typographyPrimaryColor"
                description="The primary color for texts, usually white-ish is used on dark backgrounds and black-ish on light backgrounds"
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
            <InputWithLabel
                type="color"
                label="Primary Text Color"
                name="typographySecondaryColor"
                description="Used for less important text"
                required
                value={values.typography.colors.secondary}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        typography: {
                            ...values.typography,
                            colors: {
                                ...values.typography.colors,
                                secondary: color,
                            },
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="Accent Text Color"
                name="typographyAccentColor"
                description="Used for accentuating important texts"
                required
                value={values.typography.colors.accent}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        typography: {
                            ...values.typography,
                            colors: {
                                ...values.typography.colors,
                                accent: color,
                            },
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                label="Muted Text Color"
                name="typographyMutedColor"
                description="Used for muted texts"
                required
                value={values.typography.colors.muted}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        typography: {
                            ...values.typography,
                            colors: {
                                ...values.typography.colors,
                                muted: color,
                            },
                        },
                    })
                }
                fullWidth
            />
        </Stack>
    );
});
