import { useDesktopShell } from "@contexts/DesktopShell.context";
import { isTauri } from "@utils/index";
import { useEffect, type FC, type PropsWithChildren } from "react";

import { observer } from "mobx-react";
import { AdaptiveIcon } from "./AdaptiveIcon";
import { AdaptiveTray } from "./AdaptiveTray";
import WindowTitlebar from "./WindowTitlebar";

interface WindowTitlebarProps {
    onHeightChange?: (height: number) => void;
}

interface DesktopShellProps {
    titleBarProps?: WindowTitlebarProps;
}

const DesktopShell: FC<PropsWithChildren<DesktopShellProps>> = observer(
    ({ titleBarProps, children, ...props }) => {
        const { setOsInfo } = useDesktopShell();

        useEffect(() => {
            if (!isTauri) return;

            (async () => {
                const { arch, family, locale, platform, type } = await import(
                    "@tauri-apps/plugin-os"
                );
                setOsInfo({
                    arch: arch(),
                    family: family(),
                    platform: platform(),
                    type: type(),
                    locale: await locale(),
                });
            })();
        }, []);

        if (!isTauri)
            return (
                <div
                    css={{
                        height: "100%",
                        width: "100%",
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
                    width: "100%",
                }}
                {...props}
            >
                <WindowTitlebar {...titleBarProps} />
                <AdaptiveIcon />
                <AdaptiveTray />
                {children}
            </div>
        );
    },
);

DesktopShell.displayName = "DesktopShell";
export { DesktopShell };
