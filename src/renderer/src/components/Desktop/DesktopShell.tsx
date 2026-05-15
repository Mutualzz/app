import { useDesktopShell } from "@contexts/DesktopShell.context";
import { isElectron } from "@utils/index";
import { observer } from "mobx-react-lite";
import { type FC, type PropsWithChildren, useEffect } from "react";

import { AdaptiveElements } from "./AdaptiveElements";

const DesktopShell: FC<PropsWithChildren> = observer(
    ({ children, ...props }) => {
        const { setOsInfo } = useDesktopShell();

        useEffect(() => {
            if (!window.api) return;

            (async () => {
                try {
                    const osInfo = await window.api.system.getOsInfo();
                    setOsInfo(osInfo);
                } catch (err) {
                    console.error("Failed to get OS info:", err);
                }
            })();
        }, []);

        if (!isElectron)
            return (
                <div
                    css={{
                        height: "100%",
                        width: "100%"
                    }}
                    {...props}
                >
                    {children}
                </div>
            );

        return (
            <div
                css={{
                    height: "100%",
                    width: "100%"
                }}
                {...props}
            >
                <AdaptiveElements />
                {children}
            </div>
        );
    }
);

DesktopShell.displayName = "DesktopShell";
export { DesktopShell };
