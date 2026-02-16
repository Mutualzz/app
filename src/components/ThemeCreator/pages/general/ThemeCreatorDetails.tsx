import { InputWithLabel } from "@components/InputWithLabel.tsx";
import { Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";

export const ThemeCreatorDetails = observer(() => {
    const app = useAppStore();
    const { values, errors, setValues } = app.themeCreator;

    return (
        <Stack direction="column" p={4} spacing={5}>
            <InputWithLabel
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
