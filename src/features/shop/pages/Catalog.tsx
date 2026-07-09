import { useState, useEffect } from 'react'
import { productCategories } from '@/data/products'
import { getProducts } from '@/lib/api'
import type { Product } from '@/types'
import { ProductCard } from '@/components/molecules/ProductCard'
import { Search, PackageX, X, SlidersHorizontal } from 'lucide-react'

export default function Catalog() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProducts()
      .then((response) => {
        const apiProducts = response.dto?.data || []
        const mapped: Product[] = apiProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          slug: p.name.toLowerCase().replace(/ /g, '-'),
          brand: p.brand || 'MultiGym',
          category: (p.category || 'proteinas') as Product['category'],
          image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop',
          rating: p.rating || 5.0,
          reviewCount: p.reviewCount || 0,
          isAvailable: p.stock > 0,
          description: p.description || 'Producto premium de alta calidad.',
          flavor: p.flavor || '',
          weight: p.weight || '',
          tags: p.tags || [],
        }))
        setProducts(mapped)
      })
      .catch((e) => console.error('Error fetching products', e))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Tienda
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)] sm:text-base">
            Potencia tus resultados con productos premium.
          </p>
        </div>
        <span className="hidden text-xs font-bold text-[var(--text-muted)] sm:block">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {productCategories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                category === c.value
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface-hover)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      )}

      {/* Products Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface)]">
            <PackageX size={28} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="mb-1.5 text-base font-black text-[var(--text-primary)]">
            Sin resultados
          </h3>
          <p className="mb-6 max-w-xs text-sm text-[var(--text-muted)]">
            No hay productos que coincidan con tu búsqueda.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setCategory('all')
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97]"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
