import { useDesktopShell } from "@contexts/DesktopShell.context";
import { arch, family, locale, platform, type } from "@tauri-apps/plugin-os";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, type FC, type PropsWithChildren } from "react";

import { AdaptiveElements } from "./AdaptiveElements";
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
                <AdaptiveElements />
                {children}
            </div>
        );
    },
);

DesktopShell.displayName = "DesktopShell";
export { DesktopShell };
