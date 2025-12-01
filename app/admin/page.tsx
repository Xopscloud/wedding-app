"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

interface Moment {
  id: number
  title: string
  description: string
  category: string
  image: string
  createdAt: string
}

export default function AdminPage(){
  const [password, setPassword] = useState<string>('')
  const [logged, setLogged] = useState<boolean>(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(()=>{
    const pass = localStorage.getItem('adminPass')
    if(pass) setLogged(true)
    if(pass) setPassword(pass)
    if(pass) fetchMoments(pass)
  }, [])

  async function login(e: FormEvent<HTMLFormElement>){
    e.preventDefault()
    localStorage.setItem('adminPass', password)
    setLogged(true)
    fetchMoments(password)
  }

  async function fetchMoments(pass: string){
    try{
      setLoading(true)
      const res = await fetch('http://localhost:4000/api/admin/moments', { headers: { 'x-admin-password': pass } })
      if(!res.ok){ setError('Unauthorized or failed to fetch'); setLoading(false); return }
      const data = await res.json()
      setMoments(data)
      setLoading(false)
    }catch(err){ setError('Failed to fetch') }
  }

  async function upload(e: FormEvent<HTMLFormElement>){
    e.preventDefault()
    setError('')
    const pass = localStorage.getItem('adminPass') || password
    if(!pass) { setError('Please login'); return }
    if(!file) { setError('Please select an image'); return }

    const form = new FormData()
    form.append('image', file)
    form.append('title', title)
    form.append('description', description)
    form.append('category', category)

    try{
      setLoading(true)
      const res = await fetch('http://localhost:4000/api/moments', {
        method: 'POST',
        headers: { 'x-admin-password': pass },
        body: form
      })
      if(!res.ok){ const text = await res.text(); setError('Upload failed: '+text); setLoading(false); return }
      await fetchMoments(pass)
      setTitle(''); setDescription(''); setCategory(''); setFile(null)
      setLoading(false)
    }catch(err){ setError('Upload failed'); setLoading(false) }
  }

  async function remove(id: number){
    const pass = localStorage.getItem('adminPass') || password
    if(!confirm('Delete this moment?')) return
    const res = await fetch(`http://localhost:4000/api/admin/moments/${id}`, { method: 'DELETE', headers: { 'x-admin-password': pass } })
    if(res.ok) fetchMoments(pass)
  }

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
      <h1 className="text-2xl mb-4">Admin — Upload Moment</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={upload} className="space-y-3 mb-6">
        <input type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0] || null)} />
        <input value={title} onChange={(e: ChangeEvent<HTMLInputElement>)=>setTitle(e.target.value)} placeholder="Title" className="border px-2 py-1 w-full" />
        <input value={description} onChange={(e: ChangeEvent<HTMLInputElement>)=>setDescription(e.target.value)} placeholder="Description" className="border px-2 py-1 w-full" />
        <input value={category} onChange={(e: ChangeEvent<HTMLInputElement>)=>setCategory(e.target.value)} placeholder="Category" className="border px-2 py-1 w-full" />
        <div>
          <button type="submit" className="px-4 py-2 bg-blush text-white rounded">Upload</button>
        </div>
      </form>

      <h2 className="text-xl mb-3">Moments</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moments.map(m => (
            <div key={m.id} className="border p-2 rounded">
              <img src={m.image} alt={m.title} className="w-full h-40 object-cover mb-2" />
              <div className="text-sm font-semibold">{m.title}</div>
              <div className="text-xs text-gray-600">{m.category}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={()=>remove(m.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
