import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BarberInfo } from '../models/barber-info.model';

@Injectable({
  providedIn: 'root'
})
export class BarberInfoService {
  private defaultBarberInfo: BarberInfo = {
    id: '1',
    name: 'BarberShop Pro',
    description: 'Tu barbería de confianza con servicios de calidad premium',
    location: 'Calle Principal 123, Ciudad',
    phone: '+34 600 123 456',
    email: 'info@barbershoppro.com',
    website: 'www.barbershoppro.com',
    logo: undefined,
    openingHours: {
      monday: { start: '09:00', end: '19:00', closed: false },
      tuesday: { start: '09:00', end: '19:00', closed: false },
      wednesday: { start: '09:00', end: '19:00', closed: false },
      thursday: { start: '09:00', end: '19:00', closed: false },
      friday: { start: '09:00', end: '20:00', closed: false },
      saturday: { start: '10:00', end: '18:00', closed: false },
      sunday: { start: '00:00', end: '00:00', closed: true }
    },
    socialMedia: {
      instagram: '@barbershoppro',
      facebook: 'barbershoppro',
      whatsapp: '+34 600 123 456'
    }
  };

  private barberInfoSubject = new BehaviorSubject<BarberInfo>(this.loadBarberInfo());
  public barberInfo$: Observable<BarberInfo> = this.barberInfoSubject.asObservable();

  constructor() {
    this.initializeBarberInfo();
  }

  private initializeBarberInfo(): void {
    const stored = localStorage.getItem('barberInfo');
    if (!stored) {
      localStorage.setItem('barberInfo', JSON.stringify(this.defaultBarberInfo));
      this.barberInfoSubject.next(this.defaultBarberInfo);
    }
  }

  private loadBarberInfo(): BarberInfo {
    const stored = localStorage.getItem('barberInfo');
    return stored ? JSON.parse(stored) : this.defaultBarberInfo;
  }

  updateBarberInfo(updates: Partial<BarberInfo>): void {
    const current = this.barberInfoSubject.value;
    const updated = { ...current, ...updates, updatedAt: new Date() };
    localStorage.setItem('barberInfo', JSON.stringify(updated));
    this.barberInfoSubject.next(updated);
  }

  getBarberInfo(): BarberInfo {
    return this.barberInfoSubject.value;
  }

  updateOpeningHours(day: keyof BarberInfo['openingHours'], start: string, end: string, closed: boolean): void {
    const current = this.barberInfoSubject.value;
    const updated = {
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: { start, end, closed }
      }
    };
    localStorage.setItem('barberInfo', JSON.stringify(updated));
    this.barberInfoSubject.next(updated);
  }

  updateSocialMedia(updates: Partial<BarberInfo['socialMedia']>): void {
    const current = this.barberInfoSubject.value;
    const updated = {
      ...current,
      socialMedia: { ...current.socialMedia, ...updates }
    };
    localStorage.setItem('barberInfo', JSON.stringify(updated));
    this.barberInfoSubject.next(updated);
  }
}
