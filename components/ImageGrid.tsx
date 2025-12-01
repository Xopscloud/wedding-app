"use client"

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  images: string[]
}

function Modal({src, onClose}:{src:string|null, onClose:()=>void}){
  if(!src) return null
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <Image src={src} alt="preview" width={1200} height={800} className="object-contain rounded" unoptimized />
      </div>
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
            <div className="relative w-full h-40">
              <Image src={src} alt={`img-${i}`} fill className="object-cover" unoptimized sizes="(max-width: 640px) 100vw, 33vw" />
            </div>
          </button>
        ))}
      </div>
      <Modal src={open} onClose={()=>setOpen(null)} />
    </div>
  )
}
