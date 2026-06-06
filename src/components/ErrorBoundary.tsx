import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-white mb-3">Algo salió mal</h1>
            <p className="text-sm text-text-secondary mb-6">
              Ha ocurrido un error inesperado en la aplicación. Nuestro equipo técnico ha sido notificado.
            </p>
            <div className="bg-background rounded-lg p-4 mb-6 overflow-x-auto text-left">
              <code className="text-xs text-danger font-mono">
                {this.state.error?.message || "Error desconocido"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
            >
              Recargar la página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
