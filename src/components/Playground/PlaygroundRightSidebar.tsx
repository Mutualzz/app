import { Divider, Paper } from "@mutualzz/ui";
import type { PropsWithChildren } from "react";

export const PlaygroundRightSidebar = ({ children }: PropsWithChildren) => (
    <Paper
        overflowY="auto"
        direction="column"
        p={20}
        spacing={5}
        minWidth="20%"
        css={{
            borderTopRightRadius: "2rem",
            borderBottomRightRadius: "2rem",
        }}
    >
        <Divider>Playground</Divider>
        {children}
    </Paper>
);
