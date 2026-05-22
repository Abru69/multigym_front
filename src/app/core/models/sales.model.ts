export interface SalesStatus {
  id: string;
  date: Date;
  totalSales: number;
  appointmentCount: number;
  isOpenToday: boolean;
  notes?: string;
}

export interface DailySalesMetrics {
  date: Date;
  revenue: number;
  appointments: number;
  topProduct?: string;
}
