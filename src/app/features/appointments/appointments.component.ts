import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AppointmentService, Appointment } from '../../core/services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-lg py-4">
      <h2 class="h2 mb-5">Mis Citas</h2>

      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="card border-start border-5 border-primary">
            <div class="card-body">
              <div class="fs-3 fw-bold text-primary">{{ appointments.length }}</div>
              <div class="text-muted">Total de citas</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-start border-5 border-success">
            <div class="card-body">
              <div class="fs-3 fw-bold text-success">{{ completedCount }}</div>
              <div class="text-muted">Citas completadas</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-start border-5 border-warning">
            <div class="card-body">
              <div class="fs-3 fw-bold text-warning">{{ scheduledCount }}</div>
              <div class="text-muted">Citas programadas</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="appointments.length === 0" class="alert alert-info text-center py-5">
        <svg class="w-16 h-16 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="mb-3">No tienes citas programadas</p>
        <a href="/booking" class="btn btn-primary">Reservar una cita →</a>
      </div>

      <div *ngIf="appointments.length > 0" class="row g-4">
        <div *ngFor="let appointment of appointments" class="col-12">
          <div class="card h-100 shadow-sm hover-shadow-lg">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 class="h5 mb-1">{{ appointment.clientName }}</h3>
                  <p class="text-muted small">{{ getServiceName(appointment.serviceId) }}</p>
                </div>
                <span [ngClass]="getStatusBadgeClass(appointment.status)" class="badge">
                  {{ getStatusLabel(appointment.status) }}
                </span>
              </div>

              <div class="row g-3 mb-3 text-sm">
                <div class="col-md-3">
                  <span class="text-muted">📅 Fecha</span>
                  <p class="fw-bold">{{ formatAppointmentDate(appointment.date) }}</p>
                </div>
                <div class="col-md-3">
                  <span class="text-muted">🕐 Hora</span>
                  <p class="fw-bold">{{ appointment.time }}</p>
                </div>
                <div class="col-md-3">
                  <span class="text-muted">⏱️ Duración</span>
                  <p class="fw-bold">{{ appointment.duration }} minutos</p>
                </div>
                <div class="col-md-3">
                  <span class="text-muted">📱 Teléfono</span>
                  <p class="fw-bold">{{ appointment.clientPhone }}</p>
                </div>
              </div>

              <hr>

              <p class="text-muted small mb-1">Correo: {{ appointment.clientEmail }}</p>
              <p *ngIf="appointment.notes" class="text-muted small">Notas: {{ appointment.notes }}</p>

              <div class="d-flex gap-2 mt-3">
                <button 
                  *ngIf="appointment.status === 'scheduled'"
                  (click)="cancelAppointment(appointment.id)"
                  class="flex-grow-1 btn btn-danger">
                  Cancelar Cita
                </button>
                <button 
                  *ngIf="appointment.status !== 'completed'"
                  (click)="editAppointment(appointment.id)"
                  class="flex-grow-1 btn btn-primary">
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-lg {
      max-width: 900px;
      margin: 0 auto;
    }
    
    h2 {
      color: #025E2B;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    h5 {
      color: #025E2B;
      font-weight: 600;
    }
    
    .card {
      border: 1px solid #E0E0E0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.1);
    }
    
    .card-body {
      padding: 24px;
    }
    
    .border-start {
      border-left: 4px solid !important;
    }
    
    .border-primary {
      border-left-color: #25D366 !important;
    }
    
    .border-success {
      border-left-color: #31A24C !important;
    }
    
    .border-warning {
      border-left-color: #F59E0B !important;
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
    
    .badge.bg-danger {
      background-color: #EF4444 !important;
      color: white;
    }
    
    .badge.bg-secondary {
      background-color: #9CA3AF !important;
      color: white;
    }
    
    .btn {
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn-primary {
      background-color: #25D366;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #1FA857;
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
    
    .alert {
      border-radius: 8px;
      border: none;
    }
    
    .alert-info {
      background-color: #F0F9FF;
      color: #0369A1;
      border-left: 4px solid #128C7E;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    .hover-shadow-lg:hover {
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1) !important;
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
    
    hr {
      border-color: #E0E0E0;
      opacity: 1;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  completedCount = 0;
  scheduledCount = 0;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.appointments.subscribe(appointments => {
      this.appointments = appointments;
      this.updateStats();
    });
  }

  private updateStats(): void {
    this.completedCount = this.appointments.filter(a => a.status === 'completed').length;
    this.scheduledCount = this.appointments.filter(a => a.status === 'scheduled').length;
  }

  getAppointmentClass(status: string): string {
    switch(status) {
      case 'completed': return 'bg-light border-success';
      case 'cancelled': return 'bg-light border-danger';
      default: return 'bg-light border-primary';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'scheduled': return 'badge bg-primary';
      case 'completed': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'scheduled': 'Programada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || 'Desconocida';
  }

  formatAppointmentDate(date: Date): string {
    return formatDate(new Date(date), 'dd/MM/yyyy', 'en-US');
  }

  getServiceName(serviceId: string): string {
    // Aquí iríamos a buscar el nombre del servicio
    // Por ahora retornamos un placeholder
    return 'Servicio de Barbería';
  }

  cancelAppointment(id: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.appointmentService.updateAppointment(id, { status: 'cancelled' });
    }
  }

  editAppointment(id: string): void {
    alert('La funcionalidad de edición será implementada próximamente');
  }
}
