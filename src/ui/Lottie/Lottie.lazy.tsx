import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef, useState, type FC } from "react";
import type { LottieProps } from "./Lottie.types";

export const LazyLottie: FC<LottieProps> = ({
    path,
    loop = true,
    autoplay = true,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let animation: AnimationItem | null = null;
        if (isVisible && containerRef.current) {
            animation = lottie.loadAnimation({
                container: containerRef.current,
                renderer: "svg",
                loop,
                autoplay,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                path,
            });
        }

        return () => {
            if (animation) {
                animation.destroy();
            }
        };
    }, [isVisible, path, loop, autoplay]);

    return <div {...props} ref={containerRef} />;
};
