export function blockMouseHotkeys() {
    const handler = (e: MouseEvent) => {
        // 3 = back, 4 = forward
        if (e.button === 3 || e.button === 4) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    window.addEventListener("pointerdown", handler, { capture: true });
    window.addEventListener("mousedown", handler, { capture: true });
    window.addEventListener("auxclick", handler, { capture: true });

    return () => {
        window.removeEventListener("pointerdown", handler, { capture: true });
        window.removeEventListener("mousedown", handler, {
            capture: true,
        });
        window.removeEventListener("auxclick", handler, {
            capture: true,
        });
    };
}
