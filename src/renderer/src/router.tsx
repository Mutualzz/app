import {
  createHashHistory,
  createBrowserHistory,
  createRouter as createTanStackRouter
} from "@tanstack/react-router";
import { useAppStore } from "@hooks/useStores";
import { isElectron } from "@utils/index";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const app = useAppStore();

  return createTanStackRouter({
    routeTree,
    history: isElectron ? createHashHistory() : createBrowserHistory(),
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    context: { queryClient: app.queryClient }
  });
}
