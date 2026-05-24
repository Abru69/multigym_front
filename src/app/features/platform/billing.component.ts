import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Invoice { id: string; tenant: string; plan: string; amount: string; status: 'PAID' | 'PENDING' | 'FAILED'; date: string; }

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Facturación & Planes</h2>
          <p class="page-sub">Control de ingresos, suscripciones y facturación de la plataforma</p>
        </div>
        <button class="btn-primary">Exportar reporte</button>
      </div>

      <!-- Revenue cards -->
      <div class="rev-grid">
        <div *ngFor="let r of revenueCards" class="rev-card" [style.--c]="r.color">
          <div class="rev-icon">{{ r.icon }}</div>
          <div class="rev-body">
            <div class="rev-value">{{ r.value }}</div>
            <div class="rev-label">{{ r.label }}</div>
          </div>
          <div class="rev-trend" [class.up]="r.up">{{ r.trend }}</div>
        </div>
      </div>

      <!-- Plans -->
      <div class="section-title">Planes disponibles</div>
      <div class="plans-grid">
        <div *ngFor="let p of plans" class="plan-card" [class.featured]="p.featured">
          <div class="plan-badge-top" *ngIf="p.featured">Más popular</div>
          <div class="plan-name">{{ p.name }}</div>
          <div class="plan-price">{{ p.price }}<span>/mes</span></div>
          <div class="plan-tenants">{{ p.tenants }} gimnasios activos</div>
          <ul class="plan-features">
            <li *ngFor="let f of p.features">✓ {{ f }}</li>
          </ul>
        </div>
      </div>

      <!-- Invoices -->
      <div class="section-title">Facturas recientes</div>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Gimnasio</th><th>Plan</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of invoices" class="table-row">
              <td><span class="inv-id">{{ inv.id }}</span></td>
              <td><span class="inv-tenant">{{ inv.tenant }}</span></td>
              <td><span class="plan-sm" [class]="'plan-' + inv.plan">{{ inv.plan }}</span></td>
              <td><span class="amount">{{ inv.amount }}</span></td>
              <td><span class="inv-status" [class]="'inv-' + inv.status">{{ statusLabel(inv.status) }}</span></td>
              <td><span class="muted">{{ inv.date }}</span></td>
            </tr>
          </tbody>
        </table>
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
    .section-title { color:rgba(255,255,255,0.6); font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .btn-primary { background:linear-gradient(135deg,#6c63ff,#48cae4); color:#fff; border:none; border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
    .btn-primary:hover { transform:translateY(-1px); }

    /* Revenue */
    .rev-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
    .rev-card {
      background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
      border-top: 2px solid var(--c);
      border-radius:14px; padding:1.25rem 1.5rem;
      display:flex; align-items:center; gap:1rem;
    }
    .rev-icon  { font-size:1.75rem; }
    .rev-body  { flex:1; }
    .rev-value { color:#fff; font-size:1.6rem; font-weight:700; line-height:1; }
    .rev-label { color:rgba(255,255,255,0.4); font-size:0.75rem; margin-top:0.3rem; }
    .rev-trend { font-size:0.72rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:20px; }
    .rev-trend.up   { background:rgba(34,197,94,0.15); color:#4ade80; }
    .rev-trend:not(.up) { background:rgba(239,68,68,0.15); color:#f87171; }

    /* Plans */
    .plans-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
    .plan-card {
      background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
      border-radius:16px; padding:1.5rem; position:relative;
      transition:transform 0.2s, border-color 0.2s;
    }
    .plan-card:hover { transform:translateY(-3px); border-color:rgba(108,99,255,0.3); }
    .plan-card.featured { border-color:rgba(108,99,255,0.5); background:rgba(108,99,255,0.08); }
    .plan-badge-top { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#6c63ff,#48cae4); color:#fff; font-size:0.68rem; font-weight:700; padding:0.25rem 0.85rem; border-radius:20px; white-space:nowrap; }
    .plan-name  { color:rgba(255,255,255,0.7); font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .plan-price { color:#fff; font-size:2rem; font-weight:700; margin:0.5rem 0 0.25rem; }
    .plan-price span { color:rgba(255,255,255,0.4); font-size:0.85rem; font-weight:400; }
    .plan-tenants { color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:1rem; }
    .plan-features { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.4rem; }
    .plan-features li { color:rgba(255,255,255,0.6); font-size:0.8rem; }

    /* Table */
    .table-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; overflow:hidden; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th { background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.4); font-size:0.73rem; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.06); text-align:left; }
    .data-table td { padding:0.85rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
    .table-row:hover { background:rgba(255,255,255,0.03); }
    .table-row:last-child td { border-bottom:none; }
    .inv-id { color:rgba(255,255,255,0.35); font-size:0.75rem; font-family:monospace; }
    .inv-tenant { color:#fff; font-size:0.85rem; font-weight:500; }
    .amount { color:#4ade80; font-size:0.88rem; font-weight:700; }
    .muted  { color:rgba(255,255,255,0.4); font-size:0.78rem; }
    .plan-sm { padding:0.2rem 0.55rem; border-radius:20px; font-size:0.7rem; font-weight:700; }
    .plan-STARTER    { background:rgba(96,165,250,0.15); color:#60a5fa; }
    .plan-PRO        { background:rgba(108,99,255,0.2);  color:#a78bfa; }
    .plan-ENTERPRISE { background:rgba(250,204,21,0.15); color:#facc15; }
    .inv-status { padding:0.22rem 0.6rem; border-radius:20px; font-size:0.7rem; font-weight:700; }
    .inv-PAID    { background:rgba(34,197,94,0.15);  color:#4ade80; }
    .inv-PENDING { background:rgba(250,204,21,0.15); color:#facc15; }
    .inv-FAILED  { background:rgba(239,68,68,0.15);  color:#f87171; }
  `]
})
export class BillingComponent {
  revenueCards = [
    { icon: '💰', label: 'Ingresos del mes',    value: '$4,820', trend: '+18%', up: true,  color: '#4ade80' },
    { icon: '📅', label: 'MRR (Ingresos recur.)', value: '$6,240', trend: '+9%',  up: true,  color: '#6c63ff' },
    { icon: '📊', label: 'ARR proyectado',       value: '$74.8k', trend: '+12%', up: true,  color: '#48cae4' },
    { icon: '⚠️', label: 'Pagos fallidos',       value: '2',      trend: '-1',   up: false, color: '#f87171' },
  ];

  plans = [
    { name: 'Starter', price: '$29', tenants: 4, featured: false, features: ['Hasta 100 miembros','1 sede','Soporte email','Reportes básicos'] },
    { name: 'Pro',     price: '$79', tenants: 5, featured: true,  features: ['Hasta 500 miembros','3 sedes','Soporte prioritario','Reportes avanzados','App móvil'] },
    { name: 'Enterprise', price: '$199', tenants: 3, featured: false, features: ['Miembros ilimitados','Sedes ilimitadas','Soporte 24/7','API acceso','SLA 99.9%','Personalización'] },
  ];

  invoices: Invoice[] = [
    { id: '#INV-2026-042', tenant: 'FitZone Elite',   plan: 'ENTERPRISE', amount: '$199.00', status: 'PAID',    date: '01 May 2026' },
    { id: '#INV-2026-041', tenant: 'Body Factory',    plan: 'ENTERPRISE', amount: '$199.00', status: 'PAID',    date: '01 May 2026' },
    { id: '#INV-2026-040', tenant: 'Iron Temple',     plan: 'PRO',        amount: '$79.00',  status: 'PAID',    date: '01 May 2026' },
    { id: '#INV-2026-039', tenant: 'Zeus Gym',        plan: 'PRO',        amount: '$79.00',  status: 'PENDING', date: '01 May 2026' },
    { id: '#INV-2026-038', tenant: 'Alpha Fitness',   plan: 'STARTER',    amount: '$29.00',  status: 'FAILED',  date: '01 May 2026' },
    { id: '#INV-2026-037', tenant: 'PowerGym MX',    plan: 'STARTER',    amount: '$0.00',   status: 'PENDING', date: '15 Abr 2026' },
  ];

  statusLabel(s: string): string {
    return { PAID: 'Pagado', PENDING: 'Pendiente', FAILED: 'Fallido' }[s] ?? s;
  }
}
