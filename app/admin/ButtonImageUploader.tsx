"use client"

import { useState, ChangeEvent } from 'react'

export default function ButtonImageUploader({ API_BASE, password }: { API_BASE: string, password: string }){
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [buttonType, setButtonType] = useState<'moments' | 'gallery'>('moments')

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
    form.append('buttonType', buttonType)
    try{
      const res = await fetch(`${API_BASE}/api/admin/button-image`, { method: 'POST', headers: { 'x-admin-password': localStorage.getItem('adminPass') || password }, body: form })
      if(!res.ok){ const text = await res.text(); setMessage('Upload failed: '+text); setLoading(false); return }
      const data = await res.json()
      setMessage(`${buttonType} button image uploaded`)
      setLoading(false)
    }catch(err){ setMessage('Upload failed'); setLoading(false) }
  }

  return (
    <div className="p-3 border rounded space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Button Type</label>
        <select value={buttonType} onChange={(e) => setButtonType(e.target.value as 'moments' | 'gallery')} className="border px-2 py-1 rounded">
          <option value="moments">Moments Button</option>
          <option value="gallery">Gallery Button</option>
        </select>
      </div>
      <input type="file" accept="image/*" onChange={onChange} />
      {preview && <img src={preview} alt="preview" className="w-full h-40 object-cover rounded" />}
      <div className="flex gap-2">
        <button onClick={upload} className="px-3 py-1 bg-blush text-white rounded" disabled={loading}>{loading ? 'Uploading...' : `Upload ${buttonType} Image`}</button>
      </div>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </div>
  )
}