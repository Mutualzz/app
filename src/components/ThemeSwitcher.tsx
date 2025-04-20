import { useTheme } from "@hooks/useTheme";
import { Box, Divider, Option, Select, Stack, Typography } from "@mui/joy";
import { themes } from "../themes";

export const ThemeSwitcher = () => {
    const { themeName, setThemeName, mode, setMode } = useTheme();

    return (
        <Stack spacing={2}>
            <Typography level="h4">App Theme</Typography>
            <Select
                defaultValue={mode}
                onChange={(_, val) => {
                    if (val) setMode(val);
                }}
            >
                <Option value="light">Light</Option>
                <Option value="dark">Dark</Option>
                <Option value="system">System</Option>
            </Select>

            <Divider />

            <Typography level="h4">Color Scheme</Typography>
            <Select
                defaultValue={themeName}
                onChange={(_, val) => {
                    if (val && val in themes) setThemeName(val);
                }}
            >
                {Object.entries(themes).map(([key, { name, previewColor }]) => (
                    <Option key={key} value={key}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    backgroundColor: previewColor,
                                    border: "1px solid #ccc",
                                }}
                            />
                            {name}
                        </Box>
                    </Option>
                ))}
            </Select>
        </Stack>
    );
};
