import { isSSR } from "@utils/index";
import { lazy, Suspense } from "react";

// Dynamically import only in the browser
const LazyCropper = lazy(() => import("react-easy-crop"));

export function CropperClient(props: any) {
    if (isSSR) return null;
    return (
        <Suspense fallback={null}>
            <LazyCropper {...props} />
        </Suspense>
    );
}
