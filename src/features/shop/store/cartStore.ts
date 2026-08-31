import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'
import { useAuthStore } from '@/features/auth/store/authStore'

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
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            })
          }
          // If already at stock limit, do nothing
        } else if (product.stock > 0) {
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
      name: 'multigym-cart',
      storage: createJSONStorage(() => ({
        getItem: () => {
          const { tenantId, user } = useAuthStore.getState()
          const key = `multigym-cart-${tenantId || 'default'}-${user?.id || 'guest'}`
          return localStorage.getItem(key)
        },
        setItem: (_name, value) => {
          const { tenantId, user } = useAuthStore.getState()
          const key = `multigym-cart-${tenantId || 'default'}-${user?.id || 'guest'}`
          localStorage.setItem(key, value)
        },
        removeItem: () => {
          const { tenantId, user } = useAuthStore.getState()
          const key = `multigym-cart-${tenantId || 'default'}-${user?.id || 'guest'}`
          localStorage.removeItem(key)
        },
      })),
    }
  )
)
