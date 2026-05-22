import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SalesStatus, DailySalesMetrics } from '../models/sales.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private salesStatusSubject = new BehaviorSubject<SalesStatus>(this.loadTodaysSales());
  public salesStatus$: Observable<SalesStatus> = this.salesStatusSubject.asObservable();

  private salesHistorySubject = new BehaviorSubject<DailySalesMetrics[]>(this.loadSalesHistory());
  public salesHistory$: Observable<DailySalesMetrics[]> = this.salesHistorySubject.asObservable();

  constructor() {
    this.initializeTodaysSales();
  }

  private initializeTodaysSales(): void {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('salesStatus');
    if (!stored || JSON.parse(stored).date.split('T')[0] !== today) {
      const newSalesStatus: SalesStatus = {
        id: Date.now().toString(),
        date: new Date(),
        totalSales: 0,
        appointmentCount: 0,
        isOpenToday: true,
        notes: ''
      };
      localStorage.setItem('salesStatus', JSON.stringify(newSalesStatus));
      this.salesStatusSubject.next(newSalesStatus);
    }
  }

  private loadTodaysSales(): SalesStatus {
    const stored = localStorage.getItem('salesStatus');
    if (!stored) {
      return {
        id: Date.now().toString(),
        date: new Date(),
        totalSales: 0,
        appointmentCount: 0,
        isOpenToday: true,
        notes: ''
      };
    }
    return JSON.parse(stored);
  }

  private loadSalesHistory(): DailySalesMetrics[] {
    const stored = localStorage.getItem('salesHistory');
    return stored ? JSON.parse(stored) : [];
  }

  updateTodaysSales(totalSales: number, appointmentCount: number, isOpenToday: boolean, notes?: string): void {
    const current = this.salesStatusSubject.value;
    const updated: SalesStatus = {
      ...current,
      totalSales,
      appointmentCount,
      isOpenToday,
      notes: notes || current.notes
    };
    localStorage.setItem('salesStatus', JSON.stringify(updated));
    this.salesStatusSubject.next(updated);
  }

  addDailySalesMetric(metric: DailySalesMetrics): void {
    const current = this.salesHistorySubject.value;
    const updated = [...current, metric];
    localStorage.setItem('salesHistory', JSON.stringify(updated));
    this.salesHistorySubject.next(updated);
  }

  getTodaysSales(): SalesStatus {
    return this.salesStatusSubject.value;
  }

  getSalesHistory(): DailySalesMetrics[] {
    return this.salesHistorySubject.value;
  }

  toggleStoreOpen(isOpen: boolean): void {
    const current = this.salesStatusSubject.value;
    const updated = { ...current, isOpenToday: isOpen };
    localStorage.setItem('salesStatus', JSON.stringify(updated));
    this.salesStatusSubject.next(updated);
  }
}
