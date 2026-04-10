import { isSSR } from "@utils/index";
import { lazy, Suspense } from "react";

// Dynamically import only in the browser
const LazyMarkdownRenderer = lazy(() =>
    import("./MarkdownRenderer/MarkdownRenderer").then((mod) => ({
        default: mod.MarkdownRenderer,
    })),
);

export function MarkdownRendererClient(props: any) {
    if (isSSR) return null;
    return (
        <Suspense fallback={null}>
            <LazyMarkdownRenderer {...props} />
        </Suspense>
    );
}
