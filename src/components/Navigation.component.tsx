import { Avatar, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";

const Navigation = () => {
    return (
        <Stack justifyContent="space-between" pt={1} px={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
                <Avatar
                    src="/logo.png"
                    alt="logo"
                    sx={{
                        width: 64,
                        height: 64,
                    }}
                />
                <Typography fontWeight="bold" variant="h6">
                    Mutualzz
                </Typography>
            </Stack>
        </Stack>
    );
};

export default Navigation;
