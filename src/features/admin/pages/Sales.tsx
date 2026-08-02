import { useState } from 'react'
import { Store, Truck } from 'lucide-react'
import Pickups from './Pickups'
import Shipments from './Shipments'

type SalesTab = 'pickups' | 'shipments'

export default function Sales() {
  const [activeTab, setActiveTab] = useState<SalesTab>('pickups')

  return (
    <div className="space-y-4">
      <div className="mx-auto flex max-w-4xl rounded-xl bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => setActiveTab('pickups')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'pickups'
              ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Store size={16} />
          En sucursal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shipments')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'shipments'
              ? 'bg-[var(--card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Truck size={16} />
          Envíos
        </button>
      </div>

      {activeTab === 'pickups' ? <Pickups /> : <Shipments />}
    </div>
  )
}
