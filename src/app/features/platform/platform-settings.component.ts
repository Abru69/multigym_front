import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Configuración de Plataforma</h2>
          <p class="page-sub">Ajustes globales del sistema SaaS MultiGym</p>
        </div>
        <button class="btn-primary" (click)="save()">Guardar cambios</button>
      </div>

      <div class="settings-grid">
        <!-- General -->
        <div class="settings-card">
          <div class="card-header"><span class="card-icon">🏢</span><h3>General</h3></div>
          <div class="form-fields">
            <div class="form-field"><label>Nombre de la plataforma</label><input [(ngModel)]="cfg.platformName"></div>
            <div class="form-field"><label>Dominio principal</label><input [(ngModel)]="cfg.domain"></div>
            <div class="form-field"><label>Email de soporte</label><input type="email" [(ngModel)]="cfg.supportEmail"></div>
            <div class="form-field"><label>Zona horaria</label>
              <select [(ngModel)]="cfg.timezone">
                <option>America/Mexico_City</option>
                <option>America/New_York</option>
                <option>Europe/Madrid</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Trial -->
        <div class="settings-card">
          <div class="card-header"><span class="card-icon">⏱️</span><h3>Período Trial</h3></div>
          <div class="form-fields">
            <div class="form-field"><label>Duración del trial (días)</label><input type="number" [(ngModel)]="cfg.trialDays"></div>
            <div class="form-field"><label>Plan por defecto en trial</label>
              <select [(ngModel)]="cfg.defaultTrialPlan">
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
            <div class="toggle-field">
              <div><div class="tgl-label">Requerir tarjeta para trial</div><div class="tgl-sub">Si está activo, se exige método de pago al registrarse</div></div>
              <div class="toggle" [class.on]="cfg.requireCard" (click)="cfg.requireCard = !cfg.requireCard"><div class="toggle-knob"></div></div>
            </div>
            <div class="toggle-field">
              <div><div class="tgl-label">Email de expiración</div><div class="tgl-sub">Notificar al tenant 3 días antes de que expire el trial</div></div>
              <div class="toggle" [class.on]="cfg.trialEmail" (click)="cfg.trialEmail = !cfg.trialEmail"><div class="toggle-knob"></div></div>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="settings-card">
          <div class="card-header"><span class="card-icon">🔐</span><h3>Seguridad</h3></div>
          <div class="form-fields">
            <div class="form-field"><label>Tiempo de sesión (minutos)</label><input type="number" [(ngModel)]="cfg.sessionTimeout"></div>
            <div class="toggle-field">
              <div><div class="tgl-label">Autenticación 2FA</div><div class="tgl-sub">Requerir 2FA para acceso al panel de plataforma</div></div>
              <div class="toggle" [class.on]="cfg.twoFactor" (click)="cfg.twoFactor = !cfg.twoFactor"><div class="toggle-knob"></div></div>
            </div>
            <div class="toggle-field">
              <div><div class="tgl-label">Registro de IPs</div><div class="tgl-sub">Guardar IP en cada acción del log de auditoría</div></div>
              <div class="toggle" [class.on]="cfg.logIp" (click)="cfg.logIp = !cfg.logIp"><div class="toggle-knob"></div></div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-card">
          <div class="card-header"><span class="card-icon">🔔</span><h3>Notificaciones</h3></div>
          <div class="form-fields">
            <div class="toggle-field">
              <div><div class="tgl-label">Nuevo tenant</div><div class="tgl-sub">Notificar al crear un nuevo gimnasio</div></div>
              <div class="toggle" [class.on]="cfg.notifyNew" (click)="cfg.notifyNew = !cfg.notifyNew"><div class="toggle-knob"></div></div>
            </div>
            <div class="toggle-field">
              <div><div class="tgl-label">Pago fallido</div><div class="tgl-sub">Alerta cuando falla un cobro</div></div>
              <div class="toggle" [class.on]="cfg.notifyFail" (click)="cfg.notifyFail = !cfg.notifyFail"><div class="toggle-knob"></div></div>
            </div>
            <div class="toggle-field">
              <div><div class="tgl-label">Reporte semanal</div><div class="tgl-sub">Enviar resumen semanal por email</div></div>
              <div class="toggle" [class.on]="cfg.weeklyReport" (click)="cfg.weeklyReport = !cfg.weeklyReport"><div class="toggle-knob"></div></div>
            </div>
            <div class="form-field"><label>Email para alertas</label><input type="email" [(ngModel)]="cfg.alertEmail"></div>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="danger-zone">
        <div class="danger-header">
          <span class="danger-icon">⚠️</span>
          <div><h3>Zona de peligro</h3><p>Estas acciones son irreversibles. Úsalas con precaución.</p></div>
        </div>
        <div class="danger-actions">
          <button class="danger-btn">🗑 Limpiar logs de auditoría</button>
          <button class="danger-btn">🔄 Resetear configuración</button>
          <button class="danger-btn red">⛔ Poner plataforma en mantenimiento</button>
        </div>
      </div>
    </div>

    <div class="toast" *ngIf="saved">✅ Configuración guardada</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing:border-box; }
    .page { display:flex; flex-direction:column; gap:1.25rem; font-family:'Inter',sans-serif; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
    .page-title { color:#fff; font-size:1.3rem; font-weight:700; margin:0; }
    .page-sub   { color:rgba(255,255,255,0.4); font-size:0.82rem; margin:0.25rem 0 0; }
    .btn-primary { background:linear-gradient(135deg,#6c63ff,#48cae4); color:#fff; border:none; border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(108,99,255,0.35); }

    .settings-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:1rem; }
    .settings-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:1.5rem; }
    .card-header { display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; }
    .card-icon { font-size:1.2rem; }
    .card-header h3 { color:#fff; font-size:0.95rem; font-weight:700; margin:0; }

    .form-fields { display:flex; flex-direction:column; gap:1rem; }
    .form-field { display:flex; flex-direction:column; gap:0.4rem; }
    .form-field label { color:rgba(255,255,255,0.55); font-size:0.78rem; font-weight:500; }
    .form-field input, .form-field select { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:9px; padding:0.6rem 0.85rem; color:#fff; font-size:0.87rem; outline:none; transition:all 0.2s; font-family:'Inter',sans-serif; }
    .form-field input:focus, .form-field select:focus { border-color:#6c63ff; box-shadow:0 0 0 3px rgba(108,99,255,0.2); }
    .form-field select option { background:#181828; }

    /* Toggle */
    .toggle-field { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.5rem 0; }
    .tgl-label { color:rgba(255,255,255,0.8); font-size:0.85rem; font-weight:500; margin-bottom:0.15rem; }
    .tgl-sub   { color:rgba(255,255,255,0.35); font-size:0.72rem; }
    .toggle { width:44px; height:24px; border-radius:100px; background:rgba(255,255,255,0.1); cursor:pointer; position:relative; transition:background 0.3s; flex-shrink:0; }
    .toggle.on { background:linear-gradient(135deg,#6c63ff,#48cae4); }
    .toggle-knob { position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform 0.3s; box-shadow:0 1px 4px rgba(0,0,0,0.3); }
    .toggle.on .toggle-knob { transform:translateX(20px); }

    /* Danger zone */
    .danger-zone { background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); border-radius:14px; padding:1.5rem; }
    .danger-header { display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; }
    .danger-icon { font-size:1.5rem; }
    .danger-header h3 { color:#f87171; font-size:0.95rem; font-weight:700; margin:0 0 0.2rem; }
    .danger-header p  { color:rgba(255,255,255,0.4); font-size:0.78rem; margin:0; }
    .danger-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }
    .danger-btn { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:rgba(255,255,255,0.65); border-radius:10px; padding:0.6rem 1rem; font-size:0.82rem; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
    .danger-btn:hover { background:rgba(239,68,68,0.15); color:#fff; }
    .danger-btn.red { background:rgba(239,68,68,0.15); color:#f87171; border-color:rgba(239,68,68,0.4); }

    .toast { position:fixed; bottom:1.5rem; right:1.5rem; background:#166534; color:#4ade80; border:1px solid rgba(74,222,128,0.3); padding:0.75rem 1.25rem; border-radius:10px; font-size:0.85rem; font-weight:600; z-index:200; font-family:'Inter',sans-serif; }
  `]
})
export class PlatformSettingsComponent {
  saved = false;

  cfg = {
    platformName: 'MultiGym Platform',
    domain: 'multigym.com',
    supportEmail: 'soporte@multigym.com',
    timezone: 'America/Mexico_City',
    trialDays: 14,
    defaultTrialPlan: 'STARTER',
    requireCard: false,
    trialEmail: true,
    sessionTimeout: 480,
    twoFactor: false,
    logIp: true,
    notifyNew: true,
    notifyFail: true,
    weeklyReport: false,
    alertEmail: 'admin@saas.com',
  };

  save(): void {
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
