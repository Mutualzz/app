import { Button } from "@mutualzz/ui";
import { detectDownloadURL } from "@utils/detect";

export const DownloadButton = () => {
    const fileUrl = detectDownloadURL();

    return (
        <a href={fileUrl} rel="noopener noreferrer">
            <Button color="neutral">Download App</Button>
        </a>
    );
};
