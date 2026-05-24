import { useState } from "react"
import { motion } from "framer-motion"
import { mockProducts, productCategories } from "@/data/products"
import { formatCurrency } from "@/lib/utils"
import { Search, Plus, Edit2, Trash2, Package } from "lucide-react"

export default function Inventory() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [productsList, setProductsList] = useState(mockProducts)
  
  // Form state
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newStock, setNewStock] = useState("")
  const [newCat, setNewCat] = useState("proteinas")

  const filtered = productsList.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "all" || p.category === category
    return matchSearch && matchCategory
  })

  const handleAddProduct = () => {
    if (!newName || !newPrice || !newStock) {
      alert("Por favor llena todos los campos.")
      return
    }
    
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: newName,
      slug: newName.toLowerCase().replace(/ /g, '-'),
      description: "Nuevo producto añadido.",
      price: parseFloat(newPrice) || 0,
      category: newCat as any,
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop", // placeholder
      stock: parseInt(newStock) || 0,
      isAvailable: true,
      brand: "Reto 4 Gym",
      rating: 5,
      reviewCount: 0,
    }
    
    setProductsList([newProduct, ...productsList])
    setShowModal(false)
    setNewName("")
    setNewPrice("")
    setNewStock("")
    alert("¡Producto añadido exitosamente!")
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el producto "${name}"?`)) {
      setProductsList(productsList.filter(p => p.id !== id))
    }
  }

  const handleEdit = (name: string) => {
    alert(`Modo de edición para: ${name}\n\n(Próximamente: Formulario de edición completo)`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Inventario</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{productsList.length} productos registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          {productCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--background)" }}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{product.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: product.stock < 20 ? "var(--warning)" : "var(--text-secondary)" }}>
                    {product.stock} uds
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: product.isAvailable ? "rgba(0,204,136,0.1)" : "rgba(255,77,77,0.1)",
                        color: product.isAvailable ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {product.isAvailable ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product.name)}
                        className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--danger)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,77,77,0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "var(--text-muted)" }}>
            <Package size={40} className="mb-3 opacity-40" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Nuevo Producto</h3>
            <div className="space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del producto" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Precio (MXN)" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} placeholder="Stock disponible" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              
              <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {productCategories.filter(c => c.value !== "all").map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Cancelar</button>
              <button onClick={handleAddProduct} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "var(--accent-text)" }}>Guardar Producto</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
