"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import LandingImageUploader from './LandingImageUploader'
import MomentsSettings from './MomentsSettings'
import MomentsEditor from './MomentsEditor'

interface Moment {
  id: number
  title: string
  description: string
  category: string
  section?: string
  caption?: string
  image: string
  createdAt: string
}

type FileMeta = {
  id: string
  file: File
  title: string
  description: string
  category: string
  caption: string
}

const SECTIONS = ['all','moments','wedding','engagement','pre-wedding','save-the-date','madhuramveppu','gallery','albums']

export default function AdminPage(){
  const [password, setPassword] = useState<string>('')
  const [logged, setLogged] = useState<boolean>(false)
  const [view, setView] = useState<'upload' | 'moments'>('upload')
  const [selectedSection, setSelectedSection] = useState<string>('moments')
  const [files, setFiles] = useState<FileMeta[]>([])
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFields, setEditFields] = useState<Partial<Moment>>({})

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

  useEffect(()=>{
    const pass = localStorage.getItem('adminPass')
    if(pass) { setLogged(true); setPassword(pass); fetchMoments(pass) }
  }, [])

  async function login(e: FormEvent<HTMLFormElement>){
    e.preventDefault()
    localStorage.setItem('adminPass', password)
    setLogged(true)
    fetchMoments(password)
  }

  async function fetchMoments(pass?: string){
    try{
      setLoading(true)
      const token = pass || localStorage.getItem('adminPass') || ''
      const res = await fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': token } })
      if(!res.ok){ setError('Unauthorized or failed to fetch'); setLoading(false); return }
      const data = await res.json()
      setMoments(data)
      setLoading(false)
    }catch(err){ setError('Failed to fetch'); setLoading(false) }
  }

  function onFilesChange(e: ChangeEvent<HTMLInputElement>){
    const selected = e.target.files
    if(!selected) return
    const arr = Array.from(selected).map((f, idx) => ({ id: String(Date.now()) + '-' + idx, file: f, title: '', description: '', category: '', caption: '' }))
    setFiles(prev => [...prev, ...arr])
  }

  function updateFileMeta(idx: number, field: keyof FileMeta, value: string){
    setFiles(prev => {
      const copy = [...prev]
      // @ts-ignore
      copy[idx][field] = value
      return copy
    })
  }

  function removeFile(idx: number){
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function uploadAll(e?: FormEvent){
    e?.preventDefault()
    setError('')
    const pass = localStorage.getItem('adminPass') || password
    if(!pass) { setError('Please login'); return }
    if(files.length === 0) { setError('Please select at least one image'); return }

    const form = new FormData()
    files.forEach(fm => form.append('images', fm.file))
    const metadata = files.map(fm => ({ title: fm.title, description: fm.description, category: fm.category, caption: fm.caption, section: selectedSection }))
    form.append('metadata', JSON.stringify(metadata))

    try{
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: 'POST',
        headers: { 'x-admin-password': pass },
        body: form
      })
      if(!res.ok){ const text = await res.text(); setError('Upload failed: '+text); setLoading(false); return }
      // refresh list
      await fetchMoments(pass)
      setFiles([])
      setLoading(false)
    }catch(err){ setError('Upload failed'); setLoading(false) }
  }

  async function remove(id: number){
    const pass = localStorage.getItem('adminPass') || password
    if(!confirm('Delete this item?')) return
    const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pass } })
    if(res.ok) fetchMoments(pass)
  }

  function startEdit(m: Moment){
    setEditingId(m.id)
    setEditFields({ title: m.title, description: m.description, category: m.category, section: m.section, caption: m.caption })
  }

  function cancelEdit(){
    setEditingId(null)
    setEditFields({})
  }

  async function saveEdit(id: number){
    const pass = localStorage.getItem('adminPass') || password
    const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
      body: JSON.stringify(editFields)
    })
    if(res.ok){ await fetchMoments(pass); cancelEdit() }
    else { const text = await res.text(); setError('Update failed: ' + text) }
  }

  const visible = selectedSection === 'all' ? moments : moments.filter(m => (m.section || '') === selectedSection)

  if(!logged) return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={login} className="p-6 bg-white rounded shadow">
        <h2 className="mb-4 font-semibold">Admin Login</h2>
        <input value={password} onChange={(e: ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} placeholder="admin password" className="border px-2 py-1 mb-3 w-full" />
        <button className="px-4 py-2 bg-sage text-white rounded">Login</button>
      </form>
    </div>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button onClick={() => {
          localStorage.removeItem('adminPass')
          setPassword('')
          setLogged(false)
          setMoments([])
          setFiles([])
          setError('')
          setEditingId(null)
          setView('upload')
        }} className="px-3 py-1 bg-gray-200 text-sm rounded">Logout</button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setView('upload')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'upload' ? 'border-sage text-sage' : 'border-transparent text-gray-600'}`}
        >
          Upload Media
        </button>
        <button
          onClick={() => setView('moments')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'moments' ? 'border-blush text-blush' : 'border-transparent text-gray-600'}`}
        >
          Edit Moments
        </button>
      </div>

      {/* Moments Editor View */}
      {view === 'moments' && <MomentsEditor API_BASE={API_BASE} password={password} />}

      {/* Upload Media View */}
      {view === 'upload' && (
      <div>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm">Section:</label>
        <select value={selectedSection} onChange={(e)=>setSelectedSection(e.target.value)} className="border px-2 py-1">
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <form onSubmit={uploadAll} className="mb-6 space-y-3">
        <input type="file" accept="image/*" multiple onChange={onFilesChange} />

        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((f, idx) => (
              <div key={f.id} className="p-3 border rounded">
                <div className="flex gap-3">
                  <img src={URL.createObjectURL(f.file)} alt={f.title} className="w-28 h-20 object-cover rounded" />
                  <div className="flex-1 space-y-2">
                    <input value={f.title} onChange={(e)=>updateFileMeta(idx, 'title', e.target.value)} placeholder="Title" className="border px-2 py-1 w-full" />
                    <input value={f.description} onChange={(e)=>updateFileMeta(idx, 'description', e.target.value)} placeholder="Description" className="border px-2 py-1 w-full" />
                    <input value={f.category} onChange={(e)=>updateFileMeta(idx, 'category', e.target.value)} placeholder="Category" className="border px-2 py-1 w-full" />
                    {selectedSection === 'moments' && (
                      <input value={f.caption} onChange={(e)=>updateFileMeta(idx, 'caption', e.target.value)} placeholder="Short caption (Moments)" className="border px-2 py-1 w-full" />
                    )}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={()=>removeFile(idx)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <button type="submit" className="px-4 py-2 bg-blush text-white rounded">Upload All</button>
        </div>
      </form>

      <hr className="my-6" />

      <div className="mb-6">
        <h2 className="text-xl mb-3">Landing Page Image</h2>
        <p className="text-sm text-gray-600 mb-2">Upload an image to use as the landing page background.</p>
        <LandingImageUploader API_BASE={API_BASE} password={password} />
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-3">Moments Page Settings</h2>
        <MomentsSettings API_BASE={API_BASE} password={password} />
      </div>

      <h2 className="text-xl mb-3">Existing Items ({visible.length})</h2>

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visible.map(m => (
            <div key={m.id} className="border p-2 rounded">
              <img src={(m.image?.startsWith('/') ? API_BASE : '') + m.image} alt={m.title} className="w-full h-40 object-cover mb-2" />

              {editingId === m.id ? (
                <div className="space-y-2">
                  <input value={String(editFields.title || '')} onChange={(e)=>setEditFields(f => ({...f, title: e.target.value}))} className="border px-2 py-1 w-full" />
                  <input value={String(editFields.description || '')} onChange={(e)=>setEditFields(f => ({...f, description: e.target.value}))} className="border px-2 py-1 w-full" />
                  <input value={String(editFields.category || '')} onChange={(e)=>setEditFields(f => ({...f, category: e.target.value}))} className="border px-2 py-1 w-full" />
                  <input value={String(editFields.section || '')} onChange={(e)=>setEditFields(f => ({...f, section: e.target.value}))} className="border px-2 py-1 w-full" />
                  {selectedSection === 'moments' && (
                    <input value={String(editFields.caption || '')} onChange={(e)=>setEditFields(f => ({...f, caption: e.target.value}))} className="border px-2 py-1 w-full" />
                  )}
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>saveEdit(m.id)} className="px-3 py-1 bg-sage text-white rounded">Save</button>
                    <button onClick={cancelEdit} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-xs text-gray-600">{m.category} {m.section ? `· ${m.section}` : ''}</div>
                  {m.caption && <div className="text-sm italic mt-2">{m.caption}</div>}
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>startEdit(m)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                    <button onClick={()=>remove(m.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      )}

      </div>
      )}

    </div>
  )
}
