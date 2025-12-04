"use client"

import { useEffect, useState } from 'react'
import { albums as albumMap } from '../../data/albums'

export default function HomeEditor({ API_BASE, password } : { API_BASE:string, password:string }){
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [moments, setMoments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(()=>{ load() }, [])

  async function load(){
    try{
      setLoading(true)
      const sres = await fetch(`${API_BASE}/api/settings`)
      if(sres.ok){ const sd = await sres.json(); setSettings(sd) }
      const mres = await fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': localStorage.getItem('adminPass') || password } })
      if(mres.ok){ const md = await mres.json(); setMoments(md) }
    }catch(e){ }
    setLoading(false)
  }

  async function saveSetting(k:string, v:string){
    try{
      setMessage(null)
      const pass = localStorage.getItem('adminPass') || password
      await fetch(`${API_BASE}/api/admin/settings`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-password': pass }, body: JSON.stringify({ key: k, value: v }) })
      setSettings(s => ({...s, [k]: v}))
      setMessage('Saved')
    }catch(e){ setMessage('Save failed') }
  }

  // Helper to list album keys
  const albumKeys = Object.keys(albumMap)

  return (
    <div className="space-y-6">
      {message && <div className="p-2 bg-green-50 text-green-800 rounded">{message}</div>}

      <div className="p-3 border rounded">
        <h3 className="font-semibold mb-2">Home — Hero Title & Subtitle</h3>
        <div className="space-y-2">
          <input value={settings['home:title'] || ''} onChange={(e)=>setSettings(s=>({...s, ['home:title']: e.target.value}))} placeholder="Home title" className="border px-2 py-1 w-full" />
          <textarea value={settings['home:subtitle'] || ''} onChange={(e)=>setSettings(s=>({...s, ['home:subtitle']: e.target.value}))} placeholder="Home subtitle" className="border px-2 py-1 w-full" rows={3} />
          <div className="flex gap-2">
            <button onClick={()=>saveSetting('home:title', settings['home:title'] || '')} className="px-3 py-1 bg-sage text-white rounded">Save Title</button>
            <button onClick={()=>saveSetting('home:subtitle', settings['home:subtitle'] || '')} className="px-3 py-1 bg-sage text-white rounded">Save Subtitle</button>
          </div>
        </div>
      </div>

      <div className="p-3 border rounded">
        <h3 className="font-semibold mb-2">Album Cover Images</h3>
        <p className="text-sm text-gray-600 mb-3">Choose a cover image for each album. You can select from the album's default images or from uploaded moments.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {albumKeys.map((ak) => (
            <AlbumCoverRow key={ak} albumKey={ak} API_BASE={API_BASE} password={password} moments={moments} current={settings[`album:cover:${ak}`] || ''} onSave={(v)=>saveSetting(`album:cover:${ak}`, v)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AlbumCoverRow({ albumKey, moments, current, onSave, API_BASE, password } : { albumKey:string, moments:any[], current:string, onSave:(v:string)=>void, API_BASE:string, password:string }){
  const [value, setValue] = useState<string>(current)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(()=>{ setValue(current) }, [current])

  // Options: images from albumMap + all moments images
  const albumOptions = (albumMap as any)[albumKey] || []
  const momentOptions = moments.map(m => (m.image.startsWith('/') ? m.image : m.image))

  return (
    <div className="p-2 border rounded bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{albumKey}</div>
        <div className="text-sm text-gray-600">Selected: {value ? 'custom' : 'default'}</div>
      </div>
      <div className="mb-2">
        <select value={value} onChange={(e)=>setValue(e.target.value)} className="border px-2 py-1 w-full">
          <option value="">(use default first image)</option>
          <optgroup label="Album images">
            {albumOptions.map((p:string, i:number) => <option key={`a-${i}`} value={p}>{p}</option>)}
          </optgroup>
          <optgroup label="Uploaded moments">
            {momentOptions.map((p:string, i:number) => <option key={`m-${i}`} value={p}>{p}</option>)}
          </optgroup>
        </select>
      </div>
      <div className="mb-2">
        <div className="w-full h-36 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : (value ? <img src={(value.startsWith('/') ? API_BASE : '') + value} alt="preview" className="w-full h-full object-cover" /> : <div className="text-sm text-gray-500">Default: album first image</div>)}
        </div>
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1">Upload custom cover</label>
        <input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0] || null; setFile(f); setPreview(f ? URL.createObjectURL(f) : null); setMsg(null) }} />
        <div className="mt-2 flex gap-2">
          <button disabled={!file || uploading} onClick={async ()=>{
            if(!file) return
            setUploading(true); setMsg(null)
            try{
              const pass = localStorage.getItem('adminPass') || password
              // Try presign first
              let uploadedUrl = ''
              try{
                const presignRes = await fetch(`${API_BASE}/api/admin/s3-presign`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-password': pass }, body: JSON.stringify({ filename: file.name, contentType: file.type }) })
                if(presignRes.ok){
                  const pd = await presignRes.json()
                  if(pd && pd.uploadUrl && pd.publicUrl){
                    const putRes = await fetch(pd.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
                    if(!putRes.ok) throw new Error('Direct upload failed')
                    uploadedUrl = pd.publicUrl
                  }
                }
              }catch(e){ /* fallback */ }

              if(!uploadedUrl){
                const form = new FormData()
                form.append('image', file)
                const res = await fetch(`${API_BASE}/api/admin/landing-image`, { method: 'POST', headers: { 'x-admin-password': pass }, body: form })
                if(!res.ok){ const t = await res.text(); throw new Error(t || 'Upload failed') }
                const data = await res.json()
                if(data && data.image) uploadedUrl = data.image
              }

              if(uploadedUrl){
                setValue(uploadedUrl)
                onSave(uploadedUrl)
                setMsg('Uploaded and saved')
                setFile(null)
                setPreview(null)
              }
            }catch(err:any){ setMsg(err?.message || 'Upload failed') }
            setUploading(false)
          }} className="px-3 py-1 bg-sage text-white rounded disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload & Save'}</button>
          <button onClick={()=>{ setFile(null); setPreview(null); setMsg(null) }} className="px-3 py-1 bg-gray-200 rounded">Clear</button>
        </div>
        {msg && <div className="text-sm text-gray-700 mt-2">{msg}</div>}
      </div>
      <div className="flex gap-2">
        <button onClick={()=>onSave(value)} className="px-3 py-1 bg-sage text-white rounded">Save Cover</button>
        <button onClick={()=>{ setValue(''); onSave('') }} className="px-3 py-1 bg-gray-200 rounded">Reset to Default</button>
      </div>
    </div>
  )
}
