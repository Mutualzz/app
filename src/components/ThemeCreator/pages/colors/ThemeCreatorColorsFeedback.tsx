import { InputWithLabel } from "@components/InputWIthLabel";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { CiCircleInfo } from "react-icons/ci";
import { useAppStore } from "@hooks/useStores";

export const ThemeCreatorColorsFeedback = observer(() => {
    const app = useAppStore();
    const { values, setValues } = app.themeCreator;

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                type="color"
                label="Primary Color"
                name="primaryColor"
                description={
                    <>
                        Usually used to indicate the primary action or important
                        elements
                        <Typography
                            level="body-sm"
                            display="flex"
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
                name="neutralColor"
                label="Neutral Color"
                description="Usually used to indicate a neutral or inactive state"
                required
                value={values.colors.neutral}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            neutral: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                name="successColor"
                label="Success Color"
                description="Usually used to indicate a successful or positive action"
                required
                value={values.colors.success}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            success: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                name="dangerColor"
                label="Danger Color"
                description="Usually used to indicate errors and failure within the app"
                value={values.colors.danger}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            danger: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                name="warningColor"
                label="Warning Color"
                description="Usually used to indicate caution and requires user attention"
                value={values.colors.warning}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            warning: color,
                        },
                    })
                }
                fullWidth
            />
            <InputWithLabel
                type="color"
                name="infoColor"
                label="Info Color"
                description="Usually used to indicate additional information"
                value={values.colors.info}
                onChange={(color: ColorLike) =>
                    setValues({
                        ...values,
                        colors: {
                            ...values.colors,
                            info: color,
                        },
                    })
                }
                fullWidth
            />
        </Stack>
    );
});
