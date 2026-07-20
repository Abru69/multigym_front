import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useTheme } from './hooks/useTheme'
import { useTenantBranding } from './hooks/useTenantBranding'
import { ToastContainer } from './components/ui/Toast'

function App() {
  useTheme() // Initialize theme globally on app load
  useTenantBranding() // Apply tenant colors before route layouts render

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App
