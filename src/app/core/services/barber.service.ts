import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  available: boolean;
  workingHours: {
    start: string;
    end: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private barbers$ = new BehaviorSubject<Barber[]>([
    {
      id: '1',
      name: 'Juan García',
      email: 'juan@barbershop.com',
      phone: '+34 600 123 456',
      specialties: ['Corte clásico', 'Fade', 'Diseño de barba', 'Afeitado clásico'],
      rating: 4.9,
      available: true,
      workingHours: { start: '09:00', end: '19:00' }
    }
  ]);

  public barbers: Observable<Barber[]> = this.barbers$.asObservable();

  constructor() {
    this.loadBarbers();
  }

  /**
   * Obtiene el único barbero disponible
   */
  public getMainBarber(): Observable<Barber | undefined> {
    return new Observable(subscriber => {
      this.barbers$.subscribe(barbers => {
        subscriber.next(barbers[0]);
      });
    });
  }

  private loadBarbers(): void {
    const stored = localStorage.getItem('barbers');
    if (stored) {
      this.barbers$.next(JSON.parse(stored));
    }
  }

  getBarberById(id: string): Observable<Barber | undefined> {
    return new Promise((resolve) => {
      this.barbers.subscribe(barbers => {
        resolve(barbers.find(barber => barber.id === id));
      });
    }) as any;
  }

  addBarber(barber: Omit<Barber, 'id'>): void {
    const newBarber: Barber = {
      ...barber,
      id: Date.now().toString()
    };
    const current = this.barbers$.value;
    this.barbers$.next([...current, newBarber]);
    this.saveBarbers();
  }

  updateBarber(id: string, updates: Partial<Barber>): void {
    const barbers = this.barbers$.value.map(barber =>
      barber.id === id ? { ...barber, ...updates } : barber
    );
    this.barbers$.next(barbers);
    this.saveBarbers();
  }

  private saveBarbers(): void {
    localStorage.setItem('barbers', JSON.stringify(this.barbers$.value));
  }
}
