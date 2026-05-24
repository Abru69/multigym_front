import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LogEntry { id: string; action: string; entity: string; user: string; userType: string; ip: string; time: string; type: 'create'|'update'|'login'|'delete'|'suspend'; }

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Logs de Auditoría</h2>
          <p class="page-sub">Registro completo de todas las acciones realizadas en la plataforma</p>
        </div>
        <button class="btn-ghost">⬇ Exportar CSV</button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <span>🔍</span>
          <input [(ngModel)]="search" placeholder="Buscar acción, usuario, entidad..." class="search-input">
        </div>
        <div class="filter-pills">
          <button *ngFor="let f of typeFilters"
            class="filter-pill" [class.active]="activeType === f.key"
            (click)="activeType = f.key">
            <span>{{ f.icon }}</span> {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Log entries -->
      <div class="log-card">
        <div *ngFor="let log of filtered; let last = last" class="log-entry" [class.last]="last">
          <div class="log-dot-col">
            <div class="log-dot" [class]="'dot-' + log.type"></div>
            <div class="log-line" *ngIf="!last"></div>
          </div>
          <div class="log-content">
            <div class="log-main">
              <span class="log-action">{{ log.action }}</span>
              <span class="log-entity">→ {{ log.entity }}</span>
            </div>
            <div class="log-meta">
              <span class="log-user">👤 {{ log.user }}</span>
              <span class="log-type-badge" [class]="'type-' + log.userType">{{ log.userType }}</span>
              <span class="log-ip">🌐 {{ log.ip }}</span>
              <span class="log-time">🕐 {{ log.time }}</span>
            </div>
          </div>
          <span class="log-type-icon" [class]="'icon-' + log.type">{{ typeIcon(log.type) }}</span>
        </div>

        <div *ngIf="filtered.length === 0" class="empty">
          Sin resultados para la búsqueda actual
        </div>
      </div>

      <div class="log-footer">
        Mostrando {{ filtered.length }} de {{ logs.length }} registros
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing:border-box; }
    .page { display:flex; flex-direction:column; gap:1.25rem; font-family:'Inter',sans-serif; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
    .page-title { color:#fff; font-size:1.3rem; font-weight:700; margin:0; }
    .page-sub   { color:rgba(255,255,255,0.4); font-size:0.82rem; margin:0.25rem 0 0; }
    .btn-ghost { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; }

    .filters-bar { display:flex; gap:1rem; flex-wrap:wrap; align-items:center; }
    .search-box { display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.55rem 1rem; flex:1; min-width:220px; }
    .search-input { background:none; border:none; outline:none; color:#fff; font-size:0.87rem; width:100%; font-family:'Inter',sans-serif; }
    .search-input::placeholder { color:rgba(255,255,255,0.3); }
    .filter-pills { display:flex; gap:0.4rem; flex-wrap:wrap; }
    .filter-pill { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); border-radius:100px; padding:0.35rem 0.85rem; font-size:0.78rem; font-weight:500; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; display:flex; align-items:center; gap:0.3rem; }
    .filter-pill:hover, .filter-pill.active { background:rgba(108,99,255,0.2); border-color:rgba(108,99,255,0.4); color:#fff; }

    .log-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:1.25rem 1.5rem; }

    .log-entry { display:flex; gap:1rem; padding-bottom:1.25rem; }
    .log-entry.last { padding-bottom:0; }

    .log-dot-col { display:flex; flex-direction:column; align-items:center; width:16px; flex-shrink:0; }
    .log-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:3px; }
    .log-line { flex:1; width:2px; background:rgba(255,255,255,0.06); margin-top:4px; }

    .dot-create  { background:#4ade80; box-shadow:0 0 8px rgba(74,222,128,0.4); }
    .dot-update  { background:#60a5fa; box-shadow:0 0 8px rgba(96,165,250,0.4); }
    .dot-login   { background:#6c63ff; box-shadow:0 0 8px rgba(108,99,255,0.4); }
    .dot-delete  { background:#f87171; box-shadow:0 0 8px rgba(248,113,113,0.4); }
    .dot-suspend { background:#facc15; box-shadow:0 0 8px rgba(250,204,21,0.4); }

    .log-content { flex:1; min-width:0; }
    .log-main { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.3rem; }
    .log-action { color:#fff; font-size:0.87rem; font-weight:600; }
    .log-entity { color:rgba(255,255,255,0.4); font-size:0.82rem; }
    .log-meta   { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
    .log-user   { color:rgba(255,255,255,0.5); font-size:0.75rem; }
    .log-ip     { color:rgba(255,255,255,0.35); font-size:0.75rem; font-family:monospace; }
    .log-time   { color:rgba(255,255,255,0.35); font-size:0.75rem; }

    .log-type-badge { padding:0.15rem 0.5rem; border-radius:20px; font-size:0.65rem; font-weight:700; }
    .type-PLATFORM { background:rgba(108,99,255,0.15); color:#a78bfa; }
    .type-TENANT   { background:rgba(72,202,228,0.15); color:#48cae4; }

    .log-type-icon { font-size:1rem; margin-top:1px; flex-shrink:0; }
    .icon-create  { filter:hue-rotate(0deg); }

    .empty { color:rgba(255,255,255,0.35); text-align:center; padding:2rem; font-size:0.88rem; }
    .log-footer { color:rgba(255,255,255,0.3); font-size:0.78rem; text-align:center; }
  `]
})
export class AuditLogsComponent {
  search = ''; activeType = 'ALL';

  typeFilters = [
    { key:'ALL',     icon:'📋', label:'Todos' },
    { key:'create',  icon:'➕', label:'Creación' },
    { key:'update',  icon:'✏️', label:'Actualización' },
    { key:'login',   icon:'🔐', label:'Accesos' },
    { key:'suspend', icon:'⏸', label:'Suspensión' },
    { key:'delete',  icon:'🗑', label:'Eliminación' },
  ];

  logs: LogEntry[] = [
    { id:'1',  action:'Nuevo tenant creado',        entity:'PowerGym MX',    user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Hoy 12:34', type:'create'  },
    { id:'2',  action:'Login de plataforma',         entity:'Super Admin',    user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Hoy 12:30', type:'login'   },
    { id:'3',  action:'Plan actualizado',            entity:'Iron Temple',    user:'Ana Martínez',   userType:'PLATFORM', ip:'201.xx.xx.42', time:'Hoy 11:15', type:'update'  },
    { id:'4',  action:'Tenant suspendido',           entity:'Alpha Fitness',  user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Ayer 18:22', type:'suspend' },
    { id:'5',  action:'Usuario plataforma creado',   entity:'Pedro Gómez',   user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Ayer 16:05', type:'create'  },
    { id:'6',  action:'Configuración actualizada',   entity:'Plataforma',     user:'Luis Ramírez',   userType:'PLATFORM', ip:'200.xx.xx.10', time:'Ayer 14:30', type:'update'  },
    { id:'7',  action:'Nuevo tenant creado',         entity:'Titan Sports',   user:'María Torres',   userType:'PLATFORM', ip:'201.xx.xx.90', time:'Hace 2d',   type:'create'  },
    { id:'8',  action:'Login de plataforma',         entity:'Super Admin',    user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Hace 2d',   type:'login'   },
    { id:'9',  action:'Plan ENTERPRISE asignado',    entity:'Body Factory',   user:'María Torres',   userType:'PLATFORM', ip:'201.xx.xx.90', time:'Hace 3d',   type:'update'  },
    { id:'10', action:'Tenant eliminado',            entity:'OldGym Pro',     user:'Carlos Herrera', userType:'PLATFORM', ip:'187.xxx.xx.1', time:'Hace 5d',   type:'delete'  },
    { id:'11', action:'Nuevo tenant creado',         entity:'Zeus Gym',       user:'Ana Martínez',   userType:'PLATFORM', ip:'201.xx.xx.42', time:'Hace 7d',   type:'create'  },
    { id:'12', action:'Factura generada',            entity:'FitZone #INV042',user:'Sistema',        userType:'PLATFORM', ip:'127.0.0.1',    time:'Hace 7d',   type:'create'  },
  ];

  get filtered(): LogEntry[] {
    return this.logs.filter(l => {
      const s = this.search.toLowerCase();
      const matchSearch = l.action.toLowerCase().includes(s) || l.entity.toLowerCase().includes(s) || l.user.toLowerCase().includes(s);
      const matchType = this.activeType === 'ALL' || l.type === this.activeType;
      return matchSearch && matchType;
    });
  }

  typeIcon(t: string): string {
    return { create:'➕', update:'✏️', login:'🔐', delete:'🗑', suspend:'⏸' }[t] ?? '•';
  }
}
