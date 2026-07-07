import { useState, useEffect } from 'react'
import { productCategories } from '@/data/products'
import { getProducts } from '@/lib/api'
import type { Product } from '@/types'
import { ProductCard } from '@/components/molecules/ProductCard'
import { Search, PackageX, X } from 'lucide-react'

export default function Catalog() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
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
          image: p.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop',
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
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:py-12 lg:py-16">
      <div className="space-y-2">
        <h1
          className="font-heading text-4xl font-black uppercase text-[var(--text-primary)] sm:text-5xl"
        >
          Suplementación
        </h1>
        <p className="text-base text-[var(--text-secondary)] sm:text-lg">
          Potencia tus resultados con productos premium de las mejores marcas.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative max-w-xl">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar suplementos, marcas..."
            className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-14 pr-5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {productCategories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                category === c.value
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm'
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-6 py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-hover)]">
            <PackageX size={36} className="text-gray-300" />
          </div>
          <h3 className="mb-2 font-heading text-xl font-bold text-[var(--text-primary)]">
            No se encontraron productos
          </h3>
          <p className="mb-8 max-w-sm text-sm text-[var(--text-secondary)]">
            No hay productos que coincidan con tu búsqueda. Intenta con otros términos o categorías.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setCategory('all')
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
          >
            <X size={16} />
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  )
}
