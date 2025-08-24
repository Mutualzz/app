import { CircularProgress, Stack, useTheme } from "@mutualzz/ui";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react";
import { Logo } from "../Logo";

const Loading = () => {
    const { theme } = useTheme();

    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("sm").replace("@media", ""),
    );

    return (
        <Stack
            direction="column"
            alignItems="center"
            height="100%"
            justifyContent="center"
        >
            <CircularProgress
                strokeWidth="lg"
                color="success"
                size={{ xs: 120, sm: 180, md: 272 }}
            >
                <Logo
                    css={{
                        width: isMobileQuery ? 128 : 256,
                        maxWidth: 256,
                        minWidth: 64,
                        height: "auto",
                    }}
                />
            </CircularProgress>
        </Stack>
    );
};

export default observer(Loading);
