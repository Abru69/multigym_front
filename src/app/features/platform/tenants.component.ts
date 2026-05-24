import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  members: number;
  createdAt: string;
  email: string;
  initial: string;
  color: string;
}

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2 class="page-title">Gimnasios / Tenants</h2>
          <p class="page-sub">Gestiona todos los gimnasios registrados en la plataforma</p>
        </div>
        <button class="btn-primary" (click)="openModal()">+ Nuevo Gimnasio</button>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-pill" *ngFor="let s of stats">
          <span class="stat-dot" [class]="s.cls"></span>
          <span class="stat-num">{{ s.count }}</span>
          <span class="stat-lbl">{{ s.label }}</span>
        </div>
      </div>

      <!-- Search + filter -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input [(ngModel)]="search" placeholder="Buscar gimnasio..." class="search-input">
        </div>
        <div class="filter-pills">
          <button *ngFor="let f of filters"
            class="filter-pill" [class.active]="activeFilter === f.key"
            (click)="activeFilter = f.key">{{ f.label }}</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Gimnasio</th>
              <th>Subdominio</th>
              <th>Plan</th>
              <th>Miembros</th>
              <th>Estado</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filtered" class="table-row">
              <td>
                <div class="tenant-cell">
                  <div class="t-avatar" [style.background]="t.color">{{ t.initial }}</div>
                  <div>
                    <div class="t-name">{{ t.name }}</div>
                    <div class="t-email">{{ t.email }}</div>
                  </div>
                </div>
              </td>
              <td><span class="subdomain">{{ t.subdomain }}.multigym.com</span></td>
              <td><span class="plan-badge" [class]="'plan-' + t.plan">{{ t.plan }}</span></td>
              <td><span class="members-count">👥 {{ t.members }}</span></td>
              <td><span class="status-badge" [class]="'st-' + t.status">{{ statusLabel(t.status) }}</span></td>
              <td><span class="date-text">{{ t.createdAt }}</span></td>
              <td>
                <div class="actions">
                  <button class="act-btn view"  title="Ver detalle"  (click)="viewTenant(t)">👁</button>
                  <button class="act-btn edit"  title="Editar"       (click)="editTenant(t)">✏️</button>
                  <button class="act-btn"
                    [class.suspend]="t.status === 'ACTIVE'"
                    [class.activate]="t.status === 'SUSPENDED'"
                    [title]="t.status === 'ACTIVE' ? 'Suspender' : 'Activar'"
                    (click)="toggleStatus(t)">
                    {{ t.status === 'ACTIVE' ? '⏸' : '▶' }}
                  </button>
                  <button class="act-btn delete" title="Eliminar" (click)="deleteTenant(t)">🗑</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="7" class="empty-state">Sin resultados para "{{ search }}"</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <span class="page-info">Mostrando {{ filtered.length }} de {{ tenants.length }} registros</span>
        <div class="page-btns">
          <button class="page-btn" disabled>‹ Anterior</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">Siguiente ›</button>
        </div>
      </div>
    </div>

    <!-- Modal crear gimnasio -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? 'Editar Gimnasio' : 'Nuevo Gimnasio' }}</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-field">
              <label>Nombre del Gimnasio</label>
              <input [(ngModel)]="form.name" placeholder="Ej: FitZone Elite">
            </div>
            <div class="form-field">
              <label>Subdominio</label>
              <input [(ngModel)]="form.subdomain" placeholder="fitzone">
            </div>
            <div class="form-field">
              <label>Email de contacto</label>
              <input [(ngModel)]="form.email" type="email" placeholder="admin@fitzone.com">
            </div>
            <div class="form-field">
              <label>Plan</label>
              <select [(ngModel)]="form.plan">
                <option value="STARTER">Starter — $29/mes</option>
                <option value="PRO">Pro — $79/mes</option>
                <option value="ENTERPRISE">Enterprise — $199/mes</option>
              </select>
            </div>
          </div>
          <div class="form-field" style="margin-top:1rem">
            <label>Estado inicial</label>
            <select [(ngModel)]="form.status">
              <option value="TRIAL">Trial (14 días gratis)</option>
              <option value="ACTIVE">Activo</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" (click)="closeModal()">Cancelar</button>
          <button class="btn-primary" (click)="saveTenant()">
            {{ editing ? 'Guardar cambios' : 'Crear Gimnasio' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toast" [class]="'toast-' + toastType">{{ toast }}</div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    .page { display: flex; flex-direction: column; gap: 1.25rem; font-family: 'Inter', sans-serif; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title { color: #fff; font-size: 1.3rem; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .page-sub   { color: rgba(255,255,255,0.4); font-size: 0.82rem; margin: 0.25rem 0 0; }

    .btn-primary {
      background: linear-gradient(135deg, #6c63ff, #48cae4);
      color: #fff; border: none; border-radius: 10px;
      padding: 0.65rem 1.25rem; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; font-family: 'Inter', sans-serif;
      transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.35); }

    .btn-ghost {
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      padding: 0.65rem 1.25rem; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); }

    /* Stats */
    .stats-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .stat-pill {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 100px; padding: 0.4rem 0.9rem;
    }
    .stat-dot { width: 8px; height: 8px; border-radius: 50%; }
    .stat-dot.green   { background: #4ade80; }
    .stat-dot.yellow  { background: #facc15; }
    .stat-dot.red     { background: #f87171; }
    .stat-dot.blue    { background: #60a5fa; }
    .stat-num { color: #fff; font-weight: 700; font-size: 0.9rem; }
    .stat-lbl { color: rgba(255,255,255,0.45); font-size: 0.78rem; }

    /* Toolbar */
    .toolbar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .search-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 0.55rem 1rem; flex: 1; min-width: 220px;
    }
    .search-icon { font-size: 0.85rem; }
    .search-input {
      background: none; border: none; outline: none;
      color: #fff; font-size: 0.87rem; width: 100%; font-family: 'Inter', sans-serif;
    }
    .search-input::placeholder { color: rgba(255,255,255,0.3); }
    .filter-pills { display: flex; gap: 0.4rem; }
    .filter-pill {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5); border-radius: 100px;
      padding: 0.35rem 0.85rem; font-size: 0.78rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .filter-pill:hover, .filter-pill.active {
      background: rgba(108,99,255,0.2); border-color: rgba(108,99,255,0.4);
      color: #fff;
    }

    /* Table */
    .table-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px; overflow: hidden;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4);
      font-size: 0.73rem; font-weight: 600; letter-spacing: 0.5px;
      text-transform: uppercase; padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;
    }
    .data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
    .table-row { transition: background 0.15s; }
    .table-row:hover { background: rgba(255,255,255,0.03); }
    .table-row:last-child td { border-bottom: none; }

    .tenant-cell { display: flex; align-items: center; gap: 0.75rem; }
    .t-avatar {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 0.88rem; flex-shrink: 0;
    }
    .t-name  { color: #fff; font-size: 0.85rem; font-weight: 600; }
    .t-email { color: rgba(255,255,255,0.35); font-size: 0.72rem; }

    .subdomain   { color: rgba(255,255,255,0.45); font-size: 0.78rem; font-family: monospace; }
    .date-text   { color: rgba(255,255,255,0.45); font-size: 0.78rem; }
    .members-count { color: rgba(255,255,255,0.6); font-size: 0.82rem; }

    .plan-badge, .status-badge {
      padding: 0.22rem 0.6rem; border-radius: 20px;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.3px;
    }
    .plan-STARTER    { background: rgba(96,165,250,0.15); color: #60a5fa; }
    .plan-PRO        { background: rgba(108,99,255,0.2);  color: #a78bfa; }
    .plan-ENTERPRISE { background: rgba(250,204,21,0.15); color: #facc15; }

    .st-ACTIVE    { background: rgba(34,197,94,0.15);  color: #4ade80; }
    .st-TRIAL     { background: rgba(250,204,21,0.15); color: #facc15; }
    .st-SUSPENDED { background: rgba(239,68,68,0.15);  color: #f87171; }
    .st-CANCELLED { background: rgba(107,114,128,0.15);color: #9ca3af; }

    .actions { display: flex; gap: 0.35rem; }
    .act-btn {
      width: 30px; height: 30px; border-radius: 7px; border: none;
      cursor: pointer; font-size: 0.78rem; display: flex; align-items: center;
      justify-content: center; transition: all 0.15s; background: rgba(255,255,255,0.05);
    }
    .act-btn.view    { }
    .act-btn.edit    { }
    .act-btn.suspend { background: rgba(250,204,21,0.1); }
    .act-btn.activate{ background: rgba(34,197,94,0.1);  }
    .act-btn.delete  { background: rgba(239,68,68,0.1);  }
    .act-btn:hover   { transform: scale(1.1); filter: brightness(1.3); }

    /* Pagination */
    .pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
    .page-info { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
    .page-btns { display: flex; gap: 0.35rem; }
    .page-btn {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5); border-radius: 8px; padding: 0.35rem 0.75rem;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .page-btn.active { background: rgba(108,99,255,0.25); border-color: rgba(108,99,255,0.5); color: #fff; }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px); display: flex; align-items: center;
      justify-content: center; z-index: 100; padding: 1rem;
    }
    .modal-box {
      background: #181828; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px; width: 100%; max-width: 540px;
      animation: popIn 0.25s ease;
    }
    @keyframes popIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .modal-header h3 { color: #fff; font-size: 1rem; font-weight: 700; margin: 0; }
    .modal-close {
      background: none; border: none; color: rgba(255,255,255,0.4);
      font-size: 1rem; cursor: pointer; transition: color 0.2s; padding: 0.25rem;
    }
    .modal-close:hover { color: #fff; }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.07);
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-field label { color: rgba(255,255,255,0.6); font-size: 0.8rem; font-weight: 500; }
    .form-field input, .form-field select {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 9px; padding: 0.6rem 0.85rem; color: #fff;
      font-size: 0.87rem; outline: none; transition: all 0.2s; font-family: 'Inter', sans-serif;
    }
    .form-field input:focus, .form-field select:focus {
      border-color: #6c63ff; box-shadow: 0 0 0 3px rgba(108,99,255,0.2);
    }
    .form-field input::placeholder { color: rgba(255,255,255,0.25); }
    .form-field select option { background: #181828; }

    /* Empty */
    .empty-state { color: rgba(255,255,255,0.35); text-align: center; padding: 2rem; font-size: 0.88rem; }

    /* Toast */
    .toast {
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      padding: 0.75rem 1.25rem; border-radius: 10px;
      font-size: 0.85rem; font-weight: 600; font-family: 'Inter', sans-serif;
      animation: slideIn 0.3s ease; z-index: 200;
    }
    .toast-success { background: #166534; color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
    .toast-error   { background: #7f1d1d; color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class TenantsComponent implements OnInit {
  search = '';
  activeFilter = 'ALL';
  showModal = false;
  editing = false;
  toast = '';
  toastType = 'success';

  filters = [
    { key: 'ALL', label: 'Todos' },
    { key: 'ACTIVE', label: 'Activos' },
    { key: 'TRIAL', label: 'Trial' },
    { key: 'SUSPENDED', label: 'Suspendidos' },
  ];

  form = { name: '', subdomain: '', email: '', plan: 'STARTER', status: 'TRIAL' };
  editingId = '';

  tenants: Tenant[] = [
    { id: '1', name: 'FitZone Elite',    subdomain: 'fitzone',    plan: 'ENTERPRISE', status: 'ACTIVE',    members: 342, createdAt: '12 Ene 2026', email: 'admin@fitzone.com',    initial: 'F', color: 'linear-gradient(135deg,#6c63ff,#48cae4)' },
    { id: '2', name: 'Iron Temple',      subdomain: 'irontemple', plan: 'PRO',        status: 'ACTIVE',    members: 218, createdAt: '28 Ene 2026', email: 'ops@irontemple.mx',    initial: 'I', color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
    { id: '3', name: 'PowerGym MX',     subdomain: 'powergym',   plan: 'STARTER',    status: 'TRIAL',     members: 47,  createdAt: '14 Feb 2026', email: 'hola@powergym.mx',     initial: 'P', color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { id: '4', name: 'Titan Sports',    subdomain: 'titan',      plan: 'PRO',        status: 'TRIAL',     members: 93,  createdAt: '20 Feb 2026', email: 'info@titansports.com', initial: 'T', color: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
    { id: '5', name: 'Alpha Fitness',   subdomain: 'alpha',      plan: 'STARTER',    status: 'SUSPENDED', members: 12,  createdAt: '05 Mar 2026', email: 'admin@alphafitness.mx',initial: 'A', color: 'linear-gradient(135deg,#fa8231,#f7b731)' },
    { id: '6', name: 'Zeus Gym',        subdomain: 'zeus',       plan: 'PRO',        status: 'ACTIVE',    members: 175, createdAt: '10 Mar 2026', email: 'zeus@zeusgym.com',     initial: 'Z', color: 'linear-gradient(135deg,#f7971e,#ffd200)' },
    { id: '7', name: 'Body Factory',    subdomain: 'bodyfactory',plan: 'ENTERPRISE', status: 'ACTIVE',    members: 512, createdAt: '15 Mar 2026', email: 'hello@bodyfactory.io', initial: 'B', color: 'linear-gradient(135deg,#ee0979,#ff6a00)' },
    { id: '8', name: 'GymPro CDMX',    subdomain: 'gympro',     plan: 'STARTER',    status: 'TRIAL',     members: 28,  createdAt: '01 Abr 2026', email: 'contact@gympro.mx',    initial: 'G', color: 'linear-gradient(135deg,#56ab2f,#a8e063)' },
  ];

  get stats() {
    return [
      { cls: 'green',  count: this.tenants.filter(t => t.status === 'ACTIVE').length,    label: 'Activos' },
      { cls: 'yellow', count: this.tenants.filter(t => t.status === 'TRIAL').length,     label: 'Trial' },
      { cls: 'red',    count: this.tenants.filter(t => t.status === 'SUSPENDED').length, label: 'Suspendidos' },
      { cls: 'blue',   count: this.tenants.length,                                        label: 'Total' },
    ];
  }

  get filtered(): Tenant[] {
    return this.tenants.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(this.search.toLowerCase()) ||
                          t.subdomain.toLowerCase().includes(this.search.toLowerCase());
      const matchFilter = this.activeFilter === 'ALL' || t.status === this.activeFilter;
      return matchSearch && matchFilter;
    });
  }

  ngOnInit(): void {}

  statusLabel(s: string): string {
    return { ACTIVE: 'Activo', TRIAL: 'Trial', SUSPENDED: 'Suspendido', CANCELLED: 'Cancelado' }[s] ?? s;
  }

  openModal(): void { this.form = { name: '', subdomain: '', email: '', plan: 'STARTER', status: 'TRIAL' }; this.editing = false; this.showModal = true; }
  closeModal(): void { this.showModal = false; this.editingId = ''; }

  viewTenant(t: Tenant): void   { this.showToast(`Viendo: ${t.name}`, 'success'); }
  editTenant(t: Tenant): void   {
    this.form = { name: t.name, subdomain: t.subdomain, email: t.email, plan: t.plan, status: t.status };
    this.editingId = t.id; this.editing = true; this.showModal = true;
  }

  toggleStatus(t: Tenant): void {
    t.status = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.showToast(`${t.name} ${t.status === 'ACTIVE' ? 'activado' : 'suspendido'}`, 'success');
  }

  deleteTenant(t: Tenant): void {
    this.tenants = this.tenants.filter(x => x.id !== t.id);
    this.showToast(`${t.name} eliminado`, 'error');
  }

  saveTenant(): void {
    if (this.editing) {
      const t = this.tenants.find(x => x.id === this.editingId);
      if (t) { t.name = this.form.name; t.subdomain = this.form.subdomain; t.email = this.form.email; t.plan = this.form.plan as any; }
    } else {
      this.tenants.unshift({
        id: Date.now().toString(), name: this.form.name, subdomain: this.form.subdomain,
        email: this.form.email, plan: this.form.plan as any, status: this.form.status as any,
        members: 0, createdAt: 'Hoy', initial: this.form.name[0]?.toUpperCase() ?? 'N',
        color: 'linear-gradient(135deg,#6c63ff,#48cae4)'
      });
    }
    this.closeModal();
    this.showToast(this.editing ? 'Cambios guardados' : 'Gimnasio creado exitosamente', 'success');
  }

  private showToast(msg: string, type: string): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = '', 3000);
  }
}
