import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useThemeCreator } from "@contexts/ThemeCreator.context";
import { useAppStore } from "@hooks/useStores";
import { IconButton, Stack, Typography } from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { FaX } from "react-icons/fa6";
import { ThemeCreatorSidebarRight } from "./ThemeCreatorSidebar.right";
import { ThemeCreatorColorsBase } from "./pages/colors/ThemeCreatorColorsBase";
import { ThemeCreatorDetails } from "./pages/general/ThemeCreatorDetails";

export const ThemeCreatorContent = observer(() => {
    const app = useAppStore();
    const { currentCategory, currentPage, currentType, currentStyle } =
        useThemeCreator();
    const { closeModal } = useModal();

    return (
        <Stack
            flex={1}
            height="100%"
            overflow="auto"
            width="100%"
            direction="column"
        >
            <Paper
                borderTopRightRadius={{
                    xs: "0.75rem",
                    sm: "1.25rem",
                    md: "1.5rem",
                }}
                px={{ xs: "0.5rem", sm: 3 }}
                py={{ xs: "0.5rem", sm: 4 }}
                borderLeftWidth="0px !important"
                elevation={app.preferEmbossed ? 3 : 1}
                justifyContent="space-between"
                borderTop="0 !important"
                borderLeft="0 !important"
            >
                <Stack alignItems="center" justifyContent="center" spacing={10}>
                    <Typography
                        level={{ xs: "h6", sm: "body-lg" }}
                        fontFamily="monospace"
                        textAlign="center"
                    >
                        {currentCategory === "general" ? "Theme " : ""}
                        {startCase(currentPage)}
                        {currentCategory !== "general"
                            ? ` ${startCase(currentCategory)}`
                            : ""}
                    </Typography>
                    <Typography
                        level={{ xs: "h6", sm: "body-lg" }}
                        fontFamily="monospace"
                        textAlign="center"
                    >
                        {startCase(currentType)} {startCase(currentStyle)} Theme
                    </Typography>
                </Stack>
                <IconButton
                    color="neutral"
                    css={{
                        marginRight: "0.5rem",
                    }}
                    variant="plain"
                    size="sm"
                    onClick={() => closeModal("theme-creator")}
                >
                    <FaX />
                </IconButton>
            </Paper>

            <Stack direction="row" flex={1}>
                <Paper
                    flex={1}
                    height="100%"
                    overflow="auto"
                    width="100%"
                    elevation={app.preferEmbossed ? 2 : 1}
                    direction="column"
                    px={{ xs: "0.5rem", sm: 3 }}
                    borderTop="0 !important"
                    borderLeft="0 !important"
                    borderBottom="0 !important"
                    py={{ xs: "0.5rem", sm: 1 }}
                >
                    {currentPage === "details" && <ThemeCreatorDetails />}
                    {currentPage === "base" && <ThemeCreatorColorsBase />}
                </Paper>

                <ThemeCreatorSidebarRight />
            </Stack>
        </Stack>
    );
});
