"use client"

import React, { createContext, useContext, useState } from "react"
import { Toast, ToastProps } from "./toast"

type ToastContextType = {
  showToast: (props: Omit<ToastProps, "open" | "onClose">) => void
  hideToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastProps, setToastProps] = useState<ToastProps & { open: boolean }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
    duration: 5000,
  })

  const showToast = (props: Omit<ToastProps, "open" | "onClose">) => {
    setToastProps({
      ...props,
      open: true,
    })
  }

  const hideToast = () => {
    setToastProps((prev) => ({
      ...prev,
      open: false,
    }))
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast {...toastProps} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

export const useToastProvider = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastProvider must be used within a ToastProvider")
  }
  return context
} 