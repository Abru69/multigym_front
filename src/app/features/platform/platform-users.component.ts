import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PlatformUser {
  id: string; name: string; email: string;
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'DEVOPS' | 'SALES';
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string; createdAt: string;
}

@Component({
  selector: 'app-platform-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Usuarios de Plataforma</h2>
          <p class="page-sub">Administra los usuarios con acceso al panel de administración</p>
        </div>
        <button class="btn-primary" (click)="openModal()">+ Nuevo Usuario</button>
      </div>

      <!-- Roles info -->
      <div class="roles-row">
        <div *ngFor="let r of roleCards" class="role-card">
          <span class="role-icon">{{ r.icon }}</span>
          <div>
            <div class="role-name">{{ r.role }}</div>
            <div class="role-desc">{{ r.desc }}</div>
          </div>
          <span class="role-count">{{ countByRole(r.role) }}</span>
        </div>
      </div>

      <!-- Search -->
      <div class="search-box">
        <span>🔍</span>
        <input [(ngModel)]="search" placeholder="Buscar usuario..." class="search-input">
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filtered" class="table-row">
              <td>
                <div class="user-cell">
                  <div class="u-avatar">{{ u.name[0] }}</div>
                  <div>
                    <div class="u-name">{{ u.name }}</div>
                    <div class="u-email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td><span class="role-badge" [class]="'role-' + u.role">{{ u.role }}</span></td>
              <td><span class="st-badge" [class]="'st-' + u.status">{{ u.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}</span></td>
              <td><span class="muted">{{ u.lastLogin }}</span></td>
              <td><span class="muted">{{ u.createdAt }}</span></td>
              <td>
                <div class="actions">
                  <button class="act-btn" (click)="editUser(u)" title="Editar">✏️</button>
                  <button class="act-btn" (click)="toggleUser(u)" [title]="u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'">
                    {{ u.status === 'ACTIVE' ? '⏸' : '▶' }}
                  </button>
                  <button class="act-btn delete" (click)="deleteUser(u)" title="Eliminar">🗑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Editar Usuario' : 'Nuevo Usuario de Plataforma' }}</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field">
              <label>Nombre completo</label>
              <input [(ngModel)]="form.name" placeholder="Juan García">
            </div>
            <div class="form-field">
              <label>Email</label>
              <input [(ngModel)]="form.email" type="email" placeholder="juan@saas.com">
            </div>
            <div class="form-field">
              <label>Rol</label>
              <select [(ngModel)]="form.role">
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="SUPPORT">Soporte</option>
                <option value="DEVOPS">DevOps</option>
                <option value="SALES">Ventas</option>
              </select>
            </div>
            <div class="form-field" *ngIf="!editing">
              <label>Contraseña temporal</label>
              <input type="password" [(ngModel)]="form.password" placeholder="••••••••">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" (click)="closeModal()">Cancelar</button>
          <button class="btn-primary" (click)="saveUser()">{{ editing ? 'Guardar' : 'Crear Usuario' }}</button>
        </div>
      </div>
    </div>

    <div class="toast" *ngIf="toast" [class]="'toast-' + toastType">{{ toast }}</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    .page { display: flex; flex-direction: column; gap: 1.25rem; font-family: 'Inter', sans-serif; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title { color: #fff; font-size: 1.3rem; font-weight: 700; margin: 0; }
    .page-sub   { color: rgba(255,255,255,0.4); font-size: 0.82rem; margin: 0.25rem 0 0; }

    .btn-primary { background: linear-gradient(135deg,#6c63ff,#48cae4); color:#fff; border:none; border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(108,99,255,0.35); }
    .btn-ghost { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }

    .roles-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 0.75rem; }
    .role-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 0.85rem;
    }
    .role-icon { font-size: 1.4rem; }
    .role-name { color: #fff; font-size: 0.82rem; font-weight: 600; }
    .role-desc { color: rgba(255,255,255,0.4); font-size: 0.72rem; }
    .role-count { margin-left: auto; color: #6c63ff; font-weight: 700; font-size: 1.1rem; }

    .search-box { display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.55rem 1rem; }
    .search-input { background:none; border:none; outline:none; color:#fff; font-size:0.87rem; width:100%; font-family:'Inter',sans-serif; }
    .search-input::placeholder { color:rgba(255,255,255,0.3); }

    .table-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; overflow:hidden; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th { background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.4); font-size:0.73rem; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.06); text-align:left; }
    .data-table td { padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
    .table-row:hover { background:rgba(255,255,255,0.03); }
    .table-row:last-child td { border-bottom:none; }

    .user-cell { display:flex; align-items:center; gap:0.75rem; }
    .u-avatar { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#6c63ff,#48cae4); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.85rem; flex-shrink:0; }
    .u-name  { color:#fff; font-size:0.85rem; font-weight:600; }
    .u-email { color:rgba(255,255,255,0.35); font-size:0.72rem; }
    .muted   { color:rgba(255,255,255,0.4); font-size:0.78rem; }

    .role-badge, .st-badge { padding:0.22rem 0.6rem; border-radius:20px; font-size:0.7rem; font-weight:700; }
    .role-SUPER_ADMIN { background:rgba(250,204,21,0.15); color:#facc15; }
    .role-SUPPORT     { background:rgba(96,165,250,0.15);  color:#60a5fa; }
    .role-DEVOPS      { background:rgba(52,211,153,0.15);  color:#34d399; }
    .role-SALES       { background:rgba(251,146,60,0.15);  color:#fb923c; }
    .st-ACTIVE   { background:rgba(34,197,94,0.15); color:#4ade80; }
    .st-INACTIVE { background:rgba(107,114,128,0.15); color:#9ca3af; }

    .actions { display:flex; gap:0.35rem; }
    .act-btn { width:30px; height:30px; border-radius:7px; border:none; cursor:pointer; font-size:0.78rem; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); transition:all 0.15s; }
    .act-btn.delete { background:rgba(239,68,68,0.1); }
    .act-btn:hover { transform:scale(1.1); filter:brightness(1.3); }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:100; padding:1rem; }
    .modal-box { background:#181828; border:1px solid rgba(255,255,255,0.1); border-radius:18px; width:100%; max-width:480px; animation:popIn 0.25s ease; }
    @keyframes popIn { from{transform:scale(0.94);opacity:0} to{transform:scale(1);opacity:1} }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.07); }
    .modal-header h3 { color:#fff; font-size:1rem; font-weight:700; margin:0; }
    .modal-close { background:none; border:none; color:rgba(255,255,255,0.4); font-size:1rem; cursor:pointer; padding:0.25rem; }
    .modal-body { padding:1.5rem; }
    .modal-footer { padding:1rem 1.5rem; border-top:1px solid rgba(255,255,255,0.07); display:flex; justify-content:flex-end; gap:0.75rem; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-field { display:flex; flex-direction:column; gap:0.4rem; }
    .form-field label { color:rgba(255,255,255,0.6); font-size:0.8rem; font-weight:500; }
    .form-field input, .form-field select { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:9px; padding:0.6rem 0.85rem; color:#fff; font-size:0.87rem; outline:none; transition:all 0.2s; font-family:'Inter',sans-serif; }
    .form-field input:focus, .form-field select:focus { border-color:#6c63ff; box-shadow:0 0 0 3px rgba(108,99,255,0.2); }
    .form-field select option { background:#181828; }

    .toast { position:fixed; bottom:1.5rem; right:1.5rem; padding:0.75rem 1.25rem; border-radius:10px; font-size:0.85rem; font-weight:600; font-family:'Inter',sans-serif; z-index:200; }
    .toast-success { background:#166534; color:#4ade80; border:1px solid rgba(74,222,128,0.3); }
    .toast-error   { background:#7f1d1d; color:#f87171; border:1px solid rgba(248,113,113,0.3); }
  `]
})
export class PlatformUsersComponent {
  search = ''; showModal = false; editing = false; editingId = '';
  toast = ''; toastType = 'success';
  form = { name: '', email: '', role: 'SUPPORT', password: '' };

  roleCards = [
    { icon: '👑', role: 'SUPER_ADMIN', desc: 'Acceso total' },
    { icon: '🎧', role: 'SUPPORT',     desc: 'Soporte a clientes' },
    { icon: '🛠',  role: 'DEVOPS',     desc: 'Infraestructura' },
    { icon: '📈', role: 'SALES',       desc: 'Ventas y demos' },
  ];

  users: PlatformUser[] = [
    { id:'1', name:'Carlos Herrera',  email:'carlos@saas.com',   role:'SUPER_ADMIN', status:'ACTIVE',   lastLogin:'Hoy, 12:36',     createdAt:'01 Ene 2026' },
    { id:'2', name:'Ana Martínez',    email:'ana@saas.com',      role:'SUPPORT',     status:'ACTIVE',   lastLogin:'Hoy, 09:14',     createdAt:'15 Ene 2026' },
    { id:'3', name:'Luis Ramírez',    email:'luis@saas.com',     role:'DEVOPS',      status:'ACTIVE',   lastLogin:'Ayer, 22:05',    createdAt:'20 Ene 2026' },
    { id:'4', name:'María Torres',    email:'maria@saas.com',    role:'SALES',       status:'ACTIVE',   lastLogin:'Hace 2 días',    createdAt:'01 Feb 2026' },
    { id:'5', name:'Pedro Gómez',     email:'pedro@saas.com',    role:'SUPPORT',     status:'INACTIVE', lastLogin:'Hace 2 semanas', createdAt:'10 Feb 2026' },
  ];

  countByRole(role: string): number { return this.users.filter(u => u.role === role).length; }

  get filtered(): PlatformUser[] {
    return this.users.filter(u =>
      u.name.toLowerCase().includes(this.search.toLowerCase()) ||
      u.email.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  openModal(): void { this.form = { name:'', email:'', role:'SUPPORT', password:'' }; this.editing = false; this.showModal = true; }
  closeModal(): void { this.showModal = false; }
  editUser(u: PlatformUser): void { this.form = { name:u.name, email:u.email, role:u.role, password:'' }; this.editingId = u.id; this.editing = true; this.showModal = true; }
  toggleUser(u: PlatformUser): void { u.status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'; this.showToast(`${u.name} ${u.status === 'ACTIVE' ? 'activado' : 'desactivado'}`, 'success'); }
  deleteUser(u: PlatformUser): void { this.users = this.users.filter(x => x.id !== u.id); this.showToast(`${u.name} eliminado`, 'error'); }
  saveUser(): void {
    if (this.editing) { const u = this.users.find(x => x.id === this.editingId); if (u) { u.name = this.form.name; u.email = this.form.email; u.role = this.form.role as any; } }
    else { this.users.unshift({ id: Date.now().toString(), name: this.form.name, email: this.form.email, role: this.form.role as any, status: 'ACTIVE', lastLogin: 'Nunca', createdAt: 'Hoy' }); }
    this.closeModal(); this.showToast(this.editing ? 'Cambios guardados' : 'Usuario creado', 'success');
  }
  private showToast(msg: string, type: string): void { this.toast = msg; this.toastType = type; setTimeout(() => this.toast = '', 3000); }
}
