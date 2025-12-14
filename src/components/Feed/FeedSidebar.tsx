import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores.ts";
import { Button, ButtonGroup } from "@mutualzz/ui-web";
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

export const FeedSidebar = () => {
    const app = useAppStore();
    return (
        <Paper
            elevation={app.preferEmbossed ? 1 : 0}
            borderLeft="0 !important"
            justifyContent="center"
            p={5}
            maxWidth="15rem"
            borderBottom="0 !important"
            flex={1}
        >
            <ButtonGroup
                orientation="vertical"
                color="neutral"
                variant="plain"
                spacing={1.25}
                size="lg"
                horizontalAlign="left"
            >
                {links.map((link) => (
                    <Button
                        key={`feed-sidebar-link-${link.label}`}
                        startDecorator={link.icon}
                    >
                        {link.label}
                    </Button>
                ))}
            </ButtonGroup>
        </Paper>
    );
};
