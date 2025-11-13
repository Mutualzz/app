import { useAppStore } from "@hooks/useStores";
import type { ThemeStyle, ThemeType } from "@mutualzz/types";
import {
    Divider,
    Option,
    Radio,
    RadioGroup,
    Select,
    Stack,
    useTheme,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { sortThemes } from "@utils/index";
import { observer } from "mobx-react";

export const ThemeSelector = observer(() => {
    const { style, theme, type, changeTheme, changeStyle, changeType } =
        useTheme();
    const app = useAppStore();

    const themes = Array.from(app.themes.themes.values())
        .filter((theme) => theme.type === type)
        .filter((theme) => theme.style === style);

    const handleThemeChange = (themeId: string) => {
        const changeTo = themes.find((theme) => theme.id === themeId);
        if (!changeTo) return;

        changeTheme(Theme.toEmotionTheme(changeTo));
    };
    return (
        <>
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                spacing={10}
            >
                <Divider>Color Type</Divider>
                <RadioGroup
                    variant="solid"
                    orientation="horizontal"
                    spacing={10}
                    value={type}
                    onChange={(_, typeToSet) =>
                        changeType(typeToSet as ThemeType)
                    }
                    size="sm"
                >
                    <Radio label="Dark" value="dark" />
                    <Radio label="Light" value="light" />
                    <Radio label="System" value="system" />
                </RadioGroup>
            </Stack>
            {type !== "system" && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Style</Divider>
                    <RadioGroup
                        variant="solid"
                        onChange={(_, styleToSet) => {
                            changeStyle(styleToSet as ThemeStyle);
                        }}
                        orientation="horizontal"
                        spacing={10}
                        value={style}
                    >
                        <Radio label="Normal" value="normal" />
                        <Radio label="Gradient" value="gradient" />
                    </RadioGroup>
                </Stack>
            )}
            {themes.length > 1 && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Scheme</Divider>
                    <Select
                        variant="solid"
                        onValueChange={(value) =>
                            handleThemeChange(value.toString())
                        }
                        value={theme.id}
                    >
                        {sortThemes(themes).map((theme) => (
                            <Option key={theme.id} value={theme.id}>
                                {theme.name}
                                {theme.author ? ` (by You)` : ""}
                            </Option>
                        ))}
                    </Select>
                </Stack>
            )}
        </>
    );
});
