import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

/**
 * Animated theme toggle button.
 * Switches between sun (light) and moon (dark) icons with a smooth rotation.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-colors ${className}`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.div>
    </motion.button>
  )
}
