import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Versione solo-elementi: nessuna cartella, lista piatta
function Row({ node, indexPath, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(node.title || '')

  useEffect(() => {
    setTitle(node.title || '')
  }, [node.title])

  const save = async () => {
    const next = (title || '').trim()
    if (next !== (node.title || '')) {
      await onUpdate(indexPath, { title: next })
    }
    setEditing(false)
  }

  const onKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await save()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setTitle(node.title || '')
      setEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 py-1">
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          onBlur={() => { void save() }}
          onKeyDown={onKeyDown}
          className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
        />
      ) : (
        <button className="text-gray-800 text-left w-full" onDoubleClick={()=>setEditing(true)} onClick={()=>setEditing(true)}>
          {node.title || 'Senza titolo'}
        </button>
      )}
      <button onClick={()=>onDelete(indexPath)} className="text-red-500 underline shrink-0">canc</button>
    </div>
  )
}

export default function Checklist({ property }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const toFlat = (data) => Array.isArray(data) ? data.map(n => ({ id: n.id, title: n.title || '', kind: 'item' })) : []

  const load = async () => {
    const res = await fetch(`${API}/api/properties/${property.id}/checklist`)
    const data = await res.json()
    setList(toFlat(data))
  }

  useEffect(()=>{ load() }, [property.id])

  const addRootItem = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/api/properties/${property.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nuovo elemento', kind: 'item', parent_path: [] })
      })
      const data = await res.json()
      if (data && data.checklist) setList(toFlat(data.checklist))
      else await load()
    } finally {
      setLoading(false)
    }
  }

  const updateAt = async (path, payload) => {
    const res = await fetch(`${API}/api/properties/${property.id}/checklist?` + new URLSearchParams({ path: path.join(',') }), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data && data.checklist) setList(toFlat(data.checklist))
    else await load()
  }

  const deleteAt = async (path) => {
    const res = await fetch(`${API}/api/properties/${property.id}/checklist?` + new URLSearchParams({ path: path.join(',') }), {
      method: 'DELETE'
    })
    const data = await res.json()
    if (data && data.checklist) setList(toFlat(data.checklist))
    else await load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-blue-600">Checklist</h3>
        <div className="flex gap-3">
          <button onClick={addRootItem} disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded">+ elemento</button>
        </div>
      </div>

      <div className="space-y-1">
        {list.length === 0 && (
          <p className="text-gray-500">Nessuna voce ancora. Usa "+" per aggiungere.</p>
        )}
        {list.map((n, idx)=> (
          <Row key={n.id || idx} node={n} indexPath={[idx]} onUpdate={updateAt} onDelete={deleteAt} />
        ))}
      </div>
    </div>
  )
}
