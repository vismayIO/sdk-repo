import * as React from "react"
import { cn } from "../../utils/cn"

export interface Toast {
    id: string
    message: string
    type: "success" | "error" | "info" | "warning"
}

interface UseToastReturn {
    toasts: Toast[]
    toast: (opts: Omit<Toast, "id"> & { duration?: number }) => void
    dismiss: (id: string) => void
}

/**
 * useToast - Manage toast notification state.
 * Pair with <Toaster /> component to render notifications.
 */
export function useToast(): UseToastReturn {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const toast = React.useCallback(
        ({ message, type = "info", duration = 4000 }: Omit<Toast, "id"> & { duration?: number }) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
            setToasts((prev) => [...prev, { id, message, type }])

            if (duration > 0) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id))
                }, duration)
            }
        },
        []
    )

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return { toasts, toast, dismiss }
}

const TOAST_STYLES: Record<Toast["type"], string> = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-500 text-white",
}

const TOAST_ICONS: Record<Toast["type"], string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
}

/**
 * Toaster - Renders toast notifications.
 * Position: fixed bottom-right corner.
 */
export function Toaster({
    toasts,
    onDismiss,
}: {
    toasts: Toast[]
    onDismiss: (id: string) => void
}) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300",
                        TOAST_STYLES[t.type]
                    )}
                >
                    <span className="text-lg shrink-0">{TOAST_ICONS[t.type]}</span>
                    <span className="flex-1 text-sm font-medium">{t.message}</span>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="opacity-70 hover:opacity-100 transition shrink-0 text-sm"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    )
}
