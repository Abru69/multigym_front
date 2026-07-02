/**
 * Tenant Branding Configuration
 *
 * Since we don't modify the backend, each gym's branding is configured
 * here on the frontend. When a gym is accessed via subdomain (e.g. reto4.localhost),
 * we look up its visual identity from this registry.
 *
 * To add a new gym's branding, simply add a new entry to TENANT_CONFIGS.
 */

export interface TenantBranding {
  /** Display name of the gym */
  name: string
  /** Short abbreviation for the logo badge (2-3 chars) */
  logoAbbr: string
  /** Tagline shown below the name in auth screens */
  tagline: string

  /** Hero section content */
  hero: {
    badge: string
    title: string
    titleAccent: string
    subtitle: string
    ctaText: string
    ctaAuthenticatedAdmin: string
    ctaAuthenticatedClient: string
    secondaryCta: string
  }

  /** Stats section */
  stats: [string, string][]

  /** Features section */
  featuresHeading: string
  featuresHeadingAccent: string
  featuresSubtitle: string

  /** Final CTA section */
  ctaHeadingAuth: string
  ctaHeadingGuest: string
  ctaSubAuth: string
  ctaSubGuest: string
  ctaButtonAuth: string
  ctaButtonGuest: string

  /** Color overrides (CSS custom properties) */
  colors: {
    accent: string
    accentHover: string
    accentMuted: string
    accentText: string
    detail: string
  }

  /** Optional background video/image for the hero */
  heroVideo?: string
  heroImage?: string
}

/**
 * Default branding used when no tenant-specific config exists.
 * Also used as the fallback for any missing fields.
 */
export const DEFAULT_BRANDING: TenantBranding = {
  name: 'MultiGym',
  logoAbbr: 'MG',
  tagline: 'Plataforma de Gimnasios',

  hero: {
    badge: 'Alto Rendimiento',
    title: 'TU TRANSFORMACIÓN',
    titleAccent: 'EMPIEZA AQUÍ',
    subtitle:
      'Entrenamientos inteligentes, nutrición experta y la suplementación que necesitas. Todo en un solo lugar.',
    ctaText: 'Comenzar Ahora',
    ctaAuthenticatedAdmin: 'Ir al Panel de Control',
    ctaAuthenticatedClient: 'Ir a mis Rutinas',
    secondaryCta: 'Comprar Suplementos',
  },

  stats: [
    ['500+', 'Atletas'],
    ['1200+', 'Rutinas Completadas'],
    ['98%', 'Retención'],
  ],

  featuresHeading: 'Todo en una',
  featuresHeadingAccent: 'sola plataforma',
  featuresSubtitle:
    'La disciplina requiere las herramientas adecuadas. Diseñado para maximizar tus resultados sin distracciones.',

  ctaHeadingAuth: '¿LISTO PARA ENTRENAR?',
  ctaHeadingGuest: '¿LISTO PARA EL RETO?',
  ctaSubAuth: 'Tu transformación no espera. Accede a tus rutinas y sigue superando tus límites.',
  ctaSubGuest:
    'Únete a la plataforma definitiva de entrenamiento. Rompe tus límites y construye tu mejor versión.',
  ctaButtonAuth: 'Ir a mi Portal',
  ctaButtonGuest: 'Crear Cuenta Gratis',

  colors: {
    accent: '#0000ff',
    accentHover: '#0000cc',
    accentMuted: 'rgba(0, 0, 255, 0.15)',
    accentText: '#ffffff',
    detail: '#ffff00',
  },

  heroVideo: '/vid_sup.mp4',
}

/**
 * Registry of tenant-specific branding.
 * Keys must match the tenantId / subdomain used in the URL.
 */
export const TENANT_CONFIGS: Record<string, Partial<TenantBranding>> = {
  reto4: {
    name: 'Reto 4 Gym',
    logoAbbr: 'R4',
    tagline: 'Nutrición & Entrenamiento',

    hero: {
      badge: 'Alto Rendimiento',
      title: 'TU TRANSFORMACIÓN',
      titleAccent: 'EMPIEZA AQUÍ',
      subtitle:
        'Entrenamientos inteligentes, nutrición experta y la suplementación que necesitas. Todo en un solo lugar.',
      ctaText: 'Comenzar Ahora',
      ctaAuthenticatedAdmin: 'Ir al Panel de Control',
      ctaAuthenticatedClient: 'Ir a mis Rutinas',
      secondaryCta: 'Comprar Suplementos',
    },

    stats: [
      ['500+', 'Atletas'],
      ['1200+', 'Rutinas Completadas'],
      ['98%', 'Retención'],
    ],

    ctaHeadingGuest: '¿LISTO PARA EL RETO?',

    colors: {
      accent: '#0000ff',
      accentHover: '#0000cc',
      accentMuted: 'rgba(0, 0, 255, 0.15)',
      accentText: '#ffffff',
      detail: '#ffff00',
    },

    heroVideo: '/vid_sup.mp4',
  },

  gym1: {
    name: 'Gym Central',
    logoAbbr: 'GC',
    tagline: 'Fuerza & Disciplina',

    hero: {
      badge: 'Fuerza Total',
      title: 'ENTRENA CON',
      titleAccent: 'PROPÓSITO',
      subtitle:
        'El gimnasio más completo de la ciudad. Equipamiento de clase mundial, entrenadores certificados y una comunidad que te impulsa.',
      ctaText: 'Únete Ahora',
      ctaAuthenticatedAdmin: 'Ir al Panel de Control',
      ctaAuthenticatedClient: 'Ir a mis Rutinas',
      secondaryCta: 'Ver Suplementos',
    },

    stats: [
      ['300+', 'Miembros'],
      ['50+', 'Clases Semanales'],
      ['95%', 'Satisfacción'],
    ],

    featuresHeading: 'Todo lo que necesitas en',
    featuresHeadingAccent: 'un solo lugar',
    featuresSubtitle:
      'Equipamiento profesional, asesoría personalizada y seguimiento continuo para que alcances tus metas.',

    ctaHeadingAuth: '¿LISTO PARA ENTRENAR?',
    ctaHeadingGuest: '¿LISTO PARA TRANSFORMARTE?',
    ctaSubAuth: 'Tu progreso no para. Accede a tus rutinas y supera tus marcas.',
    ctaSubGuest: 'Únete a Gym Central y comienza tu transformación hoy.',
    ctaButtonAuth: 'Ir a mi Portal',
    ctaButtonGuest: 'Registrarme Gratis',

    colors: {
      accent: '#e53e3e',
      accentHover: '#c53030',
      accentMuted: 'rgba(229, 62, 62, 0.15)',
      accentText: '#ffffff',
      detail: '#fc8181',
    },
  },

  gymh: {
    name: 'Gym Huanda',
    logoAbbr: 'GH',
    tagline: 'Potencia & Resistencia',

    hero: {
      badge: 'Energía Pura',
      title: 'SUPERA TUS',
      titleAccent: 'LÍMITES',
      subtitle:
        'Entrenamiento funcional, crossfit y musculación con los mejores coaches de la región.',
      ctaText: 'Empieza Hoy',
      ctaAuthenticatedAdmin: 'Ir al Panel de Control',
      ctaAuthenticatedClient: 'Ir a mis Rutinas',
      secondaryCta: 'Tienda de Suplementos',
    },

    stats: [
      ['200+', 'Deportistas'],
      ['800+', 'Sesiones al Mes'],
      ['4.9★', 'Valoración'],
    ],

    featuresHeading: 'Entrena con las',
    featuresHeadingAccent: 'mejores herramientas',
    featuresSubtitle:
      'Tecnología de punta y planes adaptados a tu nivel para resultados que se ven y se sienten.',

    ctaHeadingAuth: '¡A DARLE CON TODO!',
    ctaHeadingGuest: '¿LISTO PARA EL DESAFÍO?',
    ctaSubAuth: 'Tus rutinas te esperan. Cada repetición cuenta.',
    ctaSubGuest: 'Únete a la comunidad de Gym Huanda y descubre tu potencial real.',
    ctaButtonAuth: 'Ir a mis Rutinas',
    ctaButtonGuest: 'Unirme Ahora',

    colors: {
      accent: '#38b2ac',
      accentHover: '#2c9a94',
      accentMuted: 'rgba(56, 178, 172, 0.15)',
      accentText: '#ffffff',
      detail: '#81e6d9',
    },
  },
}

/**
 * Resolve the full branding for a given tenantId.
 * Merges tenant-specific overrides on top of defaults.
 */
export function resolveBranding(tenantId: string | null): TenantBranding {
  if (!tenantId) return DEFAULT_BRANDING

  const override = TENANT_CONFIGS[tenantId]
  if (!override) {
    // Unknown tenant — use defaults but set the name from the ID
    return {
      ...DEFAULT_BRANDING,
      name: tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
      logoAbbr: tenantId.substring(0, 2).toUpperCase(),
    }
  }

  return {
    ...DEFAULT_BRANDING,
    ...override,
    hero: { ...DEFAULT_BRANDING.hero, ...override.hero },
    colors: { ...DEFAULT_BRANDING.colors, ...override.colors },
  }
}
