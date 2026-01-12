import { useThemeCreator } from "@contexts/ThemeCreator.context";
import { observer } from "mobx-react-lite";

export const ThemeCreatorColorsTypography = observer(() => {
    const { values, setValues, setCurrentStyle, setCurrentType } =
        useThemeCreator();

    return <></>;
});
