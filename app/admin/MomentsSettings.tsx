"use client"

import { useEffect, useState } from 'react'

type Setting = { key: string, value: string }

type Moment = { id:number, image:string, title?:string, section?:string }

export default function MomentsSettings({ API_BASE, password } : { API_BASE:string, password:string }){
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [moments, setMoments] = useState<Moment[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const keys = [
    'moments:couple1:title',
    'moments:couple1:description',
    'moments:couple1:featured',
    'moments:couple2:title',
    'moments:couple2:description',
    'moments:couple2:featured',
    'home:best:1',
    'home:best:2',
    'home:best:3',
    'home:best:4'
  ]

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`${API_BASE}/api/settings`)
        if(res.ok){
          const data = await res.json()
          setSettings(data)
        }
        const mres = await fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': localStorage.getItem('adminPass') || password } })
        if(mres.ok){ const md = await mres.json(); setMoments(md) }
      }catch(e){ }
    }
    load()
  }, [])

  function setLocal(k:string, v:string){
    setSettings(s => ({...s, [k]: v}))
  }

  async function saveAll(){
    setSaving(true); setMessage(null)
    try{
      for(const k of keys){
        const val = settings[k] || ''
        await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'x-admin-password': localStorage.getItem('adminPass') || password },
          body: JSON.stringify({ key: k, value: val })
        })
      }
      setMessage('Saved')
    }catch(e){ setMessage('Save failed') }
    setSaving(false)
  }

  return (
    <div className="p-3 border rounded space-y-4">
      <h3 className="text-lg font-semibold">Moments — Couple Sections</h3>
      <p className="text-sm text-gray-600">Edit titles, descriptions and choose featured images for the two couple sections shown on the Moments page.</p>

      {['couple1','couple2'].map((c, idx)=> (
        <div key={c} className="p-3 border rounded">
          <div className="mb-2 font-semibold">{`Couple ${idx+1}`}</div>
          <input value={settings[`moments:${c}:title`] || ''} onChange={(e)=>setLocal(`moments:${c}:title`, e.target.value)} placeholder="Title" className="border px-2 py-1 w-full mb-2" />
          <textarea value={settings[`moments:${c}:description`] || ''} onChange={(e)=>setLocal(`moments:${c}:description`, e.target.value)} placeholder="Description" className="border px-2 py-1 w-full mb-2" />

          <div className="mb-2">
            <label className="block text-sm mb-1">Featured image</label>
            <select value={settings[`moments:${c}:featured`] || ''} onChange={(e)=>setLocal(`moments:${c}:featured`, e.target.value)} className="border px-2 py-1 w-full">
              <option value="">(none)</option>
              {moments.map(m => (
                <option key={m.id} value={m.image}>{m.title ? `${m.title} — ${m.image}` : m.image}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <div className="p-3 border rounded">
        <div className="mb-2 font-semibold">Home — Best Moments</div>
        <p className="text-sm text-gray-600 mb-2">Select up to 4 moments to appear on the homepage Best Moments section.</p>
        {[1,2,3,4].map(n => (
          <div key={`home-best-${n}`} className="mb-2">
            <label className="block text-sm mb-1">Best {n}</label>
            <select value={settings[`home:best:${n}`] || ''} onChange={(e)=>setLocal(`home:best:${n}`, e.target.value)} className="border px-2 py-1 w-full">
              <option value="">(none)</option>
              {moments.map(m => (
                <option key={m.id} value={String(m.id)}>{m.title ? `${m.title}` : m.image}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={saveAll} className="px-3 py-1 bg-sage text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save All'}</button>
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  )
}
