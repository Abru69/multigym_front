import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { productCategories } from '@/data/products'
import { getProducts, createProduct, fetchApi } from '@/lib/api'
import type { ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Image as ImageIcon,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { FormField } from '../components/FormField'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useDebounce } from '@/hooks/useDebounce'

interface ProductItem {
  id: string
  name: string
  price: number
  stock: number
  isAvailable: boolean
  slug: string
  brand: string
  category: string
  image: string
}

const categoryBadgeClass: Record<string, string> = {
  proteinas: 'bg-blue-500/10 text-blue-400',
  creatinas: 'bg-purple-500/10 text-purple-400',
  preworkout: 'bg-orange-500/10 text-orange-400',
  vitaminas: 'bg-green-500/10 text-green-400',
  accesorios: 'bg-cyan-500/10 text-cyan-400',
}

const categoryLabel: Record<string, string> = {
  proteinas: 'Proteínas',
  creatinas: 'Creatinas',
  preworkout: 'Pre-Workout',
  vitaminas: 'Vitaminas',
  accesorios: 'Accesorios',
}

const filterPills = [
  { value: 'all', label: 'Todos' },
  { value: 'proteinas', label: 'Proteínas' },
  { value: 'creatina', label: 'Creatinas' },
  { value: 'pre-entrenos', label: 'Pre-Workout' },
  { value: 'vitaminas', label: 'Vitaminas' },
  { value: 'accesorios', label: 'Accesorios' },
]

export default function Inventory() {
  const addToast = useToastStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [category, setCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [productsList, setProductsList] = useState<ProductItem[]>([])
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'proteinas',
    brand: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getProducts()
      const apiProducts = response.dto?.data || []
      setProductsList(
        apiProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          isAvailable: p.stock > 0,
          slug: p.name.toLowerCase().replace(/ /g, '-'),
          brand: 'MultiGym',
          category: p.category || 'general',
          image:
            p.imageUrl || p.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop',
        }))
      )
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return productsList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
      const matchCategory = category === 'all' || p.category.toLowerCase() === category.toLowerCase()
      return matchSearch && matchCategory
    })
  }, [productsList, debouncedSearch, category])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name) errors.name = 'El nombre es requerido'
    if (!form.price || Number(form.price) <= 0) errors.price = 'Precio inválido'
    if (!form.stock || Number(form.stock) < 0) errors.stock = 'Stock inválido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => {
    setForm({ name: '', price: '', stock: '', category: 'proteinas', brand: '', description: '' })
    setFormErrors({})
    setEditingProduct(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (product: ProductItem) => {
    setForm({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      brand: product.brand,
      description: '',
    })
    setFormErrors({})
    setEditingProduct(product)
    setImagePreview(product.image)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (editingProduct) {
        await fetchApi<ResponseDTO<unknown>>(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            price: parseFloat(form.price) || 0,
            stock: parseInt(form.stock) || 0,
          }),
        })
        addToast('Producto actualizado correctamente', 'success')
      } else {
        await createProduct({
          name: form.name,
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock) || 0,
        })
        addToast('Producto creado correctamente', 'success')
      }
      loadProducts()
      setShowModal(false)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'bg-red-500'
    if (stock < 10) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Sin stock'
    return `${stock} unidades`
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Inventario"
        subtitle={`${productsList.length} productos en la tienda`}
        icon={Package}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
          >
            <Plus size={16} /> Nuevo Producto
          </button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o marca..."
          className="flex-1"
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setCategory(pill.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                category === pill.value
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-sm'
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 sm:flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition-all ${
              viewMode === 'grid'
                ? 'bg-[var(--accent)]/10 text-[var(--accent-text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            aria-label="Vista cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition-all ${
              viewMode === 'list'
                ? 'bg-[var(--accent)]/10 text-[var(--accent-text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            aria-label="Vista lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando inventario..." />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 py-20">
          <Package size={48} className="mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Inventario vacío</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            No se encontraron productos con esos filtros.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
          >
            <Plus size={16} /> Agregar primer producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(product)}
                    className="rounded-xl bg-[var(--card)] p-2.5 text-[var(--text-primary)] shadow-lg transition-all hover:bg-[var(--accent)] hover:text-[var(--accent-text)]"
                    aria-label={`Editar ${product.name}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="rounded-xl bg-[var(--card)] p-2.5 text-[var(--text-primary)] shadow-lg transition-all hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Eliminar ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      categoryBadgeClass[product.category] ?? 'bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {categoryLabel[product.category] ?? product.category}
                  </span>
                </div>

                <h3 className="truncate font-semibold text-[var(--text-primary)]">{product.name}</h3>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {product.brand}
                </p>

                <p className="mt-3 font-heading text-2xl font-black text-[var(--text-primary)]">
                  {formatCurrency(product.price)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${getStockColor(product.stock)}`} />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {getStockText(product.stock)}
                  </span>
                  {product.stock < 10 && product.stock > 0 && (
                    <AlertCircle size={12} className="text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:shadow-md"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-[var(--text-primary)]">{product.name}</h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      categoryBadgeClass[product.category] ?? 'bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {categoryLabel[product.category] ?? product.category}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {product.brand}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="font-heading text-lg font-black text-[var(--text-primary)]">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className={`h-2 w-2 rounded-full ${getStockColor(product.stock)}`} />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {getStockText(product.stock)}
                </span>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => openEdit(product)}
                  className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  aria-label={`Editar ${product.name}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(product)}
                  className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Eliminar ${product.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <FormField label="Imagen del Producto">
              <div
                className={`group relative flex h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                  dragActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5'
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragActive(false)
                  if (e.dataTransfer.files?.[0]) {
                    const input = fileInputRef.current
                    if (input && e.dataTransfer.files[0]) {
                      const dataTransfer = new DataTransfer()
                      dataTransfer.items.add(e.dataTransfer.files[0])
                      input.files = dataTransfer.files
                      handleFileChange({
                        target: { files: e.dataTransfer.files },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Subir imagen del producto"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-black/50 px-4 py-2 text-xs font-bold text-white">
                        Cambiar imagen
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface)]">
                      <ImageIcon size={28} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Arrastra o haz clic
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">PNG, JPG hasta 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </FormField>
          </div>

          <div className="space-y-4 md:col-span-3">
            <FormField
              label="Nombre del Producto"
              required
              error={formErrors.name}
              htmlFor="prod-name"
            >
              <input
                id="prod-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Gold Standard Whey 5lbs"
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Precio (MXN)"
                required
                error={formErrors.price}
                htmlFor="prod-price"
              >
                <input
                  id="prod-price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <FormField label="Stock" required error={formErrors.stock} htmlFor="prod-stock">
                <input
                  id="prod-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Categoría" htmlFor="prod-category">
                <select
                  id="prod-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                >
                  {productCategories
                    .filter((c) => c.value !== 'all')
                    .map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </FormField>
              <FormField label="Marca" htmlFor="prod-brand">
                <input
                  id="prod-brand"
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Ej: Optimum Nutrition"
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
            </div>

            <FormField label="Descripción" htmlFor="prod-desc">
              <textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Características principales..."
                className="min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
          >
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-text)]/30 border-t-[var(--accent-text)]" />
            )}
            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await fetchApi(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
            setProductsList(productsList.filter((p) => p.id !== deleteTarget.id))
            addToast(`${deleteTarget.name} eliminado`, 'success')
          } catch (err: unknown) {
            addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
          } finally {
            setDeleteTarget(null)
          }
        }}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </div>
  )
}
