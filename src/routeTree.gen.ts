/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from "@tanstack/react-router"

// Import Routes

import { Route as rootRoute } from "./routes/__root"

// Create Virtual Routes

const UiLazyImport = createFileRoute("/ui")()
const IndexLazyImport = createFileRoute("/")()
const UiLinearProgressLazyImport = createFileRoute("/ui/linear-progress")()
const UiDividerLazyImport = createFileRoute("/ui/divider")()
const UiCircularProgressLazyImport = createFileRoute("/ui/circular-progress")()
const UiButtonLazyImport = createFileRoute("/ui/button")()

// Create/Update Routes

const UiLazyRoute = UiLazyImport.update({
  id: "/ui",
  path: "/ui",
  getParentRoute: () => rootRoute,
} as any).lazy(() => import("./routes/ui.lazy").then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any).lazy(() => import("./routes/index.lazy").then((d) => d.Route))

const UiLinearProgressLazyRoute = UiLinearProgressLazyImport.update({
  id: "/linear-progress",
  path: "/linear-progress",
  getParentRoute: () => UiLazyRoute,
} as any).lazy(() =>
  import("./routes/ui/linear-progress.lazy").then((d) => d.Route),
)

const UiDividerLazyRoute = UiDividerLazyImport.update({
  id: "/divider",
  path: "/divider",
  getParentRoute: () => UiLazyRoute,
} as any).lazy(() => import("./routes/ui/divider.lazy").then((d) => d.Route))

const UiCircularProgressLazyRoute = UiCircularProgressLazyImport.update({
  id: "/circular-progress",
  path: "/circular-progress",
  getParentRoute: () => UiLazyRoute,
} as any).lazy(() =>
  import("./routes/ui/circular-progress.lazy").then((d) => d.Route),
)

const UiButtonLazyRoute = UiButtonLazyImport.update({
  id: "/button",
  path: "/button",
  getParentRoute: () => UiLazyRoute,
} as any).lazy(() => import("./routes/ui/button.lazy").then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    "/ui": {
      id: "/ui"
      path: "/ui"
      fullPath: "/ui"
      preLoaderRoute: typeof UiLazyImport
      parentRoute: typeof rootRoute
    }
    "/ui/button": {
      id: "/ui/button"
      path: "/button"
      fullPath: "/ui/button"
      preLoaderRoute: typeof UiButtonLazyImport
      parentRoute: typeof UiLazyImport
    }
    "/ui/circular-progress": {
      id: "/ui/circular-progress"
      path: "/circular-progress"
      fullPath: "/ui/circular-progress"
      preLoaderRoute: typeof UiCircularProgressLazyImport
      parentRoute: typeof UiLazyImport
    }
    "/ui/divider": {
      id: "/ui/divider"
      path: "/divider"
      fullPath: "/ui/divider"
      preLoaderRoute: typeof UiDividerLazyImport
      parentRoute: typeof UiLazyImport
    }
    "/ui/linear-progress": {
      id: "/ui/linear-progress"
      path: "/linear-progress"
      fullPath: "/ui/linear-progress"
      preLoaderRoute: typeof UiLinearProgressLazyImport
      parentRoute: typeof UiLazyImport
    }
  }
}

// Create and export the route tree

interface UiLazyRouteChildren {
  UiButtonLazyRoute: typeof UiButtonLazyRoute
  UiCircularProgressLazyRoute: typeof UiCircularProgressLazyRoute
  UiDividerLazyRoute: typeof UiDividerLazyRoute
  UiLinearProgressLazyRoute: typeof UiLinearProgressLazyRoute
}

const UiLazyRouteChildren: UiLazyRouteChildren = {
  UiButtonLazyRoute: UiButtonLazyRoute,
  UiCircularProgressLazyRoute: UiCircularProgressLazyRoute,
  UiDividerLazyRoute: UiDividerLazyRoute,
  UiLinearProgressLazyRoute: UiLinearProgressLazyRoute,
}

const UiLazyRouteWithChildren =
  UiLazyRoute._addFileChildren(UiLazyRouteChildren)

export interface FileRoutesByFullPath {
  "/": typeof IndexLazyRoute
  "/ui": typeof UiLazyRouteWithChildren
  "/ui/button": typeof UiButtonLazyRoute
  "/ui/circular-progress": typeof UiCircularProgressLazyRoute
  "/ui/divider": typeof UiDividerLazyRoute
  "/ui/linear-progress": typeof UiLinearProgressLazyRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexLazyRoute
  "/ui": typeof UiLazyRouteWithChildren
  "/ui/button": typeof UiButtonLazyRoute
  "/ui/circular-progress": typeof UiCircularProgressLazyRoute
  "/ui/divider": typeof UiDividerLazyRoute
  "/ui/linear-progress": typeof UiLinearProgressLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexLazyRoute
  "/ui": typeof UiLazyRouteWithChildren
  "/ui/button": typeof UiButtonLazyRoute
  "/ui/circular-progress": typeof UiCircularProgressLazyRoute
  "/ui/divider": typeof UiDividerLazyRoute
  "/ui/linear-progress": typeof UiLinearProgressLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | "/"
    | "/ui"
    | "/ui/button"
    | "/ui/circular-progress"
    | "/ui/divider"
    | "/ui/linear-progress"
  fileRoutesByTo: FileRoutesByTo
  to:
    | "/"
    | "/ui"
    | "/ui/button"
    | "/ui/circular-progress"
    | "/ui/divider"
    | "/ui/linear-progress"
  id:
    | "__root__"
    | "/"
    | "/ui"
    | "/ui/button"
    | "/ui/circular-progress"
    | "/ui/divider"
    | "/ui/linear-progress"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  UiLazyRoute: typeof UiLazyRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  UiLazyRoute: UiLazyRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/ui"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/ui": {
      "filePath": "ui.lazy.tsx",
      "children": [
        "/ui/button",
        "/ui/circular-progress",
        "/ui/divider",
        "/ui/linear-progress"
      ]
    },
    "/ui/button": {
      "filePath": "ui/button.lazy.tsx",
      "parent": "/ui"
    },
    "/ui/circular-progress": {
      "filePath": "ui/circular-progress.lazy.tsx",
      "parent": "/ui"
    },
    "/ui/divider": {
      "filePath": "ui/divider.lazy.tsx",
      "parent": "/ui"
    },
    "/ui/linear-progress": {
      "filePath": "ui/linear-progress.lazy.tsx",
      "parent": "/ui"
    }
  }
}
ROUTE_MANIFEST_END */
