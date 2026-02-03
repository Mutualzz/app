export const blockNavHotkeys = () => {
    const handler = (e: KeyboardEvent) => {
        // Don’t steal shortcuts while typing
        const el = e.target as HTMLElement | null;
        const isTyping =
            el?.tagName === "INPUT" ||
            el?.tagName === "TEXTAREA" ||
            el?.isContentEditable;

        if (isTyping) return;

        if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            e.preventDefault();
            // no stopPropagation()
        }
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () =>
        window.removeEventListener("keydown", handler, { capture: true });
};
