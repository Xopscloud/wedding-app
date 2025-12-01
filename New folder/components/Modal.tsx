"use client"

export default function Modal({open, src, onClose}:{open:boolean, src?:string|null, onClose:()=>void}){
  if(!open || !src) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="full" className="max-h-[90vh] max-w-[90vw] rounded" />
    </div>
  )
}
