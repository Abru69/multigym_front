import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private defaultProducts: Product[] = [
    {
      id: '1',
      name: 'Gel Fijador Premium',
      description: 'Gel fijador de larga duración con acabado natural',
      price: 12.99,
      category: 'styling',
      inStock: true,
      quantity: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Minoxidil 5%',
      description: 'Solución para crecimiento de barba y cabello',
      price: 24.99,
      category: 'beard_care',
      inStock: true,
      quantity: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Cera para Cabello',
      description: 'Cera moldeadora con fijaciónfuerte y brillo',
      price: 14.99,
      category: 'styling',
      inStock: true,
      quantity: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Champú Barba',
      description: 'Champú suavizante para barbas',
      price: 11.99,
      category: 'beard_care',
      inStock: true,
      quantity: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Aceite de Barba',
      description: 'Aceite hidratante con aroma a cedro',
      price: 15.99,
      category: 'beard_care',
      inStock: true,
      quantity: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private productsSubject = new BehaviorSubject<Product[]>(this.loadProducts());
  public products$: Observable<Product[]> = this.productsSubject.asObservable();

  constructor() {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    const stored = localStorage.getItem('products');
    if (!stored) {
      localStorage.setItem('products', JSON.stringify(this.defaultProducts));
      this.productsSubject.next(this.defaultProducts);
    }
  }

  private loadProducts(): Product[] {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : this.defaultProducts;
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): void {
    const current = this.productsSubject.value;
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updated = [...current, newProduct];
    localStorage.setItem('products', JSON.stringify(updated));
    this.productsSubject.next(updated);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const current = this.productsSubject.value;
    const updated = current.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    localStorage.setItem('products', JSON.stringify(updated));
    this.productsSubject.next(updated);
  }

  deleteProduct(id: string): void {
    const current = this.productsSubject.value;
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(updated));
    this.productsSubject.next(updated);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return new Observable(observer => {
      const product = this.productsSubject.value.find(p => p.id === id);
      observer.next(product);
      observer.complete();
    });
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return new Observable(observer => {
      const products = this.productsSubject.value.filter(p => p.category === category);
      observer.next(products);
      observer.complete();
    });
  }

  getProductsByStock(inStock: boolean): Observable<Product[]> {
    return new Observable(observer => {
      const products = this.productsSubject.value.filter(p => p.inStock === inStock);
      observer.next(products);
      observer.complete();
    });
  }
}
