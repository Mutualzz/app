import { Paper } from "@components/Paper";
import {
    useThemeCreator,
    type ThemeSelectedType,
} from "@contexts/ThemeCreator.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Option,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { sortThemes } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

export const ThemeCreatorSidebarRight = observer(() => {
    const app = useAppStore();
    const { selectedType, setSelectedType, resetValues, values, setValues } =
        useThemeCreator();
    const [themes, setThemes] = useState<Theme[]>(
        app.themes.all.filter((theme) => !theme.author),
    );

    useEffect(() => {
        switch (selectedType) {
            case "custom": {
                setThemes(app.themes.all.filter((theme) => theme.authorId));
                break;
            }
            case "draft": {
                setThemes(
                    app.drafts.themes.map((draft) =>
                        Theme.toThemeObject(draft, app),
                    ),
                );
                break;
            }
            case "default":
            default: {
                setThemes(app.themes.all.filter((theme) => !theme.author));
                break;
            }
        }
    }, [selectedType]);

    const handleChange = (value: any) => {
        const theme = themes.find((theme) => theme.id === value);
        if (!theme) return;

        setValues(Theme.toEmotionTheme(theme));
    };

    return (
        <Paper
            direction="column"
            width={200}
            height="100%"
            elevation={app.preferEmbossed ? 5 : 0}
            borderTop="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
            p={{ xs: "0.75rem", sm: "1rem" }}
            justifyContent="space-between"
        >
            <Stack direction="column" spacing={2}>
                <Stack direction="column">
                    <ButtonGroup fullWidth spacing={5}>
                        <Button color="danger" onClick={() => resetValues()}>
                            Reset
                        </Button>
                        <Button>Preview</Button>
                    </ButtonGroup>
                </Stack>
                <Divider
                    css={{
                        filter: "opacity(0.25)",
                    }}
                    lineColor="muted"
                />
                <Stack direction="column" spacing={2.5}>
                    <Typography textAlign="center">Load Theme</Typography>
                    <RadioGroup
                        value={selectedType}
                        onChange={(_, value) =>
                            setSelectedType(value as ThemeSelectedType)
                        }
                        spacing={5}
                        orientation="vertical"
                    >
                        <Radio value="default" label="Default" />
                        <Radio value="draft" label="Draft" />
                        <Radio value="custom" label="Custom" />
                    </RadioGroup>
                </Stack>
                <Divider
                    css={{
                        filter: "opacity(0.25)",
                    }}
                    lineColor="muted"
                />
                <Select
                    onValueChange={handleChange}
                    color="primary"
                    placeholder="Pick a theme"
                    disabled={themes.length === 0}
                    value={values.id || values.name || undefined}
                >
                    {sortThemes(themes).map((theme) => (
                        <Option key={theme.id} value={theme.id} variant="soft">
                            {theme.name}
                        </Option>
                    ))}
                </Select>
            </Stack>

            <Stack direction="column">
                <ButtonGroup fullWidth spacing={5}>
                    <Button color="warning">Save</Button>
                    <Button color="success">Publish</Button>
                </ButtonGroup>
            </Stack>
        </Paper>
    );
});
