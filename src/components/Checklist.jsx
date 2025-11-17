import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Node({ node, path, onAdd, onUpdate, onDelete }) {
  const isFolder = node.kind === 'folder'
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(node.title)

  const save = async () => {
    await onUpdate(path, { title })
    setEditing(false)
  }

  return (
    <div className="pl-4 border-l border-blue-100">
      <div className="flex items-center gap-2 py-1">
        {isFolder && (
          <button onClick={()=>setOpen(!open)} className="text-blue-600 px-2">{open ? '-' : '+'}</button>
        )}
        {editing ? (
          <input value={title} onChange={(e)=>setTitle(e.target.value)} onBlur={save} className="border border-blue-300 rounded px-2 py-1" />
        ) : (
          <span className="text-gray-800" onDoubleClick={()=>setEditing(true)}>{node.title}</span>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={()=>onAdd(path, 'item')} className="text-blue-600">+ item</button>
          <button onClick={()=>onAdd(path, 'folder')} className="text-blue-600">+ cartella</button>
          <button onClick={()=>onDelete(path)} className="text-red-500">canc</button>
        </div>
      </div>
      {isFolder && open && node.children && (
        <div className="space-y-1">
          {node.children.map((child, idx)=> (
            <Node key={child.id} node={child} path={[...path, idx]} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Checklist({ property }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch(`${API}/api/properties/${property.id}/checklist`)
    const data = await res.json()
    setList(data)
  }

  useEffect(()=>{ load() }, [property.id])

  const addAt = async (path, kind) => {
    setLoading(true)
    await fetch(`${API}/api/properties/${property.id}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: kind === 'folder' ? 'Nuova cartella' : 'Nuovo elemento', kind, parent_path: path })
    })
    setLoading(false)
    load()
  }

  const updateAt = async (path, payload) => {
    await fetch(`${API}/api/properties/${property.id}/checklist?` + new URLSearchParams({ path: path.join(',') }), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    load()
  }

  const deleteAt = async (path) => {
    await fetch(`${API}/api/properties/${property.id}/checklist?` + new URLSearchParams({ path: path.join(',') }), {
      method: 'DELETE'
    })
    load()
  }

  // Root level controls
  const addRoot = async (kind)=> addAt([], kind)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-blue-600">Checklist</h3>
        <div className="flex gap-3">
          <button onClick={()=>addRoot('item')} className="bg-blue-500 text-white px-3 py-1 rounded">+ elemento</button>
          <button onClick={()=>addRoot('folder')} className="bg-blue-500 text-white px-3 py-1 rounded">+ cartella</button>
        </div>
      </div>

      <div className="space-y-1">
        {list.length === 0 && (
          <p className="text-gray-500">Nessuna voce ancora. Usa "+" per aggiungere.</p>
        )}
        {list.map((n, idx)=> (
          <Node key={n.id} node={n} path={[idx]} onAdd={addAt} onUpdate={updateAt} onDelete={deleteAt} />
        ))}
      </div>
    </div>
  )
}
