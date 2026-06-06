import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAppStore } from "@hooks/useStores";

export const NavigationTracker = () => {
  const app = useAppStore();
  const href = useRouterState({
    select: (state) => state.location.href
  });

  const lastHrefRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastHrefRef.current === href) return;
    lastHrefRef.current = href;
    app.navigation.record(href);
  }, [href, app]);

  return null;
};
