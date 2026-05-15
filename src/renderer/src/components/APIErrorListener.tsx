import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { RateLimitError } from "./Errors/RateLimit";

export const APIErrorListener = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();

    useEffect(() => {
        app.rest.on("rateLimited", () => {
            openModal("rateLimitError", <RateLimitError />, {
                disableBackdropClick: true,
            });
        });

        return () => {
            app.rest.off("rateLimited", () => {});
        };
    }, []);

    return null;
});
