import { AnimatedLogo } from "@components/Animated/AnimatedLogo";
import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { useAppStore } from "@hooks/useStores";
import { ButtonGroup, IconButton, Stack, Tooltip } from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import capitalize from "lodash-es/capitalize";
import { observer } from "mobx-react-lite";
import { FaCompass, FaHome, FaPalette, FaStar, FaUsers } from "react-icons/fa";

const links = [
    {
        label: "My Profile",
        icon: <FaHome />,
    },
    {
        label: "Friends",
        icon: <FaUsers />,
    },
    {
        label: "Favorites",
        icon: <FaStar />,
    },
    {
        label: "Explore / Discover",
        icon: <FaCompass />,
    },
    {
        label: "Customize Profile",
        icon: <FaPalette />,
    },
];

export const FeedSidebar = observer(() => {
    const app = useAppStore();
    const navigate = useNavigate();

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 1 : 0}
            width="5rem"
            direction="column"
            pt={1}
            spacing={2.5}
            variant="plain"
            alignItems="center"
            boxShadow="none !important"
            height="100%"
        >
            <Stack width="100%" alignItems="center" justifyContent="center">
                <Tooltip
                    title={
                        <TooltipWrapper>
                            Switch to{" "}
                            {capitalize(
                                app.mode
                                    ? "Direct Messages"
                                    : (app.settings?.preferredMode ?? "Spaces"),
                            )}
                        </TooltipWrapper>
                    }
                    placement="right"
                >
                    <AnimatedLogo
                        css={{
                            width: 48,
                            cursor: "pointer",
                            marginBottom: 5,
                        }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => {
                            navigate({
                                to: app.mode
                                    ? "/@me"
                                    : `/${app.settings?.preferredMode ?? "spaces"}`,
                                replace: true,
                            });
                        }}
                    />
                </Tooltip>
            </Stack>

            <ButtonGroup
                orientation="vertical"
                color="neutral"
                variant="plain"
                spacing={15}
                size="lg"
            >
                {links.map((link) => (
                    <Tooltip
                        title={<TooltipWrapper>{link.label}</TooltipWrapper>}
                        placement="right"
                        key={link.label}
                    >
                        <IconButton key={`feed-sidebar-link-${link.label}`}>
                            {link.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </ButtonGroup>
        </Paper>
    );
});
