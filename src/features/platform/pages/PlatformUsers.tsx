import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X, Shield, Headphones, Code, TrendingUp, MoreVertical } from "lucide-react"

type Role = "SUPER_ADMIN"|"SUPPORT"|"DEVOPS"|"SALES"
type Status = "ACTIVE"|"INACTIVE"

interface PUser { id:string; name:string; email:string; role:Role; status:Status; lastLogin:string; createdAt:string }

const roleConfig: Record<Role, { icon: React.ElementType; color: string; label: string }> = {
  SUPER_ADMIN: { icon: Shield,      color:"var(--warning)",  label:"Super Admin" },
  SUPPORT:     { icon: Headphones,  color:"var(--info)",         label:"Soporte" },
  DEVOPS:      { icon: Code,        color:"var(--success)",  label:"DevOps" },
  SALES:       { icon: TrendingUp,  color:"var(--warning)",         label:"Ventas" },
}

const initialUsers: PUser[] = [
  { id:"1", name:"Carlos Herrera",  email:"carlos@saas.com",  role:"SUPER_ADMIN", status:"ACTIVE",   lastLogin:"Hoy 12:36",      createdAt:"01 Ene 2026" },
  { id:"2", name:"Ana Martínez",    email:"ana@saas.com",     role:"SUPPORT",     status:"ACTIVE",   lastLogin:"Hoy 09:14",      createdAt:"15 Ene 2026" },
  { id:"3", name:"Luis Ramírez",    email:"luis@saas.com",    role:"DEVOPS",      status:"ACTIVE",   lastLogin:"Ayer 22:05",     createdAt:"20 Ene 2026" },
  { id:"4", name:"María Torres",    email:"maria@saas.com",   role:"SALES",       status:"ACTIVE",   lastLogin:"Hace 2 días",    createdAt:"01 Feb 2026" },
  { id:"5", name:"Pedro Gómez",     email:"pedro@saas.com",   role:"SUPPORT",     status:"INACTIVE", lastLogin:"Hace 2 semanas", createdAt:"10 Feb 2026" },
]

export default function PlatformUsers() {
  const [users, setUsers] = useState<PUser[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PUser|null>(null)
  const [openMenu, setOpenMenu] = useState<string|null>(null)
  const [toast, setToast] = useState("")
  const [form, setForm] = useState({ name:"", email:"", role:"SUPPORT" as Role })

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000) }

  const openCreate = () => { setForm({name:"",email:"",role:"SUPPORT"}); setEditing(null); setShowModal(true) }
  const openEdit = (u:PUser) => { setForm({name:u.name,email:u.email,role:u.role}); setEditing(u); setShowModal(true); setOpenMenu(null) }

  const toggleStatus = (u:PUser) => {
    setUsers(us => us.map(x => x.id===u.id ? {...x,status:x.status==="ACTIVE"?"INACTIVE":"ACTIVE"} : x))
    showToast(`${u.name} ${u.status==="ACTIVE"?"desactivado":"activado"}`); setOpenMenu(null)
  }

  const deleteUser = (u:PUser) => { setUsers(us=>us.filter(x=>x.id!==u.id)); showToast(`${u.name} eliminado`); setOpenMenu(null) }

  const save = () => {
    if (editing) {
      setUsers(us => us.map(x => x.id===editing.id ? {...x,...form} : x)); showToast("Cambios guardados")
    } else {
      setUsers(us => [{id:Date.now().toString(),...form,status:"ACTIVE",lastLogin:"Nunca",createdAt:"Hoy"},...us])
      showToast("Usuario creado")
    }
    setShowModal(false)
  }

  const roleCounts = (Object.keys(roleConfig) as Role[]).map(r => ({ role:r, count:users.filter(u=>u.role===r).length, ...roleConfig[r] }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{color:"var(--text-primary)",fontFamily:"var(--font-heading)"}}>Usuarios de Plataforma</h1>
          <p className="text-sm mt-0.5" style={{color:"var(--text-muted)"}}>Administra los accesos al panel de gestión</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{background:"var(--accent)",color:"var(--text-on-primary)",boxShadow:"var(--shadow-glow)"}}>
          <Plus size={16}/> Nuevo Usuario
        </button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roleCounts.map(r => (
          <div key={r.role} className="p-4 rounded-2xl flex items-center gap-3" style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${r.color}15`,color:r.color}}>
              <r.icon size={18}/>
            </div>
            <div>
              <p className="text-xl font-black leading-none" style={{color:"var(--text-primary)"}}>{r.count}</p>
              <p className="text-xs mt-0.5" style={{color:"var(--text-muted)"}}>{r.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
        <Search size={15} style={{color:"var(--text-muted)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar usuario..." className="flex-1 bg-transparent outline-none text-sm" style={{color:"var(--text-primary)"}}/>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
        <table className="w-full">
          <thead>
            <tr style={{borderBottom:"1px solid var(--border)"}}>
              {["Usuario","Rol","Estado","Último acceso","Creado",""].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{color:"var(--text-muted)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u,i) => {
              const rc = roleConfig[u.role]
              return (
                <motion.tr key={u.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}
                  className="border-b last:border-b-0 transition-colors" style={{borderColor:"var(--border)"}}
                  onMouseEnter={e=>(e.currentTarget.style.background="var(--surface-hover)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{background:"linear-gradient(135deg,var(--accent),var(--detail))",color:"var(--text-on-primary)"}}>
                        {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{color:"var(--text-primary)"}}>{u.name}</p>
                        <p className="text-xs" style={{color:"var(--text-muted)"}}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{color:rc.color}}>
                      <rc.icon size={12}/>{rc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:`${u.status==="ACTIVE"?"var(--success)":"var(--text-muted)"}18`,color:u.status==="ACTIVE"?"var(--success)":"var(--text-muted)"}}>
                      {u.status==="ACTIVE"?"Activo":"Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{color:"var(--text-muted)"}}>{u.lastLogin}</td>
                  <td className="px-4 py-3 text-xs" style={{color:"var(--text-muted)"}}>{u.createdAt}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={()=>setOpenMenu(openMenu===u.id?null:u.id)} className="p-1.5 rounded-lg" style={{color:"var(--text-muted)"}}><MoreVertical size={16}/></button>
                    <AnimatePresence>
                      {openMenu===u.id&&(
                        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                          className="absolute right-0 z-10 py-1 rounded-xl w-40 shadow-lg" style={{background:"var(--surface)",border:"1px solid var(--border)",top:"100%"}}>
                          {[{label:"✏️ Editar",fn:()=>openEdit(u)},{label:u.status==="ACTIVE"?"⏸ Desactivar":"▶ Activar",fn:()=>toggleStatus(u)},{label:"🗑 Eliminar",fn:()=>deleteUser(u),danger:true}].map(item=>(
                            <button key={item.label} onClick={item.fn} className="block w-full text-left px-4 py-2 text-sm transition-colors" style={{color:item.danger?"var(--danger)":"var(--text-secondary)"}}
                              onMouseEnter={e=>(e.currentTarget.style.background="var(--surface-hover)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{background:"var(--overlay)",backdropFilter:"blur(6px)"}} onClick={()=>setShowModal(false)}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}
              className="w-full max-w-md rounded-2xl p-6" onClick={e=>e.stopPropagation()}
              style={{background:"var(--surface)",border:"1px solid var(--border)"}}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{color:"var(--text-primary)"}}>{editing?"Editar Usuario":"Nuevo Usuario"}</h2>
                <button onClick={()=>setShowModal(false)} style={{color:"var(--text-muted)"}}><X size={18}/></button>
              </div>
              <div className="space-y-4">
                {[{label:"Nombre",key:"name",placeholder:"Juan García"},{label:"Email",key:"email",placeholder:"juan@saas.com",type:"email"}].map(f=>(
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-secondary)"}}>{f.label}</label>
                    <input type={f.type??"text"} value={(form as any)[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{background:"var(--input-bg)",border:"1px solid var(--border)",color:"var(--text-primary)"}}
                      onFocus={e=>(e.target.style.borderColor="var(--accent)")} onBlur={e=>(e.target.style.borderColor="var(--border)")}/>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text-secondary)"}}>Rol</label>
                  <select value={form.role} onChange={e=>setForm({...form,role:e.target.value as Role})}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{background:"var(--input-bg)",border:"1px solid var(--border)",color:"var(--text-primary)"}}>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SUPPORT">Soporte</option>
                    <option value="DEVOPS">DevOps</option>
                    <option value="SALES">Ventas</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={()=>setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"var(--surface-hover)",color:"var(--text-secondary)"}}>Cancelar</button>
                <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{background:"var(--accent)",color:"var(--text-on-primary)"}}>{editing?"Guardar":"Crear"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-semibold z-50"
          style={{background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text-primary)",boxShadow:"var(--shadow-lg)"}}>
          ✅ {toast}
        </motion.div>)}
      </AnimatePresence>
    </div>
  )
}
