import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberServicesService } from '../../core/services/barber-services.service';

@Component({
  selector: 'app-service-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Servicios ({{ services.length }})</h4>
            <button class="btn btn-light btn-sm" (click)="toggleAddForm()">
              {{ showAddForm ? '✖️ Cancelar' : '➕ Nuevo Servicio' }}
            </button>
          </div>
          <div class="card-body">
            <!-- Formulario Nuevo Servicio -->
            <form *ngIf="showAddForm" (ngSubmit)="addService()" class="mb-4 p-3 bg-light border rounded">
              <h5 class="mb-3">Agregar Nuevo Servicio</h5>
              <div class="row mb-3">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre *</label>
                  <input type="text" class="form-control" [(ngModel)]="newService.name" name="name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Precio (€) *</label>
                  <input type="number" class="form-control" [(ngModel)]="newService.price" name="price"
                         step="0.01" min="0" required>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Duración (minutos) *</label>
                  <input type="number" class="form-control" [(ngModel)]="newService.duration" name="duration"
                         min="5" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Categoría *</label>
                  <select class="form-select" [(ngModel)]="newService.category" name="category" required>
                    <option value="haircut">Corte de Cabello</option>
                    <option value="beard">Diseño de Barba</option>
                    <option value="complete">Corte + Barba</option>
                    <option value="special">Especial</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="2" [(ngModel)]="newService.description"
                          name="description" placeholder="..."></textarea>
              </div>
              <button type="submit" class="btn btn-success">Agregar Servicio</button>
            </form>

            <!-- Lista Servicios -->
            <div *ngIf="services.length === 0" class="alert alert-info">
              No hay servicios. ¡Crea uno nuevo!
            </div>

            <div *ngFor="let service of services" class="card mb-3 border">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-8">
                    <h5 class="card-title mb-1">{{ service.name }}</h5>
                    <p class="text-muted small mb-2">{{ service.description }}</p>
                    <div class="mb-2">
                      <span class="badge bg-success">{{ service.category }}</span>
                    </div>
                    <p class="mb-0">
                      <strong>Precio:</strong> {{ service.price }}€ | 
                      <strong>Duración:</strong> {{ service.duration }} minutos
                    </p>
                  </div>
                  <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-warning me-2" (click)="editService(service)">
                      ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteService(service.id)">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Lateral -->
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Información</h5>
          </div>
          <div class="card-body">
            <p class="mb-2">
              <strong>Total Servicios:</strong> {{ services.length }}
            </p>
            <p class="mb-2">
              <strong>Precio Promedio:</strong> {{ getAveragePrice() }}€
            </p>
            <p class="mb-0">
              <strong>Duración Promedio:</strong> {{ getAverageDuration() }} min
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Sugerencias</h5>
          </div>
          <div class="card-body">
            <p class="small">
              💡 Asegúrate de que tus servicios tengan precios competitivos y descripciones atractivas.
            </p>
            <p class="small">
              💡 Los servicios con duración apropiada mejoran la satisfacción del cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #E0E0E0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }
    
    .card-header {
      border-bottom: 1px solid #E0E0E0;
      border-radius: 8px 8px 0 0;
      padding: 16px 24px;
    }
    
    .card-header.bg-primary {
      background-color: #25D366 !important;
      color: white;
    }
    
    .card-header.bg-info {
      background-color: #128C7E !important;
      color: white;
    }
    
    .card-header.bg-warning {
      background-color: #F59E0B !important;
      color: white;
    }
    
    .card-body {
      padding: 24px;
    }
    
    .card-title {
      color: #025E2B;
      font-weight: 600;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    .border {
      border: 1px solid #E0E0E0 !important;
    }
    
    h4, h5 {
      color: #025E2B;
    }
    
    .form-label {
      color: #3C3C3C;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .form-control,
    .form-select {
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 10px 12px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #25D366;
      box-shadow: 0 0 0 0.2rem rgba(37, 211, 102, 0.15);
      outline: none;
    }
    
    .btn {
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background-color: #25D366;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #1FA857;
      color: white;
    }
    
    .btn-success {
      background-color: #31A24C;
      color: white;
    }
    
    .btn-success:hover {
      background-color: #228C40;
      color: white;
    }
    
    .btn-warning {
      background-color: #F59E0B;
      color: white;
    }
    
    .btn-warning:hover {
      background-color: #D97706;
      color: white;
    }
    
    .btn-danger {
      background-color: #EF4444;
      color: white;
    }
    
    .btn-danger:hover {
      background-color: #DC2626;
      color: white;
    }
    
    .btn-light {
      background-color: #FFFFFF;
      border: 1px solid #E0E0E0;
      color: #3C3C3C;
    }
    
    .btn-light:hover {
      background-color: #F5F5F5;
      border-color: #D0D0D0;
    }
    
    .badge {
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    
    .badge.bg-success {
      background-color: #31A24C !important;
      color: white;
    }
    
    .alert {
      border-radius: 8px;
      border: none;
    }
    
    .alert-info {
      background-color: #F0F9FF;
      color: #0369A1;
      border-left: 4px solid #128C7E;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .text-end {
      text-align: right;
    }
    
    .text-dark {
      color: #3C3C3C !important;
    }
    
    .me-2 {
      margin-right: 0.5rem;
    }
    
    .rounded {
      border-radius: 6px;
    }
    
    strong {
      font-weight: 600;
    }
  `]
})
export class ServiceManagerComponent implements OnInit {
  services: any[] = [];
  showAddForm = false;

  newService = {
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'haircut'
  };

  constructor(private barberServicesService: BarberServicesService) {}

  ngOnInit(): void {
    this.barberServicesService.services.subscribe((services: any) => {
      this.services = services;
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  addService(): void {
    if (this.newService.name && this.newService.price > 0) {
      this.barberServicesService.addService(this.newService as any);
      this.resetForm();
      this.showAddForm = false;
      alert('✅ Servicio agregado correctamente');
    }
  }

  editService(service: any): void {
    const newPrice = prompt('Nuevo precio:', service.price.toString());
    if (newPrice !== null) {
      this.barberServicesService.updateService(service.id, { price: parseFloat(newPrice) });
      alert('✅ Servicio actualizado');
    }
  }

  deleteService(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      this.barberServicesService.deleteService(id);
      alert('✅ Servicio eliminado');
    }
  }

  getAveragePrice(): string {
    if (this.services.length === 0) return '0';
    const total = this.services.reduce((sum, s) => sum + s.price, 0);
    return (total / this.services.length).toFixed(2);
  }

  getAverageDuration(): number {
    if (this.services.length === 0) return 0;
    const total = this.services.reduce((sum, s) => sum + s.duration, 0);
    return Math.round(total / this.services.length);
  }

  resetForm(): void {
    this.newService = {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: 'haircut'
    };
  }
}
