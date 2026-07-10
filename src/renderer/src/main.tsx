import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { AppErrorBoundary } from "@components/ErrorBoundary/AppErrorBoundary";
import { createRouter } from "./router";

const router = createRouter();

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </React.StrictMode>
);
