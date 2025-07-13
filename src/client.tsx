import * as Sentry from "@sentry/tanstackstart-react";
import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";

const router = createRouter();

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    tunnel: import.meta.env.DEV
        ? "http://localhost:4000/v1/sentry"
        : "https://api.mutualzz.com/v1/sentry",
    environment: import.meta.env.DEV ? "development" : "production",
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["https://mutualzz.com", "localhost"],
    replaysSessionSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    // debug: import.meta.env.DEV,
});

hydrateRoot(document, <StartClient router={router} />);
