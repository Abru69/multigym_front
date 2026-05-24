import { useState } from "react"
import { mockProducts, productCategories } from "@/data/products"
import { ProductCard } from "@/components/molecules/ProductCard"
import { Search, SlidersHorizontal, PackageX } from "lucide-react"

export default function Catalog() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "all" || p.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Suplementación</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Potencia tus resultados con productos premium.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full sm:w-64 pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
          <div className="relative">
            <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-48 pl-11 pr-10 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              {productCategories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl" style={{ border: "1px dashed var(--border)" }}>
          <PackageX size={48} className="mx-auto mb-4 opacity-40" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No se encontraron productos</h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            No hay productos que coincidan con tu búsqueda. Intenta con otros términos o categorías.
          </p>
          <button
            onClick={() => { setSearch(""); setCategory("all") }}
            className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  )
}
