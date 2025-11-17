import { useEffect, useState, useRef } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function PropertyList({ onOpen }) {
  const [properties, setProperties] = useState([])
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const load = async () => {
    const res = await fetch(`${API}/api/properties`)
    const data = await res.json()
    setProperties(data)
  }

  useEffect(() => { load() }, [])

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const onPaste = async (e) => {
    const items = e.clipboardData?.items || []
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        handleImageFile(file)
        e.preventDefault()
        break
      }
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleImageFile(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const addProperty = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await fetch(`${API}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, photo_url: photoUrl || null })
    })
    setName('')
    setPhotoUrl('')
    setLoading(false)
    load()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addProperty} className="space-y-3">
        <label className="block text-sm text-blue-600">Nome Casa (incolla o trascina una foto qui dentro)</label>
        <div
          className={
            `flex items-center gap-3 border rounded px-3 py-2 transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-300'}`
          }
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {photoUrl ? (
            <div className="relative">
              <img src={photoUrl} alt="preview" className="w-12 h-12 object-cover rounded" />
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="absolute -top-2 -right-2 bg-white border border-blue-300 text-blue-600 rounded-full w-6 h-6 text-xs"
                aria-label="Rimuovi foto"
              >×</button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded border border-dashed border-blue-300 flex items-center justify-center text-blue-400 text-xs">
              Foto
            </div>
          )}
          <input
            ref={inputRef}
            value={name}
            onChange={(e)=>setName(e.target.value)}
            onPaste={onPaste}
            placeholder="Es. Casa Mare Blu"
            className="flex-1 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            + Aggiungi
          </button>
        </div>
        <p className="text-xs text-blue-400">Suggerimento: puoi incollare una foto direttamente qui (Cmd/Ctrl+V) o trascinarla sopra il campo.</p>
      </form>

      <div className="space-y-4">
        {properties.map((p)=> (
          <div key={p.id} onClick={()=>onOpen(p)} className="cursor-pointer border border-blue-200 rounded-lg p-4 hover:shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">{p.name}</h3>
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-full h-56 object-cover rounded" />
            ) : (
              <div className="w-full h-56 bg-blue-50 border border-dashed border-blue-200 rounded flex items-center justify-center text-blue-400">Nessuna foto</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
