import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { productCategories } from "@/data/products"
import { getProducts } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Search, Plus, Edit2, Trash2, Package, UploadCloud, AlertCircle, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
export default function Inventory() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [productsList, setProductsList] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    getProducts().then(apiProducts => {
      setProductsList(apiProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        isAvailable: p.stock > 0,
        slug: p.name.toLowerCase().replace(/ /g, '-'),
        brand: 'MultiGym',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop'
      })))
    }).catch(e => console.error(e))
  }, [])
  
  // Form state
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "proteinas", brand: "", description: "" })
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = productsList.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "all" || p.category === category
    return matchSearch && matchCategory
  })

  const openCreate = () => {
    setForm({ name: "", price: "", stock: "", category: "proteinas", brand: "", description: "" })
    setEditingProduct(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (product: any) => {
    setForm({ name: product.name, price: product.price.toString(), stock: product.stock.toString(), category: product.category, brand: product.brand, description: product.description })
    setEditingProduct(product)
    setImagePreview(product.image)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.price || !form.stock) return alert("Llena los campos obligatorios")
    
    if (editingProduct) {
      setProductsList(productsList.map(p => p.id === editingProduct.id ? { ...p, ...form, category: form.category as any, price: parseFloat(form.price), stock: parseInt(form.stock), image: imagePreview || p.image } : p))
    } else {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: form.name,
        slug: form.name.toLowerCase().replace(/ /g, '-'),
        description: form.description || "Nuevo producto.",
        price: parseFloat(form.price) || 0,
        category: form.category as any,
        image: imagePreview || "https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop",
        stock: parseInt(form.stock) || 0,
        isAvailable: true,
        brand: form.brand || "Reto 4 Gym",
        rating: 5,
        reviewCount: 0,
      }
      setProductsList([newProduct, ...productsList])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar definitivamente "${name}"?`)) {
      setProductsList(productsList.filter(p => p.id !== id))
    }
  }

  // Image upload simulation
  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Inventario</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{productsList.length} productos en la tienda</p>
        </div>
        <Button onClick={openCreate} className="gap-2 accent-glow">
          <Plus size={16} /> Nuevo Producto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o marca..." className="pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-11 min-w-[200px] rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-colors appearance-none cursor-pointer">
          {productCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--background)" }}>
                {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group transition-colors" style={{ borderBottom: "1px solid var(--border)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{product.name}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black" style={{ color: "var(--text-primary)" }}>{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: product.stock < 10 ? "var(--warning)" : "var(--text-secondary)" }}>{product.stock} uds</span>
                        {product.stock < 10 && <AlertCircle size={14} style={{ color: "var(--warning)" }} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider" style={{ background: product.isAvailable ? "var(--accent-muted)" : "var(--error-muted)", color: product.isAvailable ? "var(--success)" : "var(--danger)" }}>
                        {product.isAvailable ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-primary)" }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: "var(--danger)" }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
            <Package size={48} className="mb-4 opacity-20" />
            <p className="text-base font-bold text-[var(--text-primary)]">Inventario Vacío</p>
            <p className="text-sm mt-1">No se encontraron productos con esos filtros.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }} onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl flex flex-col rounded-3xl overflow-hidden shadow-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
              
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-muted)" }}><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Image Upload Area */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Imagen del Producto</label>
                    <div className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all cursor-pointer" style={{ border: `2px dashed ${dragActive ? "var(--accent)" : "var(--border)"}`, background: dragActive ? "var(--accent-muted)" : "var(--bg-primary)" }} onDragOver={(e) => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileChange({ target: { files: e.dataTransfer.files } }) }} onClick={() => fileInputRef.current?.click()}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full">Cambiar Imagen</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Arrastra una imagen o haz clic</p>
                          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                  </div>

                  {/* Fields Area */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Nombre del Producto *</Label>
                      <Input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Gold Standard Whey 5lbs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Precio (MXN) *</Label>
                        <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Stock *</Label>
                        <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Categoría</Label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-colors appearance-none cursor-pointer">
                          {productCategories.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Marca</Label>
                        <Input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Ej: Optimum Nutrition" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Descripción Corta</Label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary resize-none" placeholder="Características principales del producto..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)] shrink-0 flex gap-3 bg-[var(--surface)]">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 text-sm font-bold border-none bg-background text-text-secondary">Cancelar</Button>
                <Button onClick={handleSave} className="flex-1 accent-glow">
                  {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
