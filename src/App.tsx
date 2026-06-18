import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { useTheme } from "./hooks/useTheme"

function App() {
  useTheme() // Initialize theme globally on app load

  return (
    <RouterProvider router={router} />
  )
}

export default App
