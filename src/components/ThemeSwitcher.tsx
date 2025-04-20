import { useTheme } from "@hooks/useTheme";
import { Box, Option, Select, Stack, Typography } from "@mui/joy";
import { themes } from "../themes";

export const ThemeSwitcher = () => {
    const { themeName, setThemeName } = useTheme();

    return (
        <Stack spacing={2}>
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
