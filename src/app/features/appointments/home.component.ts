import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarberService } from '../../core/services/barber.service';
import { BarberServicesService } from '../../core/services/barber-services.service';
import { BarberInfoService } from '../../core/services/barber-info.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { BarberInfo } from '../../core/models/barber-info.model';
import { Product } from '../../core/models/product.model';
import { AuthState } from '../../core/models/auth.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- Hero Section -->
      <section class="hero rounded-3 mb-5">
        <div class="container-xl">
          <div>
            <h1>{{ barberInfo?.name || 'Bienvenido a BarberShop Pro' }}</h1>
            <p>{{ barberInfo?.description || 'Reserva tu cita de barbería en línea de forma rápida y sencilla' }}</p>
            <a [routerLink]="getReservaLink()" class="btn btn-light btn-lg">{{ getReservaText() }}</a>
          </div>
        </div>
      </section>

      <!-- Info Barbería Section -->
      <section class="mb-5">
        <div class="container-xl">
          <div class="row g-4 mb-5">
            <div class="col-md-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h6 class="card-title text-muted">📍 Ubicación</h6>
                  <p class="fw-bold">{{ barberInfo?.location }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h6 class="card-title text-muted">📞 Teléfono</h6>
                  <p class="fw-bold">{{ barberInfo?.phone }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h6 class="card-title text-muted">📧 Email</h6>
                  <p class="fw-bold small">{{ barberInfo?.email }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h6 class="card-title text-muted">🌐 Síguenos</h6>
                  <div class="small">
                    <a *ngIf="barberInfo?.socialMedia?.instagram" href="#" class="me-2">Instagram</a>
                    <a *ngIf="barberInfo?.socialMedia?.facebook" href="#" class="me-2">Facebook</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section class="mb-5">
        <div class="container-xl">
          <h2 class="mb-4">Nuestros Servicios</h2>
          <div class="row g-4">
            <div *ngFor="let service of services" class="col-lg-3 col-md-6">
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">{{ service.name }}</h5>
                  <p class="card-text text-muted">{{ service.description }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">{{ service.price }}€</span>
                    <small class="text-muted">{{ service.duration }} min</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Barber Section - Único Barbero -->
      <section class="mb-5">
        <div class="container-xl">
          <h2 class="mb-4">Conoce a Tu Barbero</h2>
          <div *ngIf="barbers && barbers.length > 0" class="card h-100 shadow">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h3 class="card-title h4 mb-2">{{ barbers[0].name }}</h3>
                  <p class="text-muted mb-3">Barbero Profesional con amplia experiencia</p>
                  <div class="d-flex gap-3 mb-3">
                    <div>
                      <span class="badge bg-warning text-dark fs-6">⭐ {{ barbers[0].rating }} puntos</span>
                    </div>
                    <div>
                      <span class="badge bg-primary fs-6">📞 {{ barbers[0].phone }}</span>
                    </div>
                  </div>
                  <div class="small text-muted mb-3">
                    <p class="mb-2">📧 {{ barbers[0].email }}</p>
                    <p class="mb-2">🕐 Horarios: {{ barbers[0].workingHours.start }} - {{ barbers[0].workingHours.end }}</p>
                  </div>
                  <div class="mb-3">
                    <p class="fw-bold mb-2">Especialidades:</p>
                    <div class="d-flex flex-wrap gap-2">
                      <span *ngFor="let specialty of barbers[0].specialties" class="badge bg-info">{{ specialty }}</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-center">
                  <div class="bg-light rounded-3 p-4">
                    <div style="font-size: 120px;">✂️</div>
                    <p class="text-muted mt-2">Profesional Disponible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="mb-5">
        <div class="container-xl">
          <h2 class="mb-4">Productos Premium</h2>
          <div class="row g-4">
            <div *ngFor="let product of products" class="col-lg-3 col-md-6">
              <div class="card h-100">
                <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                  <div class="text-center">
                    <div class="fs-1">📦</div>
                    <small class="text-muted">{{ getCategoryLabel(product.category) }}</small>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ product.name }}</h5>
                  <p class="card-text text-muted small">{{ product.description }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success fs-6">{{ product.price }}€</span>
                    <span *ngIf="product.inStock" class="badge bg-primary">Disponible</span>
                    <span *ngIf="!product.inStock" class="badge bg-danger">Agotado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section>
        <div class="container-xl">
          <div class="cta-section">
            <h3>¿Listo para tu próxima cita?</h3>
            <p class="mb-4">Reserva tu turno ahora y obtén descuento en tu primera visita</p>
            <a [routerLink]="getReservaLink()" class="btn btn-primary btn-lg">{{ getReservaText() }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      background-attachment: fixed;
      padding: 80px 20px;
      color: white;
      text-align: center;
      margin: 0 -12px 20px -12px !important;
    }
    
    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 24px;
      opacity: 0.95;
    }
    
    .hero .btn {
      background-color: #FFFFFF;
      color: #25D366;
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .hero .btn:hover {
      background-color: #F0FDF4;
      color: #128C7E;
      transform: translateY(-2px);
    }
    
    .card {
      border: 1px solid #E0E0E0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      border-radius: 8px;
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.1);
      border-color: #25D366;
    }
    
    .card-title {
      color: #3C3C3C;
      font-weight: 600;
    }
    
    .card-text {
      color: #7A7A7A;
    }
    
    .badge {
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    
    .badge.bg-primary {
      background-color: #25D366 !important;
      color: white;
    }
    
    .badge.bg-success {
      background-color: #31A24C !important;
      color: white;
    }
    
    .badge.bg-warning {
      background-color: #F59E0B !important;
      color: white;
    }
    
    .badge.bg-info {
      background-color: #128C7E !important;
      color: white;
    }
    
    .badge.bg-danger {
      background-color: #EF4444 !important;
      color: white;
    }
    
    h2 {
      color: #025E2B;
      font-weight: 700;
      margin-bottom: 32px;
      letter-spacing: -0.5px;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      background-attachment: fixed;
      padding: 60px 30px;
      border-radius: 16px;
      text-align: center;
      color: white;
    }
    
    .cta-section h3 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .cta-section p {
      font-size: 1.1rem;
      opacity: 0.95;
    }
    
    .cta-section .btn-primary {
      background-color: #FFFFFF;
      color: #25D366;
      border: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .cta-section .btn-primary:hover {
      background-color: #F0FDF4;
      color: #128C7E;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .shadow {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06) !important;
    }
  `]
})
export class HomeComponent implements OnInit {
  barbers: any[] = [];
  services: any[] = [];
  products: Product[] = [];
  barberInfo: BarberInfo | null = null;
  authState: AuthState | null = null;

  constructor(
    private barberService: BarberService,
    private servicesService: BarberServicesService,
    private barberInfoService: BarberInfoService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.barberService.barbers.subscribe((barbers: any[]) => {
      this.barbers = barbers;
    });
    this.servicesService.services.subscribe((services: any[]) => {
      this.services = services;
    });
    this.barberInfoService.barberInfo$.subscribe((info: BarberInfo) => {
      this.barberInfo = info;
    });
    this.productService.products$.subscribe((products: Product[]) => {
      this.products = products;
    });
    this.authService.authState$.subscribe(state => {
      this.authState = state;
    });
  }

  getReservaLink(): string[] {
    if (this.authState?.isLoggedIn && this.authState?.user?.type === 'client') {
      return ['/cliente/booking'];
    }
    return ['/login'];
  }

  getReservaText(): string {
    if (this.authState?.isLoggedIn && this.authState?.user?.type === 'client') {
      return 'Reservar Ahora';
    }
    return 'Inicia Sesión para Reservar';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'hair_care': 'Cuidado Capilar',
      'beard_care': 'Cuidado de Barba',
      'styling': 'Estilismo',
      'skincare': 'Cuidado de Piel',
      'other': 'Otro'
    };
    return labels[category] || 'Productos';
  }
}
