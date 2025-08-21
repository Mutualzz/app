import { Divider, Paper } from "@mutualzz/ui";
import { motion } from "motion/react";
import type { PropsWithChildren } from "react";

const AnimatedPaper = motion.create(Paper);

export const PlaygroundRightSidebar = ({ children }: PropsWithChildren) => (
    <AnimatedPaper
        overflowY="auto"
        direction="column"
        p={20}
        spacing={5}
        minWidth="20%"
        initial={{
            x: 280,
        }}
        animate={{
            x: 0,
        }}
        css={{
            borderTopRightRadius: "2rem",
            borderBottomRightRadius: "2rem",
        }}
    >
        <Divider>Playground</Divider>
        {children}
    </AnimatedPaper>
);
