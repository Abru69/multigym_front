export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: ProductCategory
  image: string
  images?: string[]
  stock: number
  isAvailable: boolean
  brand: string
  rating: number
  reviewCount: number
  nutritionFacts?: NutritionFact[]
  tags?: string[]
  servingSize?: string
  servings?: number
  flavor?: string
  weight?: string
}

export type ProductCategory =
  'proteinas' | 'pre-entrenos' | 'creatina' | 'aminoacidos' | 'vitaminas' | 'barras' | 'accesorios'

export interface NutritionFact {
  label: string
  value: string
  dailyValue?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado'
  date: string
  shippingAddress?: string
}
