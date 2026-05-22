export interface BarberInfo {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  openingHours: {
    monday: { start: string; end: string; closed: boolean };
    tuesday: { start: string; end: string; closed: boolean };
    wednesday: { start: string; end: string; closed: boolean };
    thursday: { start: string; end: string; closed: boolean };
    friday: { start: string; end: string; closed: boolean };
    saturday: { start: string; end: string; closed: boolean };
    sunday: { start: string; end: string; closed: boolean };
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}
