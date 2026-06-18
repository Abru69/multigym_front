import { Outlet, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useTenantBranding } from "@/hooks/useTenantBranding"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function AuthLayout() {
  const { branding } = useTenantBranding()

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, var(--accent-muted) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, var(--accent-muted) 0%, transparent 50%),
          var(--bg-primary)
        `,
      }}
    >
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            {branding.logoAbbr}
          </div>
          <div>
            <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              {branding.name}
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {branding.tagline}
            </p>
          </div>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
