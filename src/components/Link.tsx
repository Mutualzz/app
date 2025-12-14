import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores.ts";
import {
    Box,
    Button,
    ButtonGroup,
    Link as MLink,
    Stack,
    Typography,
    type LinkProps,
} from "@mutualzz/ui-web";
import { useNavigate } from "@tanstack/react-router";
import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauri, toSpotifyUri } from "@utils/index.ts";
import { useMemo, type MouseEvent } from "react";

interface Props {
    url: URL;
    unsafe?: boolean;
}

export const OpenLink = ({ url, unsafe }: Props) => {
    const { closeModal } = useModal();
    const app = useAppStore();

    const handleProceed = async () => {
        const urlStr = url.toString();
        if (isTauri) {
            await openUrl(toSpotifyUri(url) ?? urlStr);
            closeModal(unsafe ? "open-link-unsafe" : "open-link");
            return;
        }

        window.open(urlStr, "_blank", "noopener,noreferrer");
        closeModal(unsafe ? "open-link-unsafe" : "open-link");
    };

    if (isTauri && unsafe)
        return (
            <AnimatedPaper
                width="35rem"
                justifyContent="space-between"
                direction="column"
                elevation={app.preferEmbossed ? 5 : 1}
                height="15rem"
                alignItems="center"
                py={4}
            >
                <Typography mt={15} textAlign="center" color="warning">
                    We do not allow opening unsafe links directly in the app for
                    your security. Please copy the link and open it in your web
                    browser.
                </Typography>
                <Stack width="80%" spacing={2}>
                    <Button
                        onClick={() => closeModal("open-link-unsafe")}
                        fullWidth
                    >
                        Close
                    </Button>
                </Stack>
            </AnimatedPaper>
        );

    return (
        <AnimatedPaper
            width="35rem"
            justifyContent="space-between"
            direction="column"
            elevation={app.preferEmbossed ? 5 : 1}
            height="15rem"
            alignItems="center"
        >
            {unsafe && !isTauri && (
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
            {!unsafe && (
                <>
                    <Typography level="h5" fontWeight="bold" mt={7}>
                        Open External Link
                    </Typography>
                    <Stack direction="column" alignItems="center" spacing={2}>
                        <Typography mx={5} textAlign="center">
                            You are about to open an external link:
                        </Typography>
                        <Typography fontWeight="bold" textAlign="center">
                            {url.toString()}
                        </Typography>
                    </Stack>
                </>
            )}
            =
            <Box width="100%" mb={4} px={4}>
                <ButtonGroup fullWidth spacing={10}>
                    <Button
                        onClick={handleProceed}
                        variant="soft"
                        color="success"
                    >
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
    const navigate = useNavigate();
    const url = useMemo(() => URL.parse(href || ""), [href]);
    const isUnsafe = useMemo(
        () =>
            !!url &&
            (url.protocol === "http:" || url.host.startsWith("localhost")),
        [url],
    );
    const isInternal = useMemo(
        () => !!url && url.hostname.endsWith("mutualzz.com"),
        [url],
    );

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!url) {
            onClick?.(e);
            return;
        }

        e.preventDefault();

        if (isUnsafe && !isInternal) {
            openModal("open-link-unsafe", <OpenLink url={url} unsafe />);
            return;
        }

        if (isInternal) {
            const path = url.pathname + url.search + url.hash;
            navigate({ to: path });
            return;
        }

        openModal("open-link", <OpenLink url={url} />);
        onClick?.(e);
    };

    return <MLink href={href} onClick={handleClick} {...props} />;
};
