"use client"

import { useState } from 'react'

type Props = {
  images: string[]
}

function Modal({src, onClose}:{src:string|null, onClose:()=>void}){
  if(!src) return null
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="preview" className="max-h-[90vh] max-w-[90vw] rounded" />
    </div>
  )
}

export default function ImageGrid({images}:Props){
  const [open, setOpen] = useState<string|null>(null)
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button key={i} onClick={()=>setOpen(src)} className="overflow-hidden rounded bg-white shadow hover:scale-105 transform transition">
            <img src={src} alt={`img-${i}`} className="w-full h-40 object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      <Modal src={open} onClose={()=>setOpen(null)} />
    </div>
  )
}
