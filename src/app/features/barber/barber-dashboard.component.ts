import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberInfoService } from '../../core/services/barber-info.service';
import { ProductService } from '../../core/services/product.service';
import { SalesService } from '../../core/services/sales.service';
import { BarberInfo } from '../../core/models/barber-info.model';
import { Product } from '../../core/models/product.model';
import { SalesStatus } from '../../core/models/sales.model';
import { BarberInfoEditorComponent } from './barber-info-editor.component';
import { ProductManagerComponent } from './product-manager.component';
import { ServiceManagerComponent } from './service-manager.component';
import { SalesStatusComponent } from './sales-status.component';

@Component({
  selector: 'app-barber-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    BarberInfoEditorComponent,
    ProductManagerComponent,
    ServiceManagerComponent,
    SalesStatusComponent
  ],
  template: `
    <div class="container-lg py-5">
      <div class="row mb-5">
        <div class="col-12">
          <h1 class="h2 mb-2">Panel del Barbero</h1>
          <p class="text-muted">Gestiona tu barbería, productos y servicios</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" [class.active]="activeTab === 'info'" 
                  (click)="activeTab = 'info'" type="button" role="tab">
            ℹ️ Información
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" [class.active]="activeTab === 'productos'" 
                  (click)="activeTab = 'productos'" type="button" role="tab">
            📦 Productos
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" [class.active]="activeTab === 'servicios'" 
                  (click)="activeTab = 'servicios'" type="button" role="tab">
            ✂️ Servicios
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" [class.active]="activeTab === 'ventas'" 
                  (click)="activeTab = 'ventas'" type="button" role="tab">
            💰 Ventas
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Info Tab -->
        <div [class.active]="activeTab === 'info'" class="tab-pane">
          <app-barber-info-editor [barberInfo]="barberInfo"></app-barber-info-editor>
        </div>

        <!-- Productos Tab -->
        <div [class.active]="activeTab === 'productos'" class="tab-pane">
          <app-product-manager [products]="products"></app-product-manager>
        </div>

        <!-- Servicios Tab -->
        <div [class.active]="activeTab === 'servicios'" class="tab-pane">
          <app-service-manager></app-service-manager>
        </div>

        <!-- Ventas Tab -->
        <div [class.active]="activeTab === 'ventas'" class="tab-pane">
          <app-sales-status [salesStatus]="salesStatus"></app-sales-status>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-lg {
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1, h2 {
      color: #025E2B;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .nav-tabs {
      border-bottom: 1px solid #E0E0E0;
      gap: 0;
    }
    
    .nav-link {
      color: #7A7A7A;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-weight: 500;
      padding: 12px 16px;
      transition: all 0.3s ease;
    }
    
    .nav-link:hover {
      color: #3C3C3C;
      border-bottom-color: #D0D0D0;
    }
    
    .nav-link.active {
      color: #25D366;
      border-bottom-color: #25D366;
      background-color: transparent;
    }
    
    .tab-content .tab-pane {
      display: none;
    }
    
    .tab-content .tab-pane.active {
      display: block;
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class BarberDashboardComponent implements OnInit {
  activeTab: 'info' | 'productos' | 'servicios' | 'ventas' = 'info';
  barberInfo: BarberInfo | null = null;
  products: Product[] = [];
  salesStatus: SalesStatus | null = null;

  constructor(
    private barberInfoService: BarberInfoService,
    private productService: ProductService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.barberInfoService.barberInfo$.subscribe(info => {
      this.barberInfo = info;
    });

    this.productService.products$.subscribe(products => {
      this.products = products;
    });

    this.salesService.salesStatus$.subscribe(status => {
      this.salesStatus = status;
    });
  }
}
