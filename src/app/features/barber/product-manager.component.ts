import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ImageUploadService } from '../../core/services/image-upload.service';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row">
      <!-- Lista de Productos -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Productos ({{ filteredProducts.length }})</h4>
            <button class="btn btn-light btn-sm" (click)="toggleAddForm()">
              {{ showAddForm ? '✖️ Cancelar' : '➕ Nuevo Producto' }}
            </button>
          </div>
          <div class="card-body">
            <!-- Formulario Nuevo Producto -->
            <form *ngIf="showAddForm" (ngSubmit)="addProduct()" class="mb-4 p-3 bg-light border rounded">
              <h5 class="mb-3">Agregar Nuevo Producto</h5>
              
              <div class="mb-3">
                <label class="form-label">📷 Foto del Producto</label>
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <div *ngIf="newProductImage" class="mb-3">
                      <img [src]="newProductImage" alt="Producto" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                    </div>
                    <div *ngIf="!newProductImage" class="mb-3 py-3 text-muted">
                      <div style="font-size: 2rem;">📸</div>
                    </div>
                    <input 
                      type="file" 
                      class="form-control" 
                      accept="image/*"
                      (change)="onProductImageSelected($event)"
                      #productImageInput
                      style="display: none;">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-primary"
                      (click)="productImageInput.click()">
                      Seleccionar Imagen
                    </button>
                  </div>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre *</label>
                  <input type="text" class="form-control" [(ngModel)]="newProduct.name" name="name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Precio *</label>
                  <input type="number" class="form-control" [(ngModel)]="newProduct.price" name="price" 
                         step="0.01" min="0" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="2" [(ngModel)]="newProduct.description" 
                          name="description" placeholder="..."></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Categoría *</label>
                  <select class="form-select" [(ngModel)]="newProduct.category" name="category" required>
                    <option value="hair_care">Cuidado Capilar</option>
                    <option value="beard_care">Cuidado de Barba</option>
                    <option value="styling">Estilismo</option>
                    <option value="skincare">Cuidado de Piel</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Stock *</label>
                  <input type="number" class="form-control" [(ngModel)]="newProduct.quantity" name="quantity"
                         min="0" required>
                </div>
              </div>
              <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" [(ngModel)]="newProduct.inStock" 
                       name="inStock" id="inStockCheck">
                <label class="form-check-label" for="inStockCheck">En Stock</label>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-success">Agregar Producto</button>
                <button type="button" class="btn btn-secondary" (click)="toggleAddForm()">Cancelar</button>
              </div>
            </form>

            <!-- Lista Productos -->
            <div *ngIf="filteredProducts.length === 0" class="alert alert-info">
              No hay productos. ¡Crea uno nuevo!
            </div>

            <div *ngFor="let product of filteredProducts" class="card mb-3 border">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-2 text-center mb-3 mb-md-0">
                    <div *ngIf="product.image" class="mb-2">
                      <img [src]="product.image" alt="{{ product.name }}" class="img-thumbnail" style="max-width: 100%; max-height: 120px;">
                    </div>
                    <div *ngIf="!product.image" class="bg-light rounded p-3 text-muted" style="height: 120px; display: flex; align-items: center; justify-content: center;">
                      📦
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h5 class="card-title mb-1">{{ product.name }}</h5>
                    <p class="text-muted small mb-2">{{ product.description }}</p>
                    <div class="mb-2">
                      <span class="badge bg-info me-2">{{ getCategoryLabel(product.category) }}</span>
                      <span [class]="product.inStock ? 'badge bg-success' : 'badge bg-danger'">
                        {{ product.inStock ? 'En Stock' : 'Sin Stock' }}
                      </span>
                    </div>
                    <p class="mb-0">
                      <strong>Precio:</strong> {{ product.price }}€ | 
                      <strong>Cantidad:</strong> {{ product.quantity }}
                    </p>
                  </div>
                  <div class="col-md-4 text-end">
                    <div class="btn-group-vertical w-100" role="group">
                      <button class="btn btn-sm btn-info" (click)="editProductImage(product)">
                        📷 Cambiar Foto
                      </button>
                      <button class="btn btn-sm btn-warning" (click)="editProductPrice(product)">
                        💰 Editar Precio
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="deleteProduct(product.id)">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Lateral -->
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Filtros</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Categoría</label>
              <select class="form-select" [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()">
                <option value="">Todos</option>
                <option value="hair_care">Cuidado Capilar</option>
                <option value="beard_care">Cuidado de Barba</option>
                <option value="styling">Estilismo</option>
                <option value="skincare">Cuidado de Piel</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" [(ngModel)]="showOnlyInStock" 
                     (ngModelChange)="filterProducts()" id="inStockOnly">
              <label class="form-check-label" for="inStockOnly">Solo disponibles</label>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Estadísticas</h5>
          </div>
          <div class="card-body">
            <p class="mb-2">
              <strong>Total Productos:</strong> {{ products.length }}
            </p>
            <p class="mb-2">
              <strong>En Stock:</strong> {{ products.filter(p => p.inStock).length }}
            </p>
            <p class="mb-0">
              <strong>Sin Stock:</strong> {{ products.filter(p => !p.inStock).length }}
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
    
    .card-title {
      color: #025E2B;
      font-weight: 600;
    }
    
    .bg-light {
      background-color: #F5F5F5 !important;
    }
    
    .border {
      border: 1px solid #E0E0E0 !important;
    }
    
    h4, h5 {
      color: #025E2B;
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
    
    .btn {
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.875rem;
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
    
    .btn-warning {
      background-color: #F59E0B;
      color: white;
    }
    
    .btn-warning:hover {
      background-color: #D97706;
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
    
    .btn-info {
      background-color: #128C7E;
      color: white;
    }
    
    .btn-info:hover {
      background-color: #0F6F67;
      color: white;
    }
    
    .btn-light {
      background-color: #FFFFFF;
      border: 1px solid #E0E0E0;
      color: #3C3C3C;
    }
    
    .btn-light:hover {
      background-color: #F5F5F5;
      border-color: #D0D0D0;
    }
    
    .btn-secondary {
      background-color: #9CA3AF;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #6B7280;
      color: white;
    }
    
    .btn-group-vertical {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .badge {
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    
    .badge.bg-success {
      background-color: #31A24C !important;
      color: white;
    }
    
    .badge.bg-danger {
      background-color: #EF4444 !important;
      color: white;
    }
    
    .badge.bg-info {
      background-color: #128C7E !important;
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
    
    .text-muted {
      color: #7A7A7A !important;
    }
    
    .text-end {
      text-align: right;
    }
    
    .img-thumbnail {
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 4px;
    }
    
    .rounded {
      border-radius: 6px;
    }
    
    .me-2 {
      margin-right: 0.5rem;
    }
  `]
})
export class ProductManagerComponent implements OnInit, OnChanges {
  @Input() products: Product[] = [];

  filteredProducts: Product[] = [];
  showAddForm = false;
  selectedCategory = '';
  showOnlyInStock = false;
  newProductImage: string | undefined;
  editingProduct: Product | null = null;

  newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    price: 0,
    category: 'other',
    inStock: true,
    quantity: 0,
    image: undefined
  };

  constructor(
    private productService: ProductService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.filteredProducts = [...this.products];
  }

  ngOnChanges(): void {
    this.filterProducts();
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchStock = !this.showOnlyInStock || p.inStock;
      return matchCategory && matchStock;
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  async onProductImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      const result = await this.imageUploadService.uploadImage(file);
      
      if (result.success && result.data) {
        // Comprimir imagen para ahorrar espacio
        const compressed = await this.imageUploadService.compressImage(result.data, 400, 400);
        this.newProductImage = compressed;
        this.newProduct.image = compressed;
      }
    } catch (error) {
      alert('Error al cargar la imagen');
    } finally {
      input.value = '';
    }
  }

  async editProductImage(product: Product): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const file = files[0];
      try {
        const result = await this.imageUploadService.uploadImage(file);
        
        if (result.success && result.data) {
          const compressed = await this.imageUploadService.compressImage(result.data, 400, 400);
          this.productService.updateProduct(product.id, { image: compressed });
          alert('✅ Imagen actualizada correctamente');
        }
      } catch (error) {
        alert('Error al cargar la imagen');
      }
    };
    
    input.click();
  }

  addProduct(): void {
    if (this.newProduct.name && this.newProduct.price > 0) {
      this.productService.addProduct({
        ...this.newProduct,
        image: this.newProductImage
      });
      this.resetForm();
      this.showAddForm = false;
      alert('✅ Producto agregado correctamente');
    } else {
      alert('❌ Por favor completa los campos requeridos');
    }
  }

  editProductPrice(product: Product): void {
    const newPrice = prompt('Nuevo precio:', product.price.toString());
    if (newPrice !== null) {
      this.productService.updateProduct(product.id, { price: parseFloat(newPrice) });
      alert('✅ Producto actualizado');
    }
  }

  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productService.deleteProduct(id);
      alert('✅ Producto eliminado');
    }
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'hair_care': 'Cuidado Capilar',
      'beard_care': 'Cuidado de Barba',
      'styling': 'Estilismo',
      'skincare': 'Cuidado de Piel',
      'other': 'Otro'
    };
    return labels[category] || 'Otros';
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: 'other',
      inStock: true,
      quantity: 0,
      image: undefined
    };
    this.newProductImage = undefined;
  }
}
