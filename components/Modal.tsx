"use client"

import Image from 'next/image'

export default function Modal({open, src, onClose}:{open:boolean, src?:string|null, onClose:()=>void}){
  if(!open || !src) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <Image src={src} alt="full" width={1200} height={800} className="object-contain rounded" unoptimized />
      </div>
    </div>
  )
}
