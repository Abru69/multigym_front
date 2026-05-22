export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'hair_care' | 'beard_care' | 'styling' | 'skincare' | 'other';
  image?: string;
  inStock: boolean;
  quantity?: number;
  createdAt: Date;
  updatedAt: Date;
}
