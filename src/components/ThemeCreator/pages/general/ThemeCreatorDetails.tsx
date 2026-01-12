import { InputWithLabel } from "@components/InputWIthLabel";
import { useThemeCreator } from "@contexts/ThemeCreator.context";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";

export const ThemeCreatorDetails = observer(() => {
    const { values, errors, setValues } = useThemeCreator();

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
                key={values.name}
                label="Theme Name"
                name="name"
                description="A unique name for your theme"
                required
                value={values.name}
                apiError={errors.name}
                onChange={(e: any) =>
                    setValues({ ...values, name: e.target.value })
                }
            />
            <InputWithLabel
                key={values.description}
                label="Theme Description"
                name="description"
                description="A brief description of your theme"
                value={values.description ?? ""}
                apiError={errors.description}
                onChange={(e: any) =>
                    setValues({ ...values, description: e.target.value })
                }
            />
        </Stack>
    );
});
