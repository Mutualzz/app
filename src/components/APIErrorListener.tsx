import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { RateLimitError } from "./Errors/RateLimit";

export const APIErrorListener = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();

    useEffect(() => {
        app.rest.on("rateLimited", () => {
            openModal("rateLimitError", <RateLimitError />, {
                showCloseButton: false,
            });
        });
    }, []);

    return null;
});
