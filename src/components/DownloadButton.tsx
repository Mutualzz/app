import { Button, type ButtonProps } from "@mutualzz/ui-web";
import { detectDownloadURL } from "@utils/detect";

export const DownloadButton = (props: ButtonProps) => {
    const fileUrl = detectDownloadURL();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (fileUrl) {
            window.open(fileUrl, "_self", "noopener, noreferrer");
        }
    };

    return (
        <Button {...props} onClick={handleClick}>
            Download Mutualzz
        </Button>
    );
};
