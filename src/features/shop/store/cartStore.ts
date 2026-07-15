import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        const { items } = get()
        const existing = items.find((i) => i.product.id === product.id)
        if (existing) {
          if (existing.quantity < product.stock) {
            set({
              items: items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            })
          }
          // If already at stock limit, do nothing
        } else {
          set({ items: [...items, { product, quantity: 1 }] })
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const { items } = get()
        const item = items.find((i) => i.product.id === productId)
        if (!item) return
        const cappedQuantity = Math.min(quantity, item.product.stock)
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity: cappedQuantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: (() => {
        try {
          const data = localStorage.getItem('auth-storage')
          const parsed = data ? JSON.parse(data) : null
          const tenantId = parsed?.state?.tenantId || 'default'
          return `reto4-cart-${tenantId}`
        } catch { return 'reto4-cart' }
      })(),
    }
  )
)
