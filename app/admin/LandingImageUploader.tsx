"use client"

import { useState, ChangeEvent } from 'react'

export default function LandingImageUploader({ API_BASE, password }: { API_BASE: string, password: string }){
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function onChange(e: ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0] || null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  async function upload(){
    if(!file){ setMessage('Select an image first'); return }
    setLoading(true); setMessage(null)
    const form = new FormData()
    form.append('image', file)
    try{
      const res = await fetch(`${API_BASE}/api/admin/landing-image`, { method: 'POST', headers: { 'x-admin-password': localStorage.getItem('adminPass') || password }, body: form })
      if(!res.ok){ const text = await res.text(); setMessage('Upload failed: '+text); setLoading(false); return }
      const data = await res.json()
      setMessage('Uploaded')
      setLoading(false)
    }catch(err){ setMessage('Upload failed'); setLoading(false) }
  }

  return (
    <div className="p-3 border rounded space-y-3">
      <input type="file" accept="image/*" onChange={onChange} />
      {preview && <img src={preview} alt="preview" className="w-full h-40 object-cover rounded" />}
      <div className="flex gap-2">
        <button onClick={upload} className="px-3 py-1 bg-blush text-white rounded" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </div>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </div>
  )
}
