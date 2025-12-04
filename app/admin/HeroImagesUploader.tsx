"use client"

import { useState, ChangeEvent } from 'react'

export default function HeroImagesUploader({ API_BASE, password } : { API_BASE: string, password: string }){
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function onChange(e: ChangeEvent<HTMLInputElement>){
    const selected = e.target.files ? Array.from(e.target.files).slice(0,3) : []
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  async function uploadAll(){
    if(files.length === 0){ setMessage('Select up to 3 images'); return }
    setLoading(true); setMessage(null)
    try{
      const uploadedPaths: string[] = []
      for(const f of files){
        // Try presigned upload first
        let finalUrl = ''
        try{
          const pass = localStorage.getItem('adminPass') || password
          const presignRes = await fetch(`${API_BASE}/api/admin/s3-presign`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-password': pass }, body: JSON.stringify({ filename: f.name, contentType: f.type }) })
          if(presignRes.ok){
            const pd = await presignRes.json()
            if(pd && pd.uploadUrl && pd.publicUrl){
              // PUT the file directly to S3
              const putRes = await fetch(pd.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f })
              if(!putRes.ok) throw new Error('Direct upload failed')
              finalUrl = pd.publicUrl
            }
          }
        }catch(e){
          // ignore and fallback to backend upload
        }

        if(!finalUrl){
          const form = new FormData()
          form.append('image', f)
          // Fallback to landing-image endpoint
          const res = await fetch(`${API_BASE}/api/admin/landing-image`, { method: 'POST', headers: { 'x-admin-password': localStorage.getItem('adminPass') || password }, body: form })
          if(!res.ok){ const text = await res.text(); throw new Error('Upload failed: ' + text) }
          const data = await res.json()
          if(data && data.image) finalUrl = data.image
        }

        if(finalUrl) uploadedPaths.push(finalUrl)
      }

      // Save each uploaded path into settings keys moments:hero:1..N
      for(let i=0;i<uploadedPaths.length;i++){
        const key = `moments:hero:${i+1}`
        await fetch(`${API_BASE}/api/admin/settings`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-password': localStorage.getItem('adminPass') || password }, body: JSON.stringify({ key, value: uploadedPaths[i] }) })
      }

      setMessage('Uploaded and saved hero images')
      setFiles([])
      setPreviews([])
    }catch(err:any){
      console.error(err)
      setMessage(err?.message || 'Upload failed')
    }
    setLoading(false)
  }

  return (
    <div className="p-3 border rounded space-y-3">
      <label className="block text-sm font-medium">Moments Hero Images (up to 3)</label>
      <input type="file" accept="image/*" multiple onChange={onChange} />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((p, i) => (
            <img key={i} src={p} alt={`preview-${i}`} className="w-full h-32 object-cover rounded" />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={uploadAll} className="px-3 py-1 bg-sage text-white rounded" disabled={loading}>{loading ? 'Uploading...' : 'Upload & Save'}</button>
      </div>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </div>
  )
}
