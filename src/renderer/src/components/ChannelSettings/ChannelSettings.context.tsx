import { createContext, PropsWithChildren, useContext, useState } from "react";
import { observer } from "mobx-react-lite";

export type ChannelSettingsPage = "overview" | "permissions" | "invites";

interface ChannelSettingsContextProps {
  currentPage: ChannelSettingsPage;
  setCurrentPage: (currentPage: ChannelSettingsPage) => void;
}

const ChannelSettingsContext = createContext<ChannelSettingsContextProps>({
  currentPage: "overview",
  setCurrentPage: () => {
    return;
  }
});

export const ChannelSettingsProvider = observer(
  ({ children }: PropsWithChildren) => {
    const [currentPage, setCurrentPage] =
      useState<ChannelSettingsPage>("overview");

    return (
      <ChannelSettingsContext.Provider value={{ currentPage, setCurrentPage }}>
        {children}
      </ChannelSettingsContext.Provider>
    );
  }
);

export function useChannelSettings() {
  const ctx = useContext(ChannelSettingsContext);
  if (!ctx)
    throw new Error("useChannelSettings must be used within the context");

  return ctx;
}
