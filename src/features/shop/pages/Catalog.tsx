import { useState, useEffect } from 'react'
import { productCategories } from '@/data/products'
import { getProducts } from '@/lib/api'
import type { Product } from '@/types'
import { ProductCard } from '@/components/molecules/ProductCard'
import { Search, SlidersHorizontal, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Catalog() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts()
      .then((response) => {
        const apiProducts = response.lista || []
        const mapped: Product[] = apiProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          isAvailable: p.stock > 0,
          slug: p.name.toLowerCase().replace(/ /g, '-'),
          brand: 'MultiGym',
          rating: 5.0,
          reviewCount: 0,
          image:
            'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800',
          category: 'proteinas',
          description: 'Producto premium cargado desde backend.',
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1
            className="mb-2 text-3xl font-black sm:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Suplementación
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Potencia tus resultados con productos premium.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={16}
              className="text-text-muted absolute top-1/2 left-4 -translate-y-1/2"
            />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-11 sm:w-64"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="text-text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-border bg-surface text-text-primary focus:ring-accent w-full cursor-pointer appearance-none rounded-xl border py-3 pr-10 pl-11 text-sm transition-all outline-none focus:ring-2 sm:w-48"
            >
              {productCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl px-4 py-20 text-center"
          style={{ border: '1px dashed var(--border)' }}
        >
          <PackageX
            size={48}
            className="mx-auto mb-4 opacity-40"
            style={{ color: 'var(--text-muted)' }}
          />
          <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            No se encontraron productos
          </h3>
          <p className="mx-auto max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
            No hay productos que coincidan con tu búsqueda. Intenta con otros términos o categorías.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setCategory('all')
            }}
            className="mt-6 px-6"
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
