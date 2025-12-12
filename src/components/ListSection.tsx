import { Box, Stack, Typography } from "@mutualzz/ui-web";
import { type ReactNode, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

interface Props {
    name: string;
    items: ReactNode[];
}

export const ListSection = (props: Props) => {
    const [open, setOpen] = useState(true);
    const toggle = () => setOpen((prev) => !prev);

    return (
        <Box p="24px 8px 0 8px">
            <Typography
                role="button"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                fontSize={12}
                fontWeight="bold"
                textColor="secondary"
                onClick={toggle}
                css={{
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                {props.name}
                {open ? <FaChevronDown /> : <FaChevronRight />}
            </Typography>
            {open && (
                <Stack mt="4px" direction="column">
                    {...props.items}
                </Stack>
            )}
        </Box>
    );
};
