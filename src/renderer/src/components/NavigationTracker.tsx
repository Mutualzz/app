import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAppStore } from "@hooks/useStores";

export const NavigationTracker = () => {
  const app = useAppStore();
  const href = useRouterState({
    select: (state) => state.location.href
  });
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });

  const lastHrefRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastHrefRef.current === href) return;
    lastHrefRef.current = href;
    app.navigation.record(href);
    app.navigation.trackRoute(pathname);
  }, [href, pathname, app]);

  return null;
};
