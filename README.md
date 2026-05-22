# BarberShop Pro - Sistema de Reserva de Citas de Barbería

Aplicación Angular standalone moderna para la gestión de reservas de citas en una barbería. Desarrollada con Angular 18+, TypeScript, TailwindCSS y arquitectura componentizada.

## 🎯 Características

- **Gestión de Citas**: Crear, editar y cancelar citas fácilmente
- **Selección de Barberos**: Elige entre múltiples barberos profesionales con especialidades
- **Catálogo de Servicios**: Visualiza todos los servicios disponibles con precios y duración
- **Información del Cliente**: Formulario completo para datos de contacto y notas adicionales
- **Historial de Citas**: Visualiza todas tus citas y su estado (programada, completada, cancelada)
- **Dashboard Estadístico**: Números de citas totales, completadas y programadas
- **Interfaz Responsiva**: Diseño adaptable a dispositivos móviles y de escritorio con TailwindCSS
- **Almacenamiento Local**: Las citas y datos se guardan en localStorage para persistencia

## 🛠️ Stack Tecnológico

- **Framework**: Angular 18+ (Standalone Components)
- **Lenguaje**: TypeScript 5+
- **Estilos**: TailwindCSS 3.4.1 + PostCSS + Autoprefixer
- **Gestión de Estado**: RxJS (BehaviorSubject, Observable)
- **Almacenamiento**: localStorage
- **Routing**: Angular Router con lazy loading

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── appointment.service.ts     (Gestión de citas)
│   │   │   ├── barber.service.ts          (Gestión de barberos)
│   │   │   └── barber-services.service.ts (Gestión de servicios)
│   │   └── guards/
│   ├── features/
│   │   ├── appointments/
│   │   │   ├── home.component.ts          (Página principal)
│   │   │   └── appointments.component.ts  (Mis citas)
│   │   ├── barbers/
│   │   ├── bookings/
│   │   │   └── booking.component.ts       (Formulario de reserva)
│   │   └── services/
│   ├── shared/
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── layouts/
│   │   └── layout.component.ts            (Layout principal)
│   ├── app.routes.ts
│   ├── app.ts
│   └── app.config.ts
├── styles.css                             (Estilos globales con Tailwind)
└── index.html
```

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm 9+

### Instalación

```bash
# Instalar dependencias
npm install
```

### Servidor de Desarrollo

```bash
# Iniciar servidor de desarrollo
ng serve

# O con recarga automática en el navegador
ng serve --open
```

La aplicación estará disponible en `http://localhost:4200/`

### Compilación

```bash
# Compilación de producción
ng build --configuration production

# Los archivos compilados estarán en /dist/barber-booking
```

## 📋 Rutas Disponibles

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | HomeComponent | Página principal con servicios y barberos |
| `/booking` | BookingComponent | Formulario para reservar una cita |
| `/appointments` | AppointmentsComponent | Historial y gestión de citas |

## 🎨 Componentes Principales

### HomeComponent
Página de inicio con:
- Sección hero con CTA
- Catálogo de servicios
- Galería de barberos con ratings
- Llamada a la acción

### BookingComponent
Formulario de reserva con:
- Información personal del cliente
- Selección de barbero
- Selección de servicio
- Selector de fecha y hora
- Notas adicionales

### AppointmentsComponent
Panel de citas con:
- Estadísticas de citas
- Lista de citas por estado
- Opciones para cancelar o editar
- Filtrado por estado

## 📊 Modelos de Datos

### Appointment
```typescript
{
  id: string;
  barberId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: Date;
  time: string;
  duration: number;
  serviceId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}
```

### Barber
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  available: boolean;
  workingHours: { start: string; end: string };
}
```

### BarberService
```typescript
{
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'corte' | 'afeitado' | 'tanto' | 'otro';
}
```

## 🔧 Servicios

### AppointmentService
- Gestión completa de citas (CRUD)
- Observable para suscribirse a cambios
- Persistencia en localStorage

### BarberService
- Listado de barberos disponibles
- Búsqueda por ID
- Gestión de disponibilidad
- Actualización de perfil

### BarberServicesService
- Catálogo de servicios
- Filtrado por categoría
- Gestión de precios y duración

## 🎯 Próximas Mejoras

- [ ] Integración con Firebase para backend
- [ ] Autenticación de usuarios
- [ ] Sistema de notificaciones por email
- [ ] Calendario interactivo mejorado
- [ ] Integración de pagos
- [ ] Sistema de reseñas y ratings
- [ ] Panel de administración
- [ ] Reportes y estadísticas

## 📝 Licencia

Este proyecto es código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado como ejemplo de aplicación Angular moderna con arquitectura standalone.

---

**BarberShop Pro** - Construido con ❤️ usando Angular, TailwindCSS y RxJS
