"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { albums } from '../../data/albums'

interface Moment { id:number, image:string }

export default function PreWedding(){
  const [images, setImages] = useState<string[]>(albums.preWedding || [])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(()=>{
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok){ setLoading(false); return }
        const data: Moment[] = await res.json()
        const uploaded = (data || [])
          .filter(m => (m && m.image))
          .filter((m:any)=> (m.section || '').toLowerCase() === 'pre-wedding')
          .map(m => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setImages([...uploaded, ...(albums.preWedding || [])])
      }catch(e){}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-3 text-left">
            <div className="text-3xl font-serif mb-4">Pre-Wedding<br/><span className="text-sm uppercase text-gray-500">Portfolio</span></div>
            <p className="text-gray-600">A curated selection of pre-wedding moments — quiet portraits, candid rehearsals, and the small details that tell the story.</p>
          </aside>

          <div className="lg:col-span-9">
            {loading ? (
              <div className="h-72 flex items-center justify-center">Loading...</div>
            ) : (
              <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {images.map((src, i) => (
                  <div key={i} className="break-inside-avoid relative overflow-hidden rounded-md shadow-sm cursor-pointer" onClick={() => setSelected(src)}>
                    <img src={src} alt={`prew-${i}`} className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={()=>setSelected(null)}>×</button>
          <img src={selected} alt="full" className="max-w-full max-h-[90vh] object-contain" onClick={(e)=>e.stopPropagation()} />
        </div>
      )}
    </main>
  )
}
