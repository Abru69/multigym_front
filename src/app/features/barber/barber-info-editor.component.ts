import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberInfo } from '../../core/models/barber-info.model';
import { BarberInfoService } from '../../core/services/barber-info.service';
import { ImageUploadService } from '../../core/services/image-upload.service';

@Component({
  selector: 'app-barber-info-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Información de la Barbería</h4>
          </div>
          <div class="card-body">
            <form (ngSubmit)="saveChanges()">
              <!-- Logo Upload Section -->
              <div class="mb-4 pb-4 border-bottom">
                <label class="form-label fw-bold">📷 Logo de la Barbería</label>
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <div *ngIf="editForm.logo" class="mb-3">
                      <img [src]="editForm.logo" alt="Logo" class="img-thumbnail" style="max-width: 150px; max-height: 150px;">
                    </div>
                    <div *ngIf="!editForm.logo" class="mb-3 py-5 text-muted">
                      <div style="font-size: 3rem;">📸</div>
                      <p class="mb-0">Sin logo cargado</p>
                    </div>
                    <div class="mb-3">
                      <input 
                        type="file" 
                        class="form-control" 
                        accept="image/*"
                        (change)="onLogoSelected($event)"
                        #logoInput>
                      <small class="text-muted d-block mt-2">Máximo 5MB. Formatos: JPEG, PNG, WebP, GIF</small>
                    </div>
                    <div class="d-flex gap-2">
                      <button 
                        type="button" 
                        class="btn btn-primary flex-grow-1"
                        (click)="logoInput.click()">
                        Seleccionar Logo
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-danger"
                        *ngIf="editForm.logo"
                        (click)="removeLogo()">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nombre y Descripción -->
              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Nombre de la Barbería *</label>
                  <input type="text" class="form-control" [(ngModel)]="editForm.name" name="name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Email *</label>
                  <input type="email" class="form-control" [(ngModel)]="editForm.email" name="email" required>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold">Descripción</label>
                <textarea class="form-control" rows="3" [(ngModel)]="editForm.description" name="description" 
                          placeholder="Cuéntale a tus clientes sobre tu barbería..."></textarea>
              </div>

              <!-- Ubicación y Teléfono -->
              <div class="row mb-4">
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Ubicación *</label>
                  <input type="text" class="form-control" [(ngModel)]="editForm.location" name="location" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Teléfono *</label>
                  <input type="tel" class="form-control" [(ngModel)]="editForm.phone" name="phone" required>
                </div>
              </div>

              <!-- Redes Sociales -->
              <div class="card mb-4 bg-light">
                <div class="card-header">
                  <h5 class="mb-0">Redes Sociales</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Instagram</label>
                      <input type="text" class="form-control" [(ngModel)]="editForm.socialMedia!.instagram" 
                             name="instagram" placeholder="@tu_cuenta">
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Facebook</label>
                      <input type="text" class="form-control" [(ngModel)]="editForm.socialMedia!.facebook" 
                             name="facebook" placeholder="Tu página">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">WhatsApp</label>
                      <input type="tel" class="form-control" [(ngModel)]="editForm.socialMedia!.whatsapp" 
                             name="whatsapp" placeholder="+34 600 123 456">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Messages -->
              <div *ngIf="successMessage" class="alert alert-success mb-3">
                {{ successMessage }}
              </div>
              <div *ngIf="errorMessage" class="alert alert-danger mb-3">
                {{ errorMessage }}
              </div>

              <button type="submit" class="btn btn-primary btn-lg">
                💾 Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Horarios -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Horarios de Apertura</h5>
          </div>
          <div class="card-body">
            <div *ngFor="let day of days" class="mb-3">
              <label class="form-label fw-bold small">{{ day.label }}</label>
              <div class="d-flex gap-2">
                <input type="time" class="form-control form-control-sm" 
                       [(ngModel)]="editForm.openingHours[day.key].start" 
                       [name]="'start_' + day.key"
                       [disabled]="editForm.openingHours[day.key].closed">
                <input type="time" class="form-control form-control-sm" 
                       [(ngModel)]="editForm.openingHours[day.key].end"
                       [name]="'end_' + day.key"
                       [disabled]="editForm.openingHours[day.key].closed">
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" 
                         [(ngModel)]="editForm.openingHours[day.key].closed"
                         [name]="'closed_' + day.key"
                         [id]="'closed_' + day.key">
                  <label class="form-check-label" [for]="'closed_' + day.key">Cerrado</label>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-success btn-sm w-100 mt-3" (click)="saveHours()">
              Guardar Horarios
            </button>
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
    }
    
    .card-header.bg-primary {
      background-color: #25D366 !important;
      color: white;
    }
    
    .card-header.bg-success {
      background-color: #31A24C !important;
      color: white;
    }
    
    .card-body {
      padding: 24px;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    .form-label {
      color: #3C3C3C;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .form-control,
    .form-control-sm {
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 10px 12px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus,
    .form-control-sm:focus {
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
    
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.875rem;
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
    
    .alert-danger {
      background-color: #FEF2F2;
      color: #7F1D1D;
      border-left: 4px solid #EF4444;
    }
    
    .border-bottom {
      border-bottom: 1px solid #E0E0E0 !important;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    h4, h5 {
      color: #025E2B;
    }
    
    .img-thumbnail {
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 4px;
    }
    
    .w-100 {
      width: 100%;
    }
  `]
})
export class BarberInfoEditorComponent implements OnInit {
  @Input() barberInfo: BarberInfo | null = null;

  editForm!: BarberInfo;
  successMessage = '';
  errorMessage = '';
  isUploading = false;

  days = [
    { key: 'monday' as const, label: 'Lunes' },
    { key: 'tuesday' as const, label: 'Martes' },
    { key: 'wednesday' as const, label: 'Miércoles' },
    { key: 'thursday' as const, label: 'Jueves' },
    { key: 'friday' as const, label: 'Viernes' },
    { key: 'saturday' as const, label: 'Sábado' },
    { key: 'sunday' as const, label: 'Domingo' }
  ];

  constructor(
    private barberInfoService: BarberInfoService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    if (this.barberInfo) {
      this.editForm = JSON.parse(JSON.stringify(this.barberInfo));
      if (!this.editForm.socialMedia) {
        this.editForm.socialMedia = {
          instagram: '',
          facebook: '',
          whatsapp: ''
        };
      }
    }
  }

  async onLogoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    this.isUploading = true;
    this.errorMessage = '';

    try {
      const result = await this.imageUploadService.uploadImage(file);
      
      if (result.success && result.data) {
        // Comprimir imagen para ahorrar espacio
        const compressed = await this.imageUploadService.compressImage(result.data);
        this.editForm.logo = compressed;
        this.successMessage = '✅ Logo cargado correctamente';
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.errorMessage = result.error || 'Error al cargar la imagen';
      }
    } catch (error) {
      this.errorMessage = 'Error al procesar la imagen';
    } finally {
      this.isUploading = false;
      input.value = '';
    }
  }

  removeLogo(): void {
    this.editForm.logo = undefined;
    this.successMessage = '✅ Logo eliminado';
    setTimeout(() => this.successMessage = '', 2000);
  }

  saveChanges(): void {
    if (this.editForm) {
      this.barberInfoService.updateBarberInfo({
        name: this.editForm.name,
        email: this.editForm.email,
        description: this.editForm.description,
        location: this.editForm.location,
        phone: this.editForm.phone,
        logo: this.editForm.logo,
        socialMedia: this.editForm.socialMedia
      });
      this.successMessage = '✅ Información actualizada correctamente';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  saveHours(): void {
    if (this.editForm) {
      this.barberInfoService.updateBarberInfo({
        openingHours: this.editForm.openingHours
      });
      this.successMessage = '✅ Horarios actualizados correctamente';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }
}
