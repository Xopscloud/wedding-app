"use client"

import { useState, useEffect } from 'react'

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

interface MomentGroup {
  id: number
  title: string
  description: string
  moments: Moment[]
}

export default function MomentGroupManager({ API_BASE, password }: { API_BASE: string, password: string }){
  const [moments, setMoments] = useState<Moment[]>([])
  const [momentGroups, setMomentGroups] = useState<MomentGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [editFields, setEditFields] = useState<{ title: string, description: string }>({ title: '', description: '' })
  const [selectedSection, setSelectedSection] = useState<string>('all')

  const SECTIONS = ['all', 'moments', 'wedding', 'engagement', 'pre-wedding', 'save-the-date', 'madhuramveppu', 'gallery', 'albums']

  useEffect(() => {
    fetchMoments()
  }, [])

  async function fetchMoments(){
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': localStorage.getItem('adminPass') || password } })
      if(!res.ok) { setMessage('Failed to fetch'); setLoading(false); return }
      const data = await res.json()
      setMoments(data)
      
      // Group into blocks of 4
      const groups: MomentGroup[] = []
      for(let i=0;i<data.length;i+=4){
        const blockMoments = data.slice(i, i+4)
        groups.push({
          id: Math.floor(i/4),
          title: blockMoments[0].title,
          description: blockMoments[0].description,
          moments: blockMoments
        })
      }
      setMomentGroups(groups)
      setLoading(false)
    } catch(err) {
      setMessage('Failed to fetch moments')
      setLoading(false)
    }
  }

  async function deleteGroup(groupId: number){
    if(!confirm('Delete this moment group and all its images?')) return
    try {
      const pass = localStorage.getItem('adminPass') || password
      const group = momentGroups.find(g => g.id === groupId)
      if(!group) return

      // Delete all moments in the group
      for(const m of group.moments){
        await fetch(`${API_BASE}/api/admin/moments/${m.id}`, { method: 'DELETE', headers: { 'x-admin-password': pass } })
      }
      setMessage('Group deleted')
      fetchMoments()
    } catch(err) {
      setMessage('Delete failed')
    }
  }

  async function deleteFromGroup(groupId: number, momentId: number){
    if(!confirm('Remove this image from the group?')) return
    try {
      const pass = localStorage.getItem('adminPass') || password
      await fetch(`${API_BASE}/api/admin/moments/${momentId}`, { method: 'DELETE', headers: { 'x-admin-password': pass } })
      setMessage('Image removed')
      fetchMoments()
    } catch(err) {
      setMessage('Delete failed')
    }
  }

  async function startEditGroup(group: MomentGroup){
    setEditingGroupId(group.id)
    setEditFields({ title: group.title, description: group.description })
  }

  async function saveGroupEdit(groupId: number){
    try {
      const pass = localStorage.getItem('adminPass') || password
      const group = momentGroups.find(g => g.id === groupId)
      if(!group || group.moments.length === 0) return

      // Update the first moment's title and description (these represent the group)
      const firstMoment = group.moments[0]
      const res = await fetch(`${API_BASE}/api/admin/moments/${firstMoment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({ title: editFields.title, description: editFields.description })
      })
      if(!res.ok) { setMessage('Update failed'); return }
      setMessage('Group updated')
      setEditingGroupId(null)
      fetchMoments()
    } catch(err) {
      setMessage('Update failed')
    }
  }

  const visibleGroups = selectedSection === 'all' 
    ? momentGroups 
    : momentGroups.filter(g => g.moments.some(m => (m.section || '') === selectedSection))

  return (
    <div className="space-y-6">
      {message && <div className="p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by section:</label>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border px-3 py-1 rounded">
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-6">Loading...</div>
      ) : visibleGroups.length === 0 ? (
        <div className="text-center py-6 text-gray-600">No moment groups found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleGroups.map(group => (
            <div key={group.id} className="border rounded-lg p-4 bg-white shadow-sm">
              {/* Group Header */}
              <div className="mb-4">
                {editingGroupId === group.id ? (
                  <div className="space-y-2">
                    <input
                      value={editFields.title}
                      onChange={(e) => setEditFields(f => ({ ...f, title: e.target.value }))}
                      className="border px-2 py-1 w-full font-semibold"
                      placeholder="Group title"
                    />
                    <textarea
                      value={editFields.description}
                      onChange={(e) => setEditFields(f => ({ ...f, description: e.target.value }))}
                      className="border px-2 py-1 w-full text-sm"
                      placeholder="Group description"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveGroupEdit(group.id)} className="px-3 py-1 bg-sage text-white rounded text-sm">Save</button>
                      <button onClick={() => setEditingGroupId(null)} className="px-3 py-1 bg-gray-300 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg">{group.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => startEditGroup(group)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                      <button onClick={() => deleteGroup(group.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete Group</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Images in Group */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Images ({group.moments.length}/4)</div>
                <div className="grid grid-cols-2 gap-2">
                  {group.moments.map((m, idx) => (
                    <div key={m.id} className="relative group/img rounded overflow-hidden">
                      <img
                        src={(m.image?.startsWith('/') ? API_BASE : '') + m.image}
                        alt={m.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          onClick={() => deleteFromGroup(group.id, m.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                        >
                          Remove
                        </button>
                      </div>
                      {m.caption && <div className="text-xs text-gray-600 mt-1 truncate">{m.caption}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
