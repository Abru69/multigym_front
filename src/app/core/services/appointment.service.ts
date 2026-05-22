import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Appointment {
  id: string;
  barberId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: Date;
  time: string;
  duration: number;
  serviceId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments$ = new BehaviorSubject<Appointment[]>([]);
  public appointments = this.appointments$.asObservable();

  constructor() {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      this.appointments$.next(JSON.parse(stored));
    }
  }

  createAppointment(appointment: Omit<Appointment, 'id'>): void {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString()
    };
    const current = this.appointments$.value;
    this.appointments$.next([...current, newAppointment]);
    this.saveAppointments();
  }

  updateAppointment(id: string, updates: Partial<Appointment>): void {
    const appointments = this.appointments$.value.map(app =>
      app.id === id ? { ...app, ...updates } : app
    );
    this.appointments$.next(appointments);
    this.saveAppointments();
  }

  deleteAppointment(id: string): void {
    const appointments = this.appointments$.value.filter(app => app.id !== id);
    this.appointments$.next(appointments);
    this.saveAppointments();
  }

  getAppointmentById(id: string): Observable<Appointment | undefined> {
    return new Promise((resolve) => {
      this.appointments.subscribe(apps => {
        resolve(apps.find(app => app.id === id));
      });
    }) as any;
  }

  private saveAppointments(): void {
    localStorage.setItem('appointments', JSON.stringify(this.appointments$.value));
  }
}
