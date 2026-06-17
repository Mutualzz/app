import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode
} from "react";

export interface WindowTitleBarConfig {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  end?: ReactNode;
  hideModeLabel?: boolean;
}

interface WindowTitleBarContextValue {
  config: WindowTitleBarConfig | null;
  setConfig: (config: WindowTitleBarConfig | null) => void;
}

const WindowTitleBarContext = createContext<WindowTitleBarContextValue | null>(
  null
);

export function WindowTitleBarProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<WindowTitleBarConfig | null>(null);
  const value = useMemo(() => ({ config, setConfig }), [config]);

  return (
    <WindowTitleBarContext.Provider value={value}>
      {children}
    </WindowTitleBarContext.Provider>
  );
}

export function useWindowTitleBar() {
  const context = useContext(WindowTitleBarContext);
  if (!context) {
    throw new Error("useWindowTitleBar must be used within WindowTitleBarProvider");
  }
  return context;
}
