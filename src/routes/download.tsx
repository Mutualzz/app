import { LinearProgress, Stack } from "@mutualzz/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { detectDownloadURL } from "@utils/detect";
import { isMobile, isTauri } from "@utils/index";
import { useEffect } from "react";

export const Route = createFileRoute("/download")({
    component: DownloadAndRedirect,
});

function DownloadAndRedirect() {
    const navigate = useNavigate();
    const fileUrl = detectDownloadURL();

    useEffect(() => {
        if (fileUrl && (!isTauri || !isMobile)) {
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = "";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Add a short delay before navigating
            const timeout = setTimeout(() => {
                navigate({ to: "/", replace: true });
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [fileUrl, navigate]);

    if (!isTauri || !isMobile) return null;

    return (
        <Stack
            direction="column"
            height="100vh"
            width="100vw"
            justifyContent="center"
            alignItems="center"
            spacing={5}
        >
            Downloading...
            <LinearProgress />
        </Stack>
    );
}
