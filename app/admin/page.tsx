"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import LandingImageUploader from './LandingImageUploader'
import HeroImagesUploader from './HeroImagesUploader'
import MomentGroupForm from './MomentGroupForm'
import MomentGroupManager from './MomentGroupManager'
import HomeEditor from './HomeEditor'
import AlbumManager from './AlbumManager'
import Dashboard from './Dashboard'
import ImageUploader from './ImageUploader'

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
  const [view, setView] = useState<'dashboard' | 'upload' | 'moments' | 'home' | 'albums'>('dashboard')
  const [momentsView, setMomentsView] = useState<'hero' | 'best' | 'create' | 'manage'>('hero')
  const [selectedSection, setSelectedSection] = useState<string>('moments')
  const [files, setFiles] = useState<FileMeta[]>([])
  const [moments, setMoments] = useState<Moment[]>([])
  const [bestSelections, setBestSelections] = useState<Record<number,string>>({1:'',2:'',3:'',4:''})
  const [bestMessage, setBestMessage] = useState<string | null>(null)
  const [bestLoading, setBestLoading] = useState<boolean>(false)
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

  // Best moments settings: load and save
  async function loadBestSettings(){
    try{
      setBestLoading(true)
      const res = await fetch(`${API_BASE}/api/settings`)
      if(!res.ok){ setBestLoading(false); return }
      const settings = await res.json()
      const next: Record<number,string> = {1:'',2:'',3:'',4:''}
      for(let i=1;i<=4;i++) next[i] = settings[`home:best:${i}`] || ''
      setBestSelections(next)
    }catch(e){ }
    setBestLoading(false)
  }

  async function saveBestSettings(){
    try{
      setBestLoading(true)
      const pass = localStorage.getItem('adminPass') || password
      for(let i=1;i<=4;i++){
        const key = `home:best:${i}`
        const value = bestSelections[i] || ''
        await fetch(`${API_BASE}/api/admin/settings`, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-admin-password': pass }, body: JSON.stringify({ key, value }) })
      }
      setBestMessage('Saved')
    }catch(e){ setBestMessage('Save failed') }
    setBestLoading(false)
    // refresh moments list
    fetchMoments()
  }

  // load best settings when entering the Best tab
  useEffect(() => {
    if(view === 'moments' && momentsView === 'best'){
      loadBestSettings()
    }
  }, [view, momentsView])

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
          setView('dashboard')
          setMomentsView('hero')
        }} className="px-3 py-1 bg-gray-200 text-sm rounded">Logout</button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'dashboard' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('upload')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'upload' ? 'border-sage text-sage' : 'border-transparent text-gray-600'}`}
        >
          Upload Media
        </button>
        <button
          onClick={() => setView('home')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'home' ? 'border-gold text-gold' : 'border-transparent text-gray-600'}`}
        >
          Home
        </button>
        <button
          onClick={() => setView('moments')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'moments' ? 'border-blush text-blush' : 'border-transparent text-gray-600'}`}
        >
          Moments
        </button>
        <button
          onClick={() => setView('albums')}
          className={`px-4 py-2 font-semibold border-b-2 ${view === 'albums' ? 'border-purple-500 text-purple-500' : 'border-transparent text-gray-600'}`}
        >
          Albums
        </button>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="mb-6">
          <Dashboard 
            API_BASE={API_BASE} 
            password={password} 
            onNavigate={(newView, subView) => {
              setView(newView as any)
              if (subView && newView === 'moments') {
                setMomentsView(subView as any)
              }
            }}
          />
        </div>
      )}

      {/* Home View */}
      {view === 'home' && (
        <div className="mb-6">
          <h2 className="text-xl mb-3 font-semibold">Home Page Settings</h2>
          <HomeEditor API_BASE={API_BASE} password={password} />
        </div>
      )}

      {/* Albums View */}
      {view === 'albums' && (
        <div className="mb-6">
          <h2 className="text-xl mb-3 font-semibold">Album Management</h2>
          <p className="text-sm text-gray-600 mb-4">Manage images for each album separately. You can add, remove, change, and reorder images.</p>
          <AlbumManager API_BASE={API_BASE} password={password} />
        </div>
      )}

      {/* Moments View with Sub-tabs */}
      {view === 'moments' && (
        <div>
          <div className="flex gap-3 mb-6 bg-gray-100 p-2 rounded">
            <button
              onClick={() => setMomentsView('hero')}
              className={`px-3 py-1 rounded text-sm ${momentsView === 'hero' ? 'bg-white shadow' : ''}`}
            >
              Hero Images
            </button>
            <button
              onClick={() => setMomentsView('best')}
              className={`px-3 py-1 rounded text-sm ${momentsView === 'best' ? 'bg-white shadow' : ''}`}
            >
              Best Moments
            </button>
            <button
              onClick={() => setMomentsView('create')}
              className={`px-3 py-1 rounded text-sm ${momentsView === 'create' ? 'bg-white shadow' : ''}`}
            >
              Create Group
            </button>
            <button
              onClick={() => setMomentsView('manage')}
              className={`px-3 py-1 rounded text-sm ${momentsView === 'manage' ? 'bg-white shadow' : ''}`}
            >
              Manage Groups
            </button>
          </div>

          {/* Hero Images */}
          {momentsView === 'hero' && (
            <div className="mb-6">
              <h2 className="text-xl mb-3 font-semibold">Moments Hero Images</h2>
              <p className="text-sm text-gray-600 mb-3">Upload up to 3 images to use in the hero row on the Moments page.</p>
              <HeroImagesUploader API_BASE={API_BASE} password={password} />
            </div>
          )}

          {/* Best Moments */}
          {momentsView === 'best' && (
            <div className="mb-6">
              <h2 className="text-xl mb-3 font-semibold">Home — Best Moments</h2>
              {bestMessage && <div className="mb-2 text-sm text-green-700">{bestMessage}</div>}
              {bestLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1,2,3,4].map(n => (
                    <div key={n}>
                      <label className="block text-sm mb-1">Best {n}</label>
                      <select value={bestSelections[n] || ''} onChange={(e) => setBestSelections(s => ({ ...s, [n]: e.target.value }))} className="border px-2 py-1 w-full">
                        <option value="">(none)</option>
                        {moments.map(m => (
                          <option key={m.id} value={String(m.id)}>{m.title ? m.title : m.image}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={saveBestSettings} className="px-3 py-1 bg-sage text-white rounded" disabled={bestLoading}>Save Best Moments</button>
                <button onClick={loadBestSettings} className="px-3 py-1 bg-gray-200 rounded" disabled={bestLoading}>Reload</button>
              </div>
            </div>
          )}

          {/* Create Group */}
          {momentsView === 'create' && (
            <div className="mb-6">
              <h2 className="text-xl mb-3 font-semibold">Create Moment Group</h2>
              <MomentGroupForm API_BASE={API_BASE} password={password} onSuccess={() => setMomentsView('manage')} />
            </div>
          )}

          {/* Manage Groups */}
          {momentsView === 'manage' && (
            <div className="mb-6">
              <h2 className="text-xl mb-3 font-semibold">Manage Moment Groups</h2>
              <MomentGroupManager API_BASE={API_BASE} password={password} />
            </div>
          )}
        </div>
      )}

      {/* Upload Media View */}
      {view === 'upload' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl mb-3 font-semibold">Upload Images</h2>
            
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-medium">Section:</label>
              <select 
                value={selectedSection} 
                onChange={(e)=>setSelectedSection(e.target.value)} 
                className="border px-3 py-2 rounded-lg"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <ImageUploader 
              API_BASE={API_BASE} 
              password={password} 
              selectedSection={selectedSection}
            />
          </div>

          <hr />

          <div>
            <h2 className="text-xl mb-3 font-semibold">Landing Page Image</h2>
            <p className="text-sm text-gray-600 mb-4">Upload an image to use as the landing page background.</p>
            <LandingImageUploader API_BASE={API_BASE} password={password} />
          </div>
        </div>
      )}

    </div>
  )
}
