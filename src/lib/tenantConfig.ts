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
    accentLight: string
    accentMuted: string
    accentText: string
    detail: string
  }

  /** Optional background video/image for the hero */
  heroVideo?: string
  heroImage?: string

  /** Gym schedule */
  schedule: {
    weekdays: string
    saturday: string
    sunday: string
  }

  /** Gym contact info */
  address: string
  phone: string

  /** Trainers */
  trainers: Array<{
    name: string
    specialty: string
    avatar?: string
  }>

  /** Membership plans */
  plans: Array<{
    name: string
    price: number
    period: string
    features: string[]
    featured?: boolean
  }>
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
    accent: '#f97316',
    accentHover: '#e8590c',
    accentLight: '#fdba74',
    accentMuted: '#431407',
    accentText: '#ffffff',
    detail: '#f97316',
  },

  heroVideo: '/vid_sup.mp4',

  schedule: {
    weekdays: '6:00 AM - 10:00 PM',
    saturday: '7:00 AM - 8:00 PM',
    sunday: '8:00 AM - 2:00 PM',
  },
  address: '',
  phone: '',
  trainers: [],
  plans: [
    {
      name: 'Básico',
      price: 299,
      period: 'mes',
      features: ['Acceso al gimnasio', '2 rutinas personalizadas', 'Soporte por email'],
    },
    {
      name: 'Pro',
      price: 499,
      period: 'mes',
      features: [
        'Acceso ilimitado',
        'Rutinas ilimitadas',
        'Nutrición personalizada',
        'Soporte prioritario',
      ],
      featured: true,
    },
    {
      name: 'Premium',
      price: 799,
      period: 'mes',
      features: [
        'Todo del plan Pro',
        'Entrenador personal',
        'Acceso a tienda con descuento',
        'Clases grupales',
        'Soporte 24/7',
      ],
    },
  ],
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
      accent: '#f97316',
      accentHover: '#e8590c',
      accentLight: '#fdba74',
      accentMuted: '#431407',
      accentText: '#ffffff',
      detail: '#f97316',
    },

    heroVideo: '/vid_sup.mp4',

    schedule: {
      weekdays: '6:00 AM - 10:00 PM',
      saturday: '7:00 AM - 8:00 PM',
      sunday: '8:00 AM - 2:00 PM',
    },
    address: 'Av. Revolución #1234, Col. Centro, Ciudad de México',
    phone: '+52 55 1234 5678',
    trainers: [
      { name: 'Carlos Méndez', specialty: 'Musculación y Fuerza' },
      { name: 'Laura Gómez', specialty: 'CrossFit y Funcional' },
      { name: 'Miguel Torres', specialty: 'Nutrición Deportiva' },
    ],
    plans: [
      {
        name: 'Básico',
        price: 299,
        period: 'mes',
        features: ['Acceso al gimnasio', '2 rutinas personalizadas', 'Soporte por email'],
      },
      {
        name: 'Pro',
        price: 499,
        period: 'mes',
        features: [
          'Acceso ilimitado',
          'Rutinas ilimitadas',
          'Nutrición personalizada',
          'Soporte prioritario',
        ],
        featured: true,
      },
      {
        name: 'Premium',
        price: 799,
        period: 'mes',
        features: [
          'Todo del plan Pro',
          'Entrenador personal',
          'Acceso a tienda con descuento',
          'Clases grupales',
          'Soporte 24/7',
        ],
      },
    ],
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
      accent: '#f97316',
      accentHover: '#e8590c',
      accentLight: '#fdba74',
      accentMuted: '#431407',
      accentText: '#ffffff',
      detail: '#f97316',
    },

    schedule: {
      weekdays: '5:30 AM - 11:00 PM',
      saturday: '6:00 AM - 9:00 PM',
      sunday: '7:00 AM - 3:00 PM',
    },
    address: 'Calle Independencia #567, Col. Roma, Ciudad de México',
    phone: '+52 55 8765 4321',
    trainers: [
      { name: 'Roberto Díaz', specialty: 'Musculación Clásica' },
      { name: 'Ana López', specialty: 'Yoga y Pilates' },
      { name: 'Pedro Sánchez', specialty: 'Box y MMA' },
    ],
    plans: [
      {
        name: 'Básico',
        price: 350,
        period: 'mes',
        features: ['Acceso al gimnasio', '1 rutina personalizada', 'Lockers'],
      },
      {
        name: 'Pro',
        price: 550,
        period: 'mes',
        features: [
          'Acceso ilimitado',
          'Rutinas ilimitadas',
          'Clases grupales',
          'Asesoría nutricional',
        ],
        featured: true,
      },
      {
        name: 'Premium',
        price: 850,
        period: 'mes',
        features: [
          'Todo del plan Pro',
          'Entrenador personal',
          'Sauna y vapor',
          'Estacionamiento',
          'Soporte 24/7',
        ],
      },
    ],
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
      accent: '#f97316',
      accentHover: '#e8590c',
      accentLight: '#fdba74',
      accentMuted: '#431407',
      accentText: '#ffffff',
      detail: '#f97316',
    },

    schedule: {
      weekdays: '6:00 AM - 10:00 PM',
      saturday: '7:00 AM - 7:00 PM',
      sunday: '8:00 AM - 1:00 PM',
    },
    address: 'Blvd. Independencia #890, Col. Norte, Guadalajara',
    phone: '+52 33 5555 1234',
    trainers: [
      { name: 'Fernando Ruíz', specialty: 'CrossFit' },
      { name: 'Sofía Herrera', specialty: 'Funcional y HIIT' },
      { name: 'Diego Morales', specialty: 'Nutrición y Suplementación' },
    ],
    plans: [
      {
        name: 'Básico',
        price: 250,
        period: 'mes',
        features: ['Acceso al gimnasio', '2 clases grupales/semana', 'App móvil'],
      },
      {
        name: 'Pro',
        price: 450,
        period: 'mes',
        features: [
          'Acceso ilimitado',
          'Clases ilimitadas',
          'Rutinas personalizadas',
          'Seguimiento mensual',
        ],
        featured: true,
      },
      {
        name: 'Premium',
        price: 700,
        period: 'mes',
        features: [
          'Todo del plan Pro',
          'Entrenador dedicado',
          'Plan nutricional',
          'Tienda con 15% descuento',
          'Acceso VIP',
        ],
      },
    ],
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
    schedule: { ...DEFAULT_BRANDING.schedule, ...override.schedule },
    trainers: override.trainers ?? DEFAULT_BRANDING.trainers,
    plans: override.plans ?? DEFAULT_BRANDING.plans,
  }
}
