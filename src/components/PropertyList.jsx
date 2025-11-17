import { useEffect, useState, useRef } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function PropertyList({ onOpen }) {
  const [properties, setProperties] = useState([])
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    const res = await fetch(`${API}/api/properties`)
    const data = await res.json()
    setProperties(data)
  }

  useEffect(() => { load() }, [])

  const handleImageFile = (file) => {
    if (!file || !file.type?.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const onPaste = (e) => {
    const items = e.clipboardData?.items || []
    for (const item of items) {
      if (item.type?.startsWith('image/')) {
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
      body: JSON.stringify({ name: name.trim(), photo_url: photoUrl || null })
    })
    setName('')
    setPhotoUrl('')
    setLoading(false)
    load()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addProperty} className="space-y-3">
        <label className="block text-sm text-blue-600">Nome Casa + Foto</label>
        <div
          className={`flex items-center gap-3 border rounded px-3 py-2 transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-300'}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onPaste={onPaste}
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`relative w-12 h-12 rounded border ${photoUrl ? 'border-transparent' : 'border-dashed border-blue-300'} flex items-center justify-center text-blue-500 text-xs shrink-0 overflow-hidden bg-white`}
            aria-label="Seleziona foto"
            title="Clicca per scegliere una foto, oppure trascina/incolla"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>Foto</>
            )}
          </button>
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Es. Casa Mare Blu"
            className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e)=>handleImageFile(e.target.files?.[0])}
          />
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="text-blue-600 border border-blue-300 rounded px-2 py-1"
            >Rimuovi foto</button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            + Aggiungi
          </button>
        </div>
        <p className="text-xs text-blue-500">Suggerimento: incolla un'immagine (Cmd/Ctrl+V) o trascinala sul riquadro; clicca su "Foto" per scegliere da file.</p>
      </form>

      <div className="grid sm:grid-cols-2 gap-4">
        {properties.map((p)=> (
          <button key={p.id} onClick={()=>onOpen(p)} className="text-left border border-blue-200 rounded-lg p-3 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-full h-40 object-cover rounded" />
            ) : (
              <div className="w-full h-40 bg-blue-50 border border-dashed border-blue-200 rounded flex items-center justify-center text-blue-400">Nessuna foto</div>
            )}
            <h3 className="mt-2 text-lg font-semibold text-blue-700 line-clamp-1">{p.name}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}
