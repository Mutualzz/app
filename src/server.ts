import * as Sentry from "@sentry/tanstackstart-react";
import {
    createStartHandler,
    defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createRouter } from "./router";

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tunnel: import.meta.env.DEV
        ? "http://localhost:4000/v1/sentry"
        : "https://api.mutualzz.com/v1/sentry",
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["https://mutualzz.com", "localhost"],
    environment: import.meta.env.DEV ? "development" : "production",
    // debug: import.meta.env.DEV,
});

export default createStartHandler({
    createRouter,
})(Sentry.wrapStreamHandlerWithSentry(defaultStreamHandler));
