import { useTheme } from "@hooks/useTheme";
import {
    AspectRatio,
    Avatar,
    Badge,
    Button,
    Card,
    CardActions,
    CardContent,
    CardOverflow,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Drawer,
    IconButton,
    Input,
    LinearProgress,
    List,
    ListDivider,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator,
    Modal,
    ModalDialog,
    Option,
    Radio,
    RadioGroup,
    Select,
    Sheet,
    Slider,
    Snackbar,
    Stack,
    Switch,
    Tab,
    TabList,
    TabPanel,
    Tabs,
    Textarea,
    Typography,
    type ColorPaletteProp,
    type VariantProp,
} from "@mui/joy";
import { createLazyFileRoute } from "@tanstack/react-router";
import { themeNames, themes } from "@themes/index";
import startCase from "lodash/startCase";
import { useState } from "react";
import { MdMenu as MenuIcon } from "react-icons/md";
import { useMediaQuery } from "usehooks-ts";

const variants: VariantProp[] = ["solid", "soft", "outlined", "plain"];
const colors: ColorPaletteProp[] = [
    "primary",
    "neutral",
    "danger",
    "success",
    "warning",
];

const ThemeToggle = () => {
    const { mode, setMode } = useTheme();
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Light/Dark Mode</Typography>
            <Select value={mode} onChange={(_, val) => setMode(val)}>
                <Option value="light">Light</Option>
                <Option value="dark">Dark</Option>
                <Option value="system">System</Option>
            </Select>
        </Stack>
    );
};

const SelectTheme = () => {
    const { theme, setTheme } = useTheme();
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Theme</Typography>
            <Select
                value={theme}
                onChange={(_, val) => {
                    setTheme(val);
                }}
            >
                {Object.values(themes).map((theme, i) => (
                    <Option key={i} value={theme}>
                        {startCase(themeNames[i])}
                    </Option>
                ))}
            </Select>
        </Stack>
    );
};

export default function Showcase() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] =
        useState<VariantProp>("solid");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleModal = () => setIsModalOpen((prev) => !prev);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const { theme } = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const SidebarContent = (
        <List
            sx={{
                width: 140,
                flexShrink: 0,
                ...(isMobile
                    ? {}
                    : {
                          position: "sticky",
                          top: 100,
                          alignSelf: "flex-start",
                      }),
            }}
        >
            {variants.map((variant) => (
                <ListItem key={variant}>
                    <ListItemButton
                        selected={selectedVariant === variant}
                        onClick={() => {
                            setSelectedVariant(variant);
                            setSidebarOpen(false); // close drawer on mobile
                        }}
                    >
                        <ListItemContent>
                            {variant.charAt(0).toUpperCase() + variant.slice(1)}
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 8 }}>
            <Typography level="h1" textAlign="center" sx={{ mb: 4 }}>
                UI Showcase
            </Typography>

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack spacing={10} direction="row">
                    <ThemeToggle />
                    <SelectTheme />
                </Stack>
                {isMobile && (
                    <IconButton onClick={toggleSidebar}>
                        <MenuIcon />
                    </IconButton>
                )}
            </Stack>

            <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
                <Stack>{!isMobile && SidebarContent}</Stack>

                <Stack spacing={6} flex={1.5}>
                    {colors.map((color) => (
                        <Sheet
                            key={color}
                            sx={{
                                p: 3,
                                borderRadius: "md",
                                backgroundColor: "background.level1",
                            }}
                        >
                            <Typography level="h2" sx={{ mb: 2 }}>
                                {selectedVariant.toUpperCase()} -{" "}
                                {color.toUpperCase()}
                            </Typography>
                            <Stack spacing={4}>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    flexWrap="wrap"
                                >
                                    <Button
                                        variant={selectedVariant}
                                        color={color}
                                    >
                                        Button
                                    </Button>
                                    <Chip
                                        variant={selectedVariant}
                                        color={color}
                                    >
                                        Chip
                                    </Chip>
                                    <Avatar
                                        variant={selectedVariant}
                                        color={color}
                                    >
                                        A
                                    </Avatar>
                                    <Badge
                                        badgeContent={4}
                                        color={color}
                                        variant={selectedVariant}
                                    >
                                        <Avatar>A</Avatar>
                                    </Badge>
                                    <IconButton
                                        variant={selectedVariant}
                                        color={color}
                                    >
                                        ☆
                                    </IconButton>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    flexWrap="wrap"
                                >
                                    <Checkbox
                                        variant={selectedVariant}
                                        color={color}
                                        label="Check"
                                    />
                                    <RadioGroup>
                                        <Radio
                                            variant={selectedVariant}
                                            color={color}
                                            value="1"
                                            label="Radio"
                                        />
                                    </RadioGroup>
                                    <Switch
                                        variant={selectedVariant}
                                        color={color}
                                    />
                                </Stack>

                                <Stack spacing={2}>
                                    <Input
                                        placeholder="Input"
                                        variant={selectedVariant}
                                        color={color}
                                        fullWidth
                                    />
                                    <Textarea
                                        placeholder="Textarea"
                                        variant={selectedVariant}
                                        color={color}
                                    />
                                    <Select
                                        variant={selectedVariant}
                                        color={color}
                                        defaultValue="one"
                                    >
                                        <Option value="one">One</Option>
                                        <Option value="two">Two</Option>
                                    </Select>
                                </Stack>

                                <Slider
                                    variant={selectedVariant}
                                    color={color}
                                    defaultValue={50}
                                    sx={{ width: "100%" }}
                                />

                                <Stack direction="row" spacing={2}>
                                    <CircularProgress
                                        color={color}
                                        variant={
                                            selectedVariant === "plain"
                                                ? "soft"
                                                : selectedVariant
                                        }
                                    />
                                    <LinearProgress
                                        color={color}
                                        variant={
                                            selectedVariant === "plain"
                                                ? "soft"
                                                : selectedVariant
                                        }
                                        sx={{ width: 100 }}
                                    />
                                </Stack>

                                <Card
                                    variant={selectedVariant}
                                    color={color}
                                    sx={{ width: 320, boxShadow: 3 }}
                                >
                                    <CardOverflow>
                                        <AspectRatio ratio="21/9">
                                            <img
                                                src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fi.imgflip.com%2F49fwd7.jpg&sp=1744545580T035842bd2795d96929f6ecaaa257bfb11f228445a5f9a85f8c1d6c721160bea8"
                                                alt="Card Image"
                                            />
                                        </AspectRatio>
                                    </CardOverflow>
                                    <CardContent>
                                        <Typography level="title-md">
                                            Card {selectedVariant}
                                        </Typography>
                                        <Typography level="body-sm">
                                            This is a card showcase.
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant={selectedVariant}
                                            color={color}
                                        >
                                            Action
                                        </Button>
                                    </CardActions>
                                </Card>

                                <Sheet
                                    variant={selectedVariant}
                                    color={color}
                                    sx={{ p: 3, boxShadow: 2 }}
                                >
                                    <Typography>Sheet Content</Typography>
                                </Sheet>

                                <List
                                    variant={selectedVariant}
                                    sx={{ maxWidth: 300 }}
                                >
                                    <ListItem>
                                        <ListItemDecorator>
                                            ⭐
                                        </ListItemDecorator>
                                        <ListItemContent>
                                            List Item 1
                                        </ListItemContent>
                                    </ListItem>
                                    <ListDivider />
                                    <ListItem>
                                        <ListItemDecorator>
                                            🔥
                                        </ListItemDecorator>
                                        <ListItemContent>
                                            List Item 2
                                        </ListItemContent>
                                    </ListItem>
                                </List>

                                <Tabs
                                    variant={selectedVariant}
                                    defaultValue={0}
                                >
                                    <TabList>
                                        <Tab>Tab One</Tab>
                                        <Tab>Tab Two</Tab>
                                    </TabList>
                                    <TabPanel value={0}>Panel One</TabPanel>
                                    <TabPanel value={1}>Panel Two</TabPanel>
                                </Tabs>

                                <Divider>Divider</Divider>
                            </Stack>
                        </Sheet>
                    ))}

                    <Snackbar open>Snackbar message</Snackbar>

                    <Button
                        onClick={toggleModal}
                        sx={{ alignSelf: "center", px: 4 }}
                    >
                        Open Modal
                    </Button>

                    <Modal open={isModalOpen} onClose={toggleModal}>
                        <ModalDialog sx={{ p: 3 }}>
                            <Typography level="h4">Modal Title</Typography>
                            <Typography>
                                This is a modal content example.
                            </Typography>
                            <Button onClick={toggleModal} sx={{ mt: 2 }}>
                                Close
                            </Button>
                        </ModalDialog>
                    </Modal>
                </Stack>
            </Stack>

            {/* Responsive Sidebar Drawer */}
            <Drawer open={sidebarOpen} onClose={toggleSidebar} anchor="left">
                {SidebarContent}
            </Drawer>
        </Container>
    );
}

export const Route = createLazyFileRoute("/ui")({
    component: Showcase,
});
