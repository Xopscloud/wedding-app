"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

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

interface MomentsEditorProps {
  API_BASE: string
  password: string
}

export default function MomentsEditor({ API_BASE, password }: MomentsEditorProps) {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFields, setEditFields] = useState<Partial<Moment>>({})
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Create moment form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: '',
    caption: '',
    file: null as File | null,
    previewUrl: ''
  })
  const [uploadingCreate, setUploadingCreate] = useState(false)

  useEffect(() => {
    fetchMoments()
  }, [])

  async function fetchMoments() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/admin/moments`, {
        headers: { 'x-admin-password': password }
      })
      if (!res.ok) {
        setError('Failed to fetch moments')
        setLoading(false)
        return
      }
      const data = await res.json()
      setMoments(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch moments')
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setCreateForm(f => ({ ...f, file, previewUrl: preview }))
    }
  }

  async function submitCreateForm(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!createForm.file) {
      setError('Please select an image')
      return
    }

    if (!createForm.title.trim()) {
      setError('Please enter a title')
      return
    }

    setUploadingCreate(true)

    try {
      const formData = new FormData()
      formData.append('images', createForm.file)
      const metadata = [{
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        caption: createForm.caption,
        section: 'moments'
      }]
      formData.append('metadata', JSON.stringify(metadata))

      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formData
      })

      if (!res.ok) {
        const text = await res.text()
        setError('Upload failed: ' + text)
        setUploadingCreate(false)
        return
      }

      // Reset form and refresh moments
      URL.revokeObjectURL(createForm.previewUrl)
      setCreateForm({ title: '', description: '', category: '', caption: '', file: null, previewUrl: '' })
      setShowCreateForm(false)
      await fetchMoments()
      setUploadingCreate(false)
    } catch (err) {
      setError('Upload failed: ' + String(err))
      setUploadingCreate(false)
    }
  }

  function startEdit(m: Moment) {
    setEditingId(m.id)
    setEditFields({ title: m.title, description: m.description, category: m.category, section: m.section, caption: m.caption })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditFields({})
  }

  async function saveEdit(id: number) {
    const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(editFields)
    })
    if (res.ok) {
      await fetchMoments()
      cancelEdit()
    } else {
      const text = await res.text()
      setError('Update failed: ' + text)
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this item?')) return
    const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    })
    if (res.ok) fetchMoments()
  }

  function toggleSelect(id: number) {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  function selectAll() {
    if (selectedIds.size === moments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(moments.map(m => m.id)))
    }
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) {
      setError('Please select items to delete')
      return
    }
    if (!confirm(`Delete ${selectedIds.size} item(s)?`)) return

    setLoading(true)
    try {
      for (const id of selectedIds) {
        const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, {
          method: 'DELETE',
          headers: { 'x-admin-password': password }
        })
        if (!res.ok) {
          setError('Failed to delete some items')
          setLoading(false)
          await fetchMoments()
          return
        }
      }
      setSelectedIds(new Set())
      await fetchMoments()
      setLoading(false)
    } catch (err) {
      setError('Failed to delete items')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Moments Editor</h1>
      <p className="text-gray-600 mb-6">Create and manage moment items for the Moments landing page.</p>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Moments Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Manage Moment Items</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-sage text-white rounded font-semibold"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Moment'}
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={submitCreateForm} className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Create New Moment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., First Dance"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={createForm.category}
                  onChange={(e) => setCreateForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g., Reception"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Add details about this moment..."
                className="w-full border px-3 py-2 rounded"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Caption</label>
              <input
                type="text"
                value={createForm.caption}
                onChange={(e) => setCreateForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Short caption for moments section"
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Upload Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {createForm.previewUrl && (
                <div className="mt-3">
                  <img src={createForm.previewUrl} alt="Preview" className="w-full h-48 object-cover rounded" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploadingCreate}
                className="px-4 py-2 bg-blush text-white rounded font-semibold disabled:opacity-50"
              >
                {uploadingCreate ? 'Uploading...' : 'Create Moment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  if (createForm.previewUrl) URL.revokeObjectURL(createForm.previewUrl)
                  setCreateForm({ title: '', description: '', category: '', caption: '', file: null, previewUrl: '' })
                }}
                className="px-4 py-2 bg-gray-300 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Moments List */}
        {loading ? (
          <div>Loading moments...</div>
        ) : moments.length === 0 ? (
          <div className="text-gray-500">No moments uploaded yet. Create one using the button above.</div>
        ) : (
          <div>
            <div className="mb-4 flex gap-2 items-center">
              <button
                onClick={selectAll}
                className="px-3 py-2 bg-blue-500 text-white rounded font-semibold text-sm"
              >
                {selectedIds.size === moments.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.size > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-2 bg-red-500 text-white rounded font-semibold text-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moments.map(m => (
              <div key={m.id} className={`border rounded-lg overflow-hidden shadow ${
                selectedIds.has(m.id) ? 'ring-2 ring-blue-500' : ''
              }`}>
                <div className="relative h-48 bg-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    className="absolute top-2 left-2 w-5 h-5 cursor-pointer z-10"
                  />
                  <img
                    src={(m.image?.startsWith('/') ? API_BASE : '') + m.image}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {editingId === m.id ? (
                  <div className="p-4 space-y-3">
                    <input
                      value={String(editFields.title || '')}
                      onChange={(e) => setEditFields(f => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                    <textarea
                      value={String(editFields.description || '')}
                      onChange={(e) => setEditFields(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description"
                      className="w-full border px-2 py-1 rounded text-sm"
                      rows={2}
                    />
                    <input
                      value={String(editFields.category || '')}
                      onChange={(e) => setEditFields(f => ({ ...f, category: e.target.value }))}
                      placeholder="Category"
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                    <input
                      value={String(editFields.caption || '')}
                      onChange={(e) => setEditFields(f => ({ ...f, caption: e.target.value }))}
                      placeholder="Caption"
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(m.id)}
                        className="flex-1 px-2 py-1 bg-sage text-white rounded text-sm font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-2 py-1 bg-gray-300 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">
                      {m.title || '(no title)'}
                    </h3>
                    {m.caption && (
                      <p className="text-xs font-medium text-blue-600 mb-2 bg-blue-50 p-1 rounded">
                        Caption: {m.caption}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mb-2">{m.description}</p>
                    <p className="text-xs text-gray-500 mb-3 italic">
                      {m.category || '(no category)'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(m)}
                        className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
