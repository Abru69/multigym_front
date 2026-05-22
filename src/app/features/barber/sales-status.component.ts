import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesStatus } from '../../core/models/sales.model';
import { SalesService } from '../../core/services/sales.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-sales-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <!-- Estado del Local -->
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Estado del Local</h4>
          </div>
          <div class="card-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card bg-light text-center">
                  <div class="card-body">
                    <h5 class="card-title">Estado Actual</h5>
                    <button [class]="'btn btn-lg ' + (salesStatus?.isOpenToday ? 'btn-success' : 'btn-danger')"
                            (click)="toggleStore()">
                      {{ salesStatus?.isOpenToday ? '🟢 ABIERTO' : '🔴 CERRADO' }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h5 class="card-title">Notas del Día</h5>
                    <textarea class="form-control" rows="3" [(ngModel)]="notesForToday"
                              placeholder="Agrega notas sobre el estado del local..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estadísticas del Día -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="card border-primary">
                  <div class="card-body text-center">
                    <h6 class="card-title text-muted">Citas del Día</h6>
                    <div class="display-4 fw-bold text-primary">{{ appointmentsTodayCount }}</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-success">
                  <div class="card-body text-center">
                    <h6 class="card-title text-muted">Ventas (€)</h6>
                    <div class="display-4 fw-bold text-success">{{ salesStatus?.totalSales || 0 }}</div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-warning">
                  <div class="card-body text-center">
                    <h6 class="card-title text-muted">Ingresos Estimados</h6>
                    <div class="display-4 fw-bold text-warning">{{ getEstimatedRevenue() }}€</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actualizar Ventas -->
            <div class="card bg-light">
              <div class="card-header">
                <h5 class="mb-0">Actualizar Ventas de Hoy</h5>
              </div>
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Total Vendido (€)</label>
                    <input type="number" class="form-control" [(ngModel)]="todaysSales"
                           (ngModelChange)="updateSalesInfo()" step="0.01" min="0">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Citas Realizadas</label>
                    <input type="number" class="form-control" [(ngModel)]="appointmentsCompleted"
                           (ngModelChange)="updateSalesInfo()" min="0">
                  </div>
                </div>
                <button class="btn btn-success w-100" (click)="saveToday()">
                  💾 Guardar Jornada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Información -->
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Información del Día</h5>
          </div>
          <div class="card-body">
            <p class="mb-2">
              <strong>Fecha:</strong> {{ getCurrentDate() }}
            </p>
            <p class="mb-2">
              <strong>Hora Actual:</strong> {{ getCurrentTime() }}
            </p>
            <p class="mb-2">
              <strong>Total Citas:</strong> {{ appointmentsTodayCount }}
            </p>
            <p class="mb-0">
              <strong>Ingreso por Cita:</strong> {{ getAveragePerAppointment() }}€
            </p>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Consejos</h5>
          </div>
          <div class="card-body">
            <p class="small mb-2">
              💡 Registra tus ventas diariamente para un mejor control.
            </p>
            <p class="small mb-2">
              💡 Actualiza el estado del local para que tus clientes sepan si estás disponible.
            </p>
            <p class="small mb-0">
              💡 Las notas te ayudan a recordar eventos importantes del día.
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
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    h4, h5, h6 {
      color: #025E2B;
    }
    
    .card-title {
      color: #025E2B;
      font-weight: 600;
    }
    
    .border-primary {
      border-left: 4px solid #25D366 !important;
    }
    
    .border-success {
      border-left: 4px solid #31A24C !important;
    }
    
    .border-warning {
      border-left: 4px solid #F59E0B !important;
    }
    
    .text-primary {
      color: #25D366 !important;
    }
    
    .text-success {
      color: #31A24C !important;
    }
    
    .text-warning {
      color: #F59E0B !important;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .text-dark {
      color: #3C3C3C !important;
    }
    
    .form-label {
      color: #3C3C3C;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .form-control {
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 10px 12px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus {
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
    
    .btn-lg {
      padding: 12px 24px;
      font-size: 1rem;
    }
    
    .btn-success {
      background-color: #31A24C;
      color: white;
    }
    
    .btn-success:hover {
      background-color: #228C40;
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
    
    .btn-primary {
      background-color: #25D366;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #1FA857;
      color: white;
    }
    
    .display-4 {
      font-size: 3.5rem;
    }
    
    .fw-bold {
      font-weight: 700;
    }
    
    .w-100 {
      width: 100%;
    }
    
    .text-center {
      text-align: center;
    }
  `]
})
export class SalesStatusComponent implements OnInit {
  @Input() salesStatus: SalesStatus | null = null;

  todaysSales = 0;
  appointmentsCompleted = 0;
  appointmentsTodayCount = 0;
  notesForToday = '';

  constructor(
    private salesService: SalesService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    if (this.salesStatus) {
      this.todaysSales = this.salesStatus.totalSales;
      this.appointmentsCompleted = this.salesStatus.appointmentCount;
      this.notesForToday = this.salesStatus.notes || '';
    }

    this.appointmentService.appointments.subscribe((appointments: any) => {
      const today = new Date().toDateString();
      this.appointmentsTodayCount = appointments.filter((a: any) => {
        const appointmentDate = new Date(a.date).toDateString();
        return appointmentDate === today;
      }).length;
    });
  }

  updateSalesInfo(): void {
    // Real-time update in the component
  }

  toggleStore(): void {
    if (this.salesStatus) {
      this.salesService.toggleStoreOpen(!this.salesStatus.isOpenToday);
    }
  }

  saveToday(): void {
    this.salesService.updateTodaysSales(
      this.todaysSales,
      this.appointmentsCompleted,
      this.salesStatus?.isOpenToday || true,
      this.notesForToday
    );
    alert('✅ Jornada guardada correctamente');
  }

  getEstimatedRevenue(): number {
    // Estimado: citas × precio promedio + ventas de productos
    return Math.round(this.appointmentsTodayCount * 25 + this.todaysSales);
  }

  getAveragePerAppointment(): string {
    if (this.appointmentsTodayCount === 0) return '0.00';
    const average = this.todaysSales / this.appointmentsTodayCount;
    return average.toFixed(2);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
