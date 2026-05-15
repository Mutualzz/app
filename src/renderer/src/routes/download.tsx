import { LinearProgress, Stack } from "@mutualzz/ui-web";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { detectDownloadURL } from "@utils/detect";
import { useEffect } from "react";
import { isElectron } from "@utils/index";

export const Route = createFileRoute("/download")({
    component: DownloadAndRedirect
});

function DownloadAndRedirect() {
    const navigate = useNavigate();
    const fileUrl = detectDownloadURL();

    useEffect(() => {
        if (fileUrl && !isElectron) {
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

        return () => {};
    }, [fileUrl, navigate]);

    if (isElectron) return <Navigate to="/" replace />;

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
