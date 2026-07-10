import { AppCrashFallback } from "@components/ErrorBoundary/AppCrashFallback";
import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import {
  createBrowserHistory,
  createHashHistory,
  createRouter as createTanStackRouter
} from "@tanstack/react-router";
import { isElectron } from "@utils/index";

import { routeTree } from "./routeTree.gen";

const errorLogger = new Logger({ tag: "ErrorBoundary" });

export function createRouter() {
  const app = useAppStore();

  return createTanStackRouter({
    routeTree,
    history: isElectron ? createHashHistory() : createBrowserHistory(),
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: { queryClient: app.queryClient },
    defaultErrorComponent: AppCrashFallback,
    defaultOnCatch: (error, errorInfo) => {
      errorLogger.error("Uncaught render error", error, errorInfo);
    }
  });
}
