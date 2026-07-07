import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl">
            <div className="bg-danger/10 text-danger mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <AlertTriangle size={32} />
            </div>
            <h1 className="mb-3 text-xl font-bold text-[var(--text-primary)]">Algo salió mal</h1>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              Ha ocurrido un error inesperado en la aplicación. Nuestro equipo técnico ha sido
              notificado.
            </p>
            <div className="mb-6 overflow-x-auto rounded-lg bg-[var(--background)] p-4 text-left">
              <code className="text-danger font-mono text-xs">
                {this.state.error?.message || 'Error desconocido'}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent hover:bg-accent/90 w-full rounded-xl px-4 py-3 font-semibold text-white transition-colors"
            >
              Recargar la página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
