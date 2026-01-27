import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    ButtonGroup,
    Checkbox,
    Divider,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react-lite";
import { Fragment, type JSX, useMemo } from "react";
import { CiTextAlignJustify, CiWarning } from "react-icons/ci";
import { FaPalette } from "react-icons/fa6";
import { IoText } from "react-icons/io5";
import type {
    ThemeCreatorCategory,
    ThemeCreatorPage,
} from "@stores/ThemeCreator.store";

interface ThemeCreatorSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

interface Pages {
    label: ThemeCreatorPage;
    icon: JSX.Element;
}

type ThemeCreatorPages = Record<ThemeCreatorCategory, Pages[]>;

// TODO: Work on making adaptive mode change the available pages and inputs
// TODO: and also work on new adaptive theme generation algorithm
export const ThemeCreatorSidebarLeft = observer(
    ({ drawerOpen, setDrawerOpen }: ThemeCreatorSidebarProps) => {
        const app = useAppStore();

        const {
            values,
            setValues,
            currentPage,
            setCurrentPage,
            setCurrentCategory,
        } = app.themeCreator;

        const handlePageSwitch = (
            category: ThemeCreatorCategory,
            page: ThemeCreatorPage,
        ) => {
            setCurrentPage(page);
            setCurrentCategory(category);
            if (drawerOpen && setDrawerOpen) setDrawerOpen(false);
        };

        const creatorPages = useMemo<ThemeCreatorPages>(
            () => ({
                general: [
                    {
                        label: "details",
                        icon: <CiTextAlignJustify />,
                    },
                ],
                colors: values.adaptive
                    ? [
                          {
                              label: "adaptive",
                              icon: <FaPalette />,
                          },
                      ]
                    : [
                          {
                              label: "base",
                              icon: <FaPalette />,
                          },
                          {
                              label: "feedback",
                              icon: <CiWarning />,
                          },
                          {
                              label: "typography",
                              icon: <IoText />,
                          },
                      ],
            }),
            [values.adaptive],
        );

        const categories = Object.entries(creatorPages);

        return (
            <Paper
                direction="column"
                width="15em"
                height="100%"
                elevation={app.settings?.preferEmbossed ? 5 : 0}
                borderTop="0 !important"
                borderLeft="0 !important"
                borderBottom="0 !important"
                px={2.5}
                pt={5}
                spacing={5}
            >
                <Stack alignItems="center" direction="column">
                    <Checkbox
                        label="Automatically Adapt Colors"
                        checked={values.adaptive}
                        size="sm"
                        onChange={(e) => {
                            setValues({ adaptive: e.target.checked });
                            setCurrentPage("details");
                            setCurrentCategory("general");
                        }}
                    />
                </Stack>

                <Stack direction="column" spacing={2.5}>
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
                                            disabled={
                                                currentPage === page.label
                                            }
                                        >
                                            {startCase(page.label)}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </Stack>
                            {index < categories.length - 1 && (
                                <Divider
                                    css={{
                                        opacity: 0.25,
                                    }}
                                    lineColor="muted"
                                />
                            )}
                        </Fragment>
                    ))}
                </Stack>
            </Paper>
        );
    },
);
