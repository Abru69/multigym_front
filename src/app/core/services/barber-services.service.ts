import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BarberService {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutos
  price: number;
  category: 'corte' | 'afeitado' | 'tanto' | 'otro';
}

@Injectable({
  providedIn: 'root'
})
export class BarberServicesService {
  private services$ = new BehaviorSubject<BarberService[]>([
    {
      id: '1',
      name: 'Corte Clásico',
      description: 'Corte en línea con máquina y tijera',
      duration: 30,
      price: 20,
      category: 'corte'
    },
    {
      id: '2',
      name: 'Fade',
      description: 'Corte degradado moderno',
      duration: 45,
      price: 25,
      category: 'corte'
    },
    {
      id: '3',
      name: 'Diseño de Barba',
      description: 'Perfilado y diseño de barba profesional',
      duration: 20,
      price: 15,
      category: 'afeitado'
    },
    {
      id: '4',
      name: 'Corte + Barba',
      description: 'Corte + Diseño de barba',
      duration: 60,
      price: 35,
      category: 'tanto'
    }
  ]);

  public services: Observable<BarberService[]> = this.services$.asObservable();

  constructor() {
    this.loadServices();
  }

  private loadServices(): void {
    const stored = localStorage.getItem('barber-services');
    if (stored) {
      this.services$.next(JSON.parse(stored));
    }
  }

  getServiceById(id: string): Observable<BarberService | undefined> {
    return new Promise((resolve) => {
      this.services.subscribe(services => {
        resolve(services.find(service => service.id === id));
      });
    }) as any;
  }

  getServicesByCategory(category: string): Observable<BarberService[]> {
    return new Promise((resolve) => {
      this.services.subscribe(services => {
        resolve(services.filter(service => service.category === category));
      });
    }) as any;
  }

  addService(service: Omit<BarberService, 'id'>): void {
    const newService: BarberService = {
      ...service,
      id: Date.now().toString()
    };
    const current = this.services$.value;
    this.services$.next([...current, newService]);
    this.saveServices();
  }

  updateService(id: string, updates: Partial<BarberService>): void {
    const services = this.services$.value.map(service =>
      service.id === id ? { ...service, ...updates } : service
    );
    this.services$.next(services);
    this.saveServices();
  }

  deleteService(id: string): void {
    const services = this.services$.value.filter(service => service.id !== id);
    this.services$.next(services);
    this.saveServices();
  }

  private saveServices(): void {
    localStorage.setItem('barber-services', JSON.stringify(this.services$.value));
  }
}
