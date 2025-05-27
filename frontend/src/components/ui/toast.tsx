import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  variant?: "default" | "destructive" | "success"
  title?: string
  description?: string
  onClose?: () => void
  duration?: number
  open?: boolean
}

export function Toast({
  variant = "default",
  title,
  description,
  onClose,
  duration = 5000,
  open = true,
  ...props
}: ToastProps & React.HTMLAttributes<HTMLDivElement>) {
  const [isVisible, setIsVisible] = React.useState(open)

  React.useEffect(() => {
    setIsVisible(open)
  }, [open])

  React.useEffect(() => {
    if (!isVisible || !onClose) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [isVisible, onClose, duration])

  return isVisible ? (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex max-w-md animate-in fade-in slide-in-from-bottom-5 flex-col gap-2 rounded-lg border p-4 shadow-lg transition-all duration-300",
        variant === "destructive" && "border-destructive bg-destructive/10 text-destructive",
        variant === "success" && "border-green-500 bg-green-500/10 text-green-500",
        !title && !description && "hidden",
        props.className
      )}
      {...props}
    >
      {title && <div className="text-sm font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
      {onClose && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 top-2 rounded-full p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  ) : null
}

export function useToast() {
  const [toast, setToast] = React.useState<{
    open: boolean
    title?: string
    description?: string
    variant?: "default" | "destructive" | "success"
    duration?: number
  }>({
    open: false,
  })

  const dismiss = React.useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }))
  }, [])

  return {
    toast,
    setToast,
    dismiss,
  }
}

export const Toaster = () => {
  const { toast, dismiss } = useToast()

  return (
    <Toast
      open={toast.open}
      title={toast.title}
      description={toast.description}
      variant={toast.variant}
      duration={toast.duration}
      onClose={dismiss}
    />
  )
} 