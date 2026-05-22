import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { BarberService } from '../../core/services/barber.service';
import { BarberServicesService } from '../../core/services/barber-services.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-lg">
      <h2 class="mb-5">Reservar Cita</h2>

      <div class="card shadow-sm">
        <div class="card-body">
        <form (ngSubmit)="onSubmit()" #bookingForm="ngForm" class="mb-4">
          <!-- Client Information -->
          <div class="mb-4 pb-4 border-bottom">
            <h3 class="h5 mb-3">Información Personal</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="clientName"
                  [(ngModel)]="formData.clientName" 
                  required
                  class="form-control"
                  placeholder="Juan García">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Correo Electrónico *</label>
                <input 
                  type="email" 
                  name="clientEmail"
                  [(ngModel)]="formData.clientEmail" 
                  required
                  class="form-control"
                  placeholder="juan@email.com">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Teléfono *</label>
                <input 
                  type="tel" 
                  name="clientPhone"
                  [(ngModel)]="formData.clientPhone" 
                  required
                  class="form-control"
                  placeholder="+34 600 123 456">
              </div>
            </div>
          </div>

          <!-- Barbero Selection - Único Barbero -->
          <div class="mb-4 pb-4 border-bottom">
            <h3 class="h5 mb-3">Tu Barbero</h3>
            <div *ngIf="barbers && barbers.length > 0" class="card bg-light">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="mb-2">{{ barbers[0].name }}</h5>
                    <p class="text-muted small mb-2">Barbero Profesional</p>
                    <div class="small">
                      <p class="mb-1">📧 {{ barbers[0].email }}</p>
                      <p class="mb-1">📱 {{ barbers[0].phone }}</p>
                      <p class="mb-0">🕐 {{ barbers[0].workingHours.start }} - {{ barbers[0].workingHours.end }}</p>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="rating" style="font-size: 1.5rem;">★ {{ barbers[0].rating }}</div>
                  </div>
                </div>
              </div>
            </div>
            <input type="hidden" [(ngModel)]="formData.barberId" name="barberId" [value]="barbers && barbers.length > 0 ? barbers[0].id : ''">
          </div>

          <!-- Service Selection -->
          <div class="mb-4 pb-4 border-bottom">
            <h3 class="h5 mb-3">Selecciona el Servicio</h3>
            <div class="row g-3">
              <div *ngFor="let service of services" class="col-md-6">
                <div class="form-check">
                  <input 
                    type="radio" 
                    [value]="service.id"
                    name="serviceId"
                    [(ngModel)]="formData.serviceId" 
                    required
                    [id]="'service_' + service.id"
                    class="form-check-input">
                  <label class="form-check-label d-block" [for]="'service_' + service.id">
                    <div class="fw-bold">{{ service.name }}</div>
                    <div class="small text-muted">{{ service.description }}</div>
                    <div class="small text-warning mt-1">{{ service.price }}€ | {{ service.duration }} min</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Date & Time Selection -->
          <div class="mb-4 pb-4 border-bottom">
            <h3 class="h5 mb-3">Selecciona Fecha y Hora</h3>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha *</label>
                <input 
                  type="date" 
                  name="date"
                  [(ngModel)]="formData.date" 
                  required
                  [min]="todayDate"
                  class="form-control">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Hora *</label>
                <select 
                  name="time"
                  [(ngModel)]="formData.time" 
                  required
                  class="form-select">
                  <option value="">Selecciona una hora</option>
                  <option *ngFor="let time of availableTimes" [value]="time">{{ time }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-4 pb-4 border-bottom">
            <h3 class="h5 mb-3">Notas Adicionales</h3>
            <textarea 
              name="notes"
              [(ngModel)]="formData.notes"
              rows="4"
              class="form-control"
              placeholder="Cuéntanos si tienes algún requerimiento especial..."></textarea>
          </div>

          <!-- Submit -->
          <div class="d-flex gap-3">
            <button 
              type="submit" 
              [disabled]="!bookingForm.valid"
              class="flex-1 btn btn-primary btn-lg">
              Confirmar Reserva
            </button>
            <button 
              type="reset" 
              class="flex-1 btn btn-outline-secondary btn-lg">
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show mt-4" role="alert">
        {{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''" aria-label="Close"></button>
      </div>
    </div>
  `,
  styles: [`
    .container-lg {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    h2 {
      color: #025E2B;
      font-weight: 700;
      margin-bottom: 32px;
      letter-spacing: -0.5px;
    }
    
    h3, h5 {
      color: #025E2B;
      font-weight: 600;
    }
    
    .card {
      border: 1px solid #E0E0E0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }
    
    .card-body {
      padding: 24px;
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
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #25D366;
      box-shadow: 0 0 0 0.2rem rgba(37, 211, 102, 0.15);
      outline: none;
    }
    
    .form-check-input {
      width: 20px;
      height: 20px;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .form-check-input:checked {
      background-color: #25D366;
      border-color: #25D366;
    }
    
    .form-check-input:focus {
      border-color: #25D366;
      box-shadow: 0 0 0 0.2rem rgba(37, 211, 102, 0.15);
    }
    
    .form-check-label {
      cursor: pointer;
      padding-left: 10px;
      padding-top: 2px;
    }
    
    .border-bottom {
      border-bottom: 1px solid #E0E0E0 !important;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
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
    
    .btn-primary:disabled {
      background-color: #BFBFBF;
      cursor: not-allowed;
    }
    
    .btn-outline-secondary {
      color: #7A7A7A;
      border: 1px solid #E0E0E0;
    }
    
    .btn-outline-secondary:hover {
      background-color: #F5F5F5;
      color: #3C3C3C;
      border-color: #D0D0D0;
    }
    
    .flex-1 {
      flex: 1;
    }
    
    .alert {
      border-radius: 8px;
      border: none;
    }
    
    .alert-success {
      background-color: #F0FDF4;
      color: #065F46;
      border-left: 4px solid #25D366;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .text-warning {
      color: #F59E0B !important;
    }
    
    .rating {
      color: #25D366;
      font-weight: 700;
    }
  `]
})
export class BookingComponent implements OnInit {
  barbers: any[] = [];
  services: any[] = [];
  availableTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  todayDate: string = '';
  successMessage: string = '';

  formData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    barberId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private barberService: BarberService,
    private servicesService: BarberServicesService
  ) {}

  ngOnInit(): void {
    this.setTodayDate();
    this.loadBarbers();
    this.loadServices();
  }

  private setTodayDate(): void {
    const today = new Date();
    this.todayDate = formatDate(today, 'yyyy-MM-dd', 'en-US');
  }

  private loadBarbers(): void {
    this.barberService.barbers.subscribe(barbers => {
      this.barbers = barbers.filter(b => b.available);
    });
  }

  private loadServices(): void {
    this.servicesService.services.subscribe(services => {
      this.services = services;
    });
  }

  onSubmit(): void {
    const appointment = {
      barberId: this.formData.barberId,
      clientName: this.formData.clientName,
      clientPhone: this.formData.clientPhone,
      clientEmail: this.formData.clientEmail,
      date: new Date(this.formData.date),
      time: this.formData.time,
      duration: this.getDurationForService(),
      serviceId: this.formData.serviceId,
      status: 'scheduled' as const,
      notes: this.formData.notes
    };

    this.appointmentService.createAppointment(appointment);
    this.successMessage = '¡Cita reservada exitosamente! Te enviaremos una confirmación por correo.';
    
    // Reset form
    setTimeout(() => {
      this.formData = {
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        barberId: '',
        serviceId: '',
        date: '',
        time: '',
        notes: ''
      };
      this.successMessage = '';
    }, 3000);
  }

  private getDurationForService(): number {
    const service = this.services.find(s => s.id === this.formData.serviceId);
    return service ? service.duration : 30;
  }
}
