import { observer } from "mobx-react-lite";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState
} from "react";

interface OsInfo {
  platform: string;
  type: string;
  family: string;
  arch: string;
  locale: string | null;
}

interface DesktopShellContextProps {
  os: OsInfo;
  setOsInfo: (info: Partial<OsInfo>) => void;
}

const DesktopShellContext = createContext<DesktopShellContextProps | null>({
  os: {
    platform: "unknown",
    type: "unknown",
    family: "unknown",
    arch: "unknown",
    locale: null
  },

  setOsInfo: () => {
    return;
  }
});

export const DesktopShellProvider = observer(
  ({ children }: PropsWithChildren) => {
    const [osInfo, setOsInfo] = useState<OsInfo>({
      platform: "unknown",
      type: "unknown",
      family: "unknown",
      arch: "unknown",
      locale: null
    });

    const setOsInfoInternal = (info: Partial<OsInfo>) => {
      setOsInfo((prev) => ({ ...prev, ...info }));
    };

    const contextValue: DesktopShellContextProps = {
      os: osInfo,
      setOsInfo: setOsInfoInternal
    };

    return (
      <DesktopShellContext.Provider value={contextValue}>
        {children}
      </DesktopShellContext.Provider>
    );
  }
);

export function useDesktopShell() {
  const ctx = useContext(DesktopShellContext);
  if (!ctx)
    throw new Error(
      "useDesktopShell must be used within a DesktopShellProvider"
    );
  return ctx;
}
