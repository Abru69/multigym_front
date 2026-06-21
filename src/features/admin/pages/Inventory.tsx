import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { productCategories } from "@/data/products"
import { getProducts, createProduct } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Search, Plus, Edit2, Trash2, Package, UploadCloud, AlertCircle, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/Inventory.css"
export default function Inventory() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [productsList, setProductsList] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadProducts = () => {
    getProducts().then(response => {
      const apiProducts = response.lista || []
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
  }

  useEffect(() => {
    loadProducts()
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

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) return alert("Llena los campos obligatorios")
    
    setIsSaving(true)
    try {
      if (editingProduct) {
        alert("El backend aún no soporta la edición de productos.")
      } else {
        const newProduct = {
          name: form.name,
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock) || 0,
        }
        await createProduct(newProduct)
        loadProducts()
      }
      setShowModal(false)
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (id: string, name: string) => {
    alert(`El backend aún no soporta la eliminación de productos. (id: ${id})`)
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
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventario</h1>
          <p className="admin-page-subtitle">{productsList.length} productos en la tienda</p>
        </div>
        <Button onClick={openCreate} className="gap-2 accent-glow">
          <Plus size={16} /> Nuevo Producto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="inventory-toolbar">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o marca..." className="pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="inventory-select-toolbar">
          {productCategories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Table Card */}
      <div className="inventory-table-container">
        <div className="overflow-x-auto">
          <table className="inventory-table">
            <thead>
              <tr>
                {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="inventory-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((product, i) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inventory-tr">
                    <td className="inventory-td">
                      <div className="flex items-center gap-4">
                        <div className="inventory-img-box">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[200px] text-text-primary">{product.name}</p>
                          <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 text-text-muted">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="inventory-td">
                      <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-[var(--input-bg)] text-text-secondary">{product.category}</span>
                    </td>
                    <td className="inventory-td text-sm font-black text-text-primary">{formatCurrency(product.price)}</td>
                    <td className="inventory-td">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: product.stock < 10 ? "var(--warning)" : "var(--text-secondary)" }}>{product.stock} uds</span>
                        {product.stock < 10 && <AlertCircle size={14} className="text-warning" />}
                      </div>
                    </td>
                    <td className="inventory-td">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider" style={{ background: product.isAvailable ? "var(--accent-muted)" : "var(--error-muted)", color: product.isAvailable ? "var(--success)" : "var(--danger)" }}>
                        {product.isAvailable ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="inventory-td">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="inventory-action-btn edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="inventory-action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="inventory-empty">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="text-base font-bold text-text-primary">Inventario Vacío</p>
            <p className="text-sm mt-1">No se encontraron productos con esos filtros.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
                <button onClick={() => setShowModal(false)} className="admin-close-btn"><X size={20} /></button>
              </div>

              <div className="admin-modal-body">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Image Upload Area */}
                  <div className="md:col-span-2">
                    <label className="admin-form-label text-[10px] font-bold uppercase tracking-wider text-text-muted">Imagen del Producto</label>
                    <div className={`inventory-upload-box ${dragActive ? 'drag-active' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragActive(true) }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFileChange({ target: { files: e.dataTransfer.files } }) }} onClick={() => fileInputRef.current?.click()}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="inventory-upload-overlay">
                            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full">Cambiar Imagen</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon size={32} className="mx-auto mb-3 text-text-muted opacity-50" />
                          <p className="text-xs font-bold text-text-primary">Arrastra una imagen o haz clic</p>
                          <p className="text-[10px] mt-1 text-text-muted">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                  </div>

                  {/* Fields Area */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="admin-form-group">
                      <Label className="admin-form-label">Nombre del Producto *</Label>
                      <Input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Gold Standard Whey 5lbs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="admin-form-group">
                        <Label className="admin-form-label">Precio (MXN) *</Label>
                        <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                      </div>
                      <div className="admin-form-group">
                        <Label className="admin-form-label">Stock *</Label>
                        <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="admin-form-group">
                        <Label className="admin-form-label">Categoría</Label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="inventory-select">
                          {productCategories.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <Label className="admin-form-label">Marca</Label>
                        <Input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Ej: Optimum Nutrition" />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <Label className="admin-form-label">Descripción Corta</Label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="inventory-textarea" placeholder="Características principales del producto..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)] shrink-0 flex gap-3 bg-[var(--surface)]">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 text-sm font-bold border-none bg-[var(--background)] text-text-secondary">Cancelar</Button>
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 accent-glow">
                  {isSaving ? "Guardando..." : (editingProduct ? "Guardar Cambios" : "Crear Producto")}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
