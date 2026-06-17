import {
  createBrowserHistory,
  createRouter as createTanStackRouter
} from "@tanstack/react-router";

import { useAppStore } from "@hooks/useStores";
import { isElectron } from "@utils/index";
import { routeTree } from "./routeTree.gen";

function normalizeElectronPath(pathname: string) {
  if (!isElectron) return pathname;

  if (
    pathname === "/index.html" ||
    pathname.endsWith("/index.html") ||
    /^\/[A-Za-z]:\//.test(pathname)
  ) {
    return "/";
  }

  return pathname || "/";
}

function getHistory() {
  const history = createBrowserHistory();

  if (!isElectron) return history;

  return {
    ...history,
    get location() {
      const loc = history.location;
      return {
        ...loc,
        pathname: normalizeElectronPath(loc.pathname)
      };
    }
  };
}

export function getRouter() {
  const app = useAppStore();
  const queryClient = app.queryClient;

  return createTanStackRouter({
    routeTree,
    history: getHistory(),
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: {
      queryClient
    }
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

declare module "@tanstack/history" {
  interface HistoryState {
    profilePreview?: boolean;
  }
}
