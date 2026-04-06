import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useState } from "react";
import { Stack } from "@mutualzz/ui-web";
import startCase from "lodash-es/startCase";
import styled from "@emotion/styled";
import EmojisTab from "./EmojisTab.tsx";

type Tab = "emojis" | "stickers";

const tabs: Tab[] = ["emojis", "stickers"];

interface TabProps extends PropsWithChildren {
    selected: boolean;
}

const Tab = styled("div")<TabProps>(({ theme, selected }) => ({
    ...(selected && {
        borderBottom: `1px solid ${theme.typography.colors.accent}`,
        borderRadius: 6,
    }),
    userSelect: "none",
    cursor: "pointer",
    padding: "5px 10px",
    ...(!selected && {
        "&:hover": {
            borderBottom: `1px solid ${theme.typography.colors.muted}`,
            borderRadius: 6,
        },
    }),
}));

export const UserExpressionsSettings = observer(() => {
    const [currentTab, setCurrentTab] = useState<Tab>("emojis");

    return (
        <Stack direction="column" width="100%" height="100%">
            <Stack direction="row" gap={5} mb={2}>
                {tabs.map((tab) => (
                    <Tab
                        onClick={() => setCurrentTab(tab)}
                        selected={currentTab === tab}
                    >
                        {startCase(tab)}
                    </Tab>
                ))}
            </Stack>
            {currentTab === "emojis" && <EmojisTab />}
        </Stack>
    );
});
