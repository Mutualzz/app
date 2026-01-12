import { Paper } from "@components/Paper";
import {
    useThemeCreator,
    type ThemeCreatorCategory,
    type ThemeCreatorPage,
} from "@contexts/ThemeCreator.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Divider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX } from "react";
import { CiTextAlignJustify } from "react-icons/ci";
import { FaPalette } from "react-icons/fa6";
import { IoText } from "react-icons/io5";

interface ThemeCreatorSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: ThemeCreatorPage;
    icon: JSX.Element;
}

type ThemeCreatorPages = Record<ThemeCreatorCategory, Pages[]>;

const creatorPages: ThemeCreatorPages = {
    general: [
        {
            label: "details",
            icon: <CiTextAlignJustify />,
        },
    ],
    colors: [
        {
            label: "base",
            icon: <FaPalette />,
        },
        {
            label: "typography",
            icon: <IoText />,
        },
    ],
};

export const ThemeCreatorSidebarLeft = observer(
    ({ drawerOpen, setDrawerOpen }: ThemeCreatorSidebarProps) => {
        const app = useAppStore();

        const { currentPage, setCurrentPage, setCurrentCategory } =
            useThemeCreator();

        const handlePageSwitch = (
            category: ThemeCreatorCategory,
            page: ThemeCreatorPage,
        ) => {
            setCurrentPage(page);
            setCurrentCategory(category);
            if (drawerOpen && setDrawerOpen) setDrawerOpen(false);
        };

        const categories = Object.entries(creatorPages);

        return (
            <Paper
                direction="column"
                width="8rem"
                height="100%"
                elevation={app.preferEmbossed ? 5 : 0}
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
                px={2.5}
                pt={15}
                spacing={2}
            >
                {categories.map(([category, pages], index) => (
                    <Fragment
                        key={`theme-creator-sidebar-category-${category}`}
                    >
                        <Stack direction="column">
                            <Typography
                                level="body-sm"
                                textColor="muted"
                                mb={1.25}
                            >
                                {startCase(category)}
                            </Typography>
                            <ButtonGroup
                                color="neutral"
                                orientation="vertical"
                                variant="plain"
                                spacing={5}
                                horizontalAlign="left"
                            >
                                {pages.map((page) => (
                                    <Button
                                        startDecorator={page.icon}
                                        onClick={() =>
                                            handlePageSwitch(
                                                category as ThemeCreatorCategory,
                                                page.label,
                                            )
                                        }
                                        key={`user-settings-sidebar-${page.label}`}
                                        variant={
                                            currentPage === page.label
                                                ? "soft"
                                                : "plain"
                                        }
                                        padding={5}
                                        disabled={currentPage === page.label}
                                    >
                                        {startCase(page.label)}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Stack>
                        {index < categories.length - 1 && (
                            <Divider
                                css={{
                                    filter: "opacity(0.25)",
                                }}
                                lineColor="muted"
                            />
                        )}
                    </Fragment>
                ))}
            </Paper>
        );
    },
);
