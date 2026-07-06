import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { productCategories } from '@/data/products'
import { getProducts, createProduct, fetchApi } from '@/lib/api'
import type { ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit2, Trash2, Package, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
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
  proteinas: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  creatinas: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  preworkout: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  vitaminas: 'bg-green-500/10 text-green-400 border-green-500/20',
  accesorios: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const categoryLabel: Record<string, string> = {
  proteinas: 'Proteínas',
  creatinas: 'Creatinas',
  preworkout: 'Pre-Workout',
  vitaminas: 'Vitaminas',
  accesorios: 'Accesorios',
}

export default function Inventory() {
  const addToast = useToastStore((s) => s.addToast)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [category, setCategory] = useState('all')
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
          category: 'proteinas',
          image:
            'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=400&h=400&fit=crop',
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
      const matchCategory = category === 'all' || p.category === category
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

  const columns: DataTableColumn<ProductItem>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Producto',
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
              <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                {item.brand}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        label: 'Categoría',
        render: (item) => (
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
              categoryBadgeClass[item.category] ?? 'border-gray-500/20 bg-gray-500/10 text-gray-400'
            }`}
          >
            {categoryLabel[item.category] ?? item.category}
          </span>
        ),
      },
      {
        key: 'price',
        label: 'Precio',
        sortable: true,
        render: (item) => (
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {formatCurrency(item.price)}
          </span>
        ),
      },
      {
        key: 'stock',
        label: 'Stock',
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{
                color: item.stock < 10 ? 'var(--error)' : 'var(--success)',
              }}
            >
              {item.stock} uds
            </span>
            {item.stock < 10 && (
              <AlertCircle size={14} className="text-[var(--error)]" aria-hidden="true" />
            )}
          </div>
        ),
      },
      {
        key: 'isAvailable',
        label: 'Estado',
        render: (item) => (
          <span
            className="inline-flex items-center rounded-full border border-white/[0.08] bg-[var(--card)]/80 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xl"
            style={{
              color: item.isAvailable ? 'var(--success)' : 'var(--error)',
            }}
          >
            {item.isAvailable ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Acciones',
        headerClassName: 'text-right',
        className: 'text-right',
        render: (item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                openEdit(item)
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
              aria-label={`Editar ${item.name}`}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(item)
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
              aria-label={`Eliminar ${item.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Inventario"
        subtitle={`${productsList.length} productos en la tienda`}
        icon={Package}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(66,204,99,0.25)] transition-all hover:shadow-[0_0_32px_rgba(66,204,99,0.4)] active:scale-[0.97]"
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filtrar por categoría"
          className="h-11 appearance-none rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 pr-10 text-sm text-[var(--text-primary)] backdrop-blur-xl focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          {productCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando inventario..." />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          onRowClick={openEdit}
          emptyIcon={Package}
          emptyTitle="Inventario vacío"
          emptyDescription="No se encontraron productos con esos filtros."
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* Image Upload */}
          <div className="md:col-span-2">
            <FormField label="Imagen del Producto">
              <div
                className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                  dragActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--surface)]'
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
                      className="h-full w-full rounded-2xl object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                      <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        Cambiar
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      size={32}
                      className="mx-auto mb-2 text-[var(--accent)] opacity-50"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      Arrastra o haz clic
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">PNG, JPG hasta 5MB</p>
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

          {/* Fields */}
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
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
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
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <FormField label="Stock" required error={formErrors.stock} htmlFor="prod-stock">
                <input
                  id="prod-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Categoría" htmlFor="prod-category">
                <select
                  id="prod-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
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
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
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
                className="min-h-[80px] w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(66,204,99,0.25)] transition-all hover:shadow-[0_0_32px_rgba(66,204,99,0.4)] active:scale-[0.97]"
          >
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
