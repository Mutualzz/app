import { Button, ButtonGroup, Paper } from "@mutualzz/ui-web";
import { FaCompass, FaHome, FaPalette, FaStar, FaUsers } from "react-icons/fa";

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
                <Button startDecorator={<FaHome />}>My Profile</Button>
                <Button startDecorator={<FaUsers />}>Friends</Button>
                <Button startDecorator={<FaStar />}>Favorites</Button>
                <Button startDecorator={<FaCompass />}>
                    Explore / Discover
                </Button>
                <Button startDecorator={<FaPalette />}>
                    Customize Profile
                </Button>
            </ButtonGroup>
        </Paper>
    );
};
