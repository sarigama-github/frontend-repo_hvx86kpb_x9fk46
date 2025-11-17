import { useState } from 'react'
import PropertyList from './components/PropertyList'
import Checklist from './components/Checklist'

function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-blue-100 sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Loved Homes</h1>
          {selected && (
            <button onClick={()=>setSelected(null)} className="text-blue-600 underline">Tutte le case</button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!selected ? (
          <div className="space-y-6">
            <h2 className="text-lg text-blue-600">Le tue case vacanza</h2>
            <PropertyList onOpen={setSelected} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
              <div className="sm:flex-1">
                <h2 className="text-2xl font-semibold text-blue-600">{selected.name}</h2>
                {selected.photo_url && (
                  <img src={selected.photo_url} alt={selected.name} className="w-full h-64 object-cover rounded mt-3" />
                )}
              </div>
            </div>
            <Checklist property={selected} />
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-blue-500">
        LOVEDHOMES • Organizza con semplicità
      </footer>
    </div>
  )
}

export default App
