import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

const footerLinks = {
  Producto: [
    { label: 'Características', href: '#features' },
    { label: 'Precios', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
    { label: 'API', href: '#' },
  ],
  Empresa: [
    { label: 'Sobre Nosotros', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Carreras', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  Soporte: [
    { label: 'Centro de Ayuda', href: '#' },
    { label: 'Documentación', href: '#' },
    { label: 'Estado del Sistema', href: '#' },
    { label: 'Comunidad', href: '#' },
  ],
  Legal: [
    { label: 'Privacidad', href: '#' },
    { label: 'Términos', href: '#' },
    { label: 'Cookies', href: '#' },
    { label: 'Licencias', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[var(--text-on-primary)]">
                <Zap size={20} />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">MultiGym</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--text-secondary)]">
              La plataforma SaaS más completa para la gestión integral de gimnasios y centros de
              fitness.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-[var(--text-primary)] uppercase">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} MultiGym. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
              Twitter
            </a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
