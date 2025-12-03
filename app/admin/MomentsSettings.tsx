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
    'moments:placeholder:1',
    'moments:placeholder:2',
    'moments:placeholder:3',
    'moments:placeholder:4',
    'moments:placeholder:5',
    'moments:placeholder:6',
    'moments:placeholder:7',
    'moments:placeholder:8',
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
      <div className="p-3 border rounded">
        <div className="mb-2 font-semibold">Moments Page — Placeholder Images</div>
        <p className="text-sm text-gray-600 mb-3">Choose images to display as placeholders for each position on the Moments page. There are 8 image positions (4 in first section, 4 in second section).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={`placeholder-${n}`} className="p-2 border rounded bg-gray-50">
              <label className="block text-sm font-medium mb-1">
                Position {n} {n <= 4 ? '(First Section)' : '(Second Section)'}
              </label>
              <select 
                value={settings[`moments:placeholder:${n}`] || ''} 
                onChange={(e)=>setLocal(`moments:placeholder:${n}`, e.target.value)} 
                className="border px-2 py-1 w-full text-sm"
              >
                <option value="">(none)</option>
                {moments.map(m => (
                  <option key={m.id} value={m.image}>{m.title ? `${m.title}` : m.image}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

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
