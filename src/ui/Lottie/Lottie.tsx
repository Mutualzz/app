import lottie from "lottie-web";
import { useEffect, useRef, type FC } from "react";
import type { LottieProps } from "./Lottie.types";

export const Lottie: FC<LottieProps> = ({
    path,
    loop = true,
    autoplay = true,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const animation = lottie.loadAnimation({
            container: containerRef.current!,
            renderer: "svg",
            loop,
            autoplay,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            path,
        });

        return () => {
            animation.destroy();
        };
    }, []);

    return <div {...props} />;
};
