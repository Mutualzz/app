import { AnimatedPaper } from "@components/Animated/AnimatedPaper.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import {
    Box,
    Button,
    ButtonGroup,
    Link as MLink,
    Stack,
    Typography,
    type LinkProps,
} from "@mutualzz/ui-web";
import { useMemo, type MouseEvent } from "react";

interface Props {
    unsafe?: boolean;
}

export const OpenLink = ({ unsafe }: Props) => {
    const { closeModal } = useModal();

    return (
        <AnimatedPaper
            width="35rem"
            justifyContent="space-between"
            direction="column"
            height="15rem"
            alignItems="center"
        >
            {unsafe && (
                <>
                    <Typography
                        color="danger"
                        variant="plain"
                        level="h5"
                        fontWeight="bold"
                        mt={7}
                    >
                        This link seems to be unsafe
                    </Typography>
                    <Stack direction="column" alignItems="center" spacing={2}>
                        <Typography mx={5} textAlign="center">
                            The link you are trying to open uses an insecure
                            HTTP connection. This could potentially expose your
                            data to third parties.
                        </Typography>
                        <Typography fontWeight="bold">
                            Are you sure you want to proceed?
                        </Typography>
                    </Stack>
                </>
            )}
            <Box width="100%" mb={4} px={4}>
                <ButtonGroup fullWidth spacing={10}>
                    <Button variant="soft" color="success">
                        Proceed
                    </Button>
                    <Button
                        color="danger"
                        onClick={() =>
                            closeModal(
                                unsafe ? "open-link-unsafe" : "open-link",
                            )
                        }
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </Box>
        </AnimatedPaper>
    );
};

export const Link = ({ href, onClick, ...props }: LinkProps) => {
    const { openModal } = useModal();
    const url = useMemo(() => URL.parse(href || ""), [href]);
    const isHttp = useMemo(() => !!url && url.protocol === "http:", [url]);
    const isInternal = useMemo(
        () => !!url && url.hostname.endsWith("mutualzz.com"),
        [url],
    );

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!url) {
            onClick?.(e);
            return;
        }
        if (isHttp && !isInternal) {
            e?.preventDefault();
            openModal("open-link-unsafe", <OpenLink unsafe />);
            return;
        }
    };

    return <MLink onClick={handleClick} {...props} />;
};
