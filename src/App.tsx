import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import { useTenantBranding } from './hooks/useTenantBranding'
import { ToastContainer } from './components/ui/Toast'
import { useAuthStore } from './features/auth/store/authStore'
import { useCartStore } from './features/shop/store/cartStore'

function App() {
  useTheme() // Initialize theme globally on app load
  useTenantBranding() // Apply tenant colors before route layouts render
  const { hasHydrated, tenantId, user } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    useCartStore.setState({ items: [] })
    void useCartStore.persist.rehydrate()
  }, [hasHydrated, tenantId, user?.id])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
