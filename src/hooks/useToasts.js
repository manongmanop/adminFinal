import { useState } from 'react'

export default function useToasts() {
  const [toasts, setToasts] = useState([])

  function pushToast({ type = 'info', title = '', message = '' }) {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast = { id, type, title, message }
    setToasts((prev) => [toast, ...prev])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, pushToast, dismissToast }
}

