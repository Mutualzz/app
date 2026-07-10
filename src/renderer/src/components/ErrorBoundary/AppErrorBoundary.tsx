import { Logger } from "@mutualzz/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { AppCrashFallback } from "./AppCrashFallback";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  private readonly logger = new Logger({ tag: "ErrorBoundary" });

  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.error("Uncaught render error", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return <AppCrashFallback />;
    }

    return this.props.children;
  }
}
