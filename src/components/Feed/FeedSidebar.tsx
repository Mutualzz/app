import { Button, ButtonGroup, Paper } from "@mutualzz/ui-web";
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
    return (
        <Paper
            elevation={2}
            justifyContent="center"
            p={20}
            maxWidth="15rem"
            flex={1}
        >
            <ButtonGroup
                orientation="vertical"
                color="neutral"
                variant="plain"
                spacing={5}
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
