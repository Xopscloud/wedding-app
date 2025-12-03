"use client"

import { useState, useEffect } from 'react'

interface MomentGroupFormProps {
  API_BASE: string
  password: string
  onSuccess?: () => void
}

interface FormData {
  title: string
  description: string
  section: string
  images: File[]
  previewUrls: string[]
}

export default function MomentGroupForm({ API_BASE, password, onSuccess }: MomentGroupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    section: 'moments',
    images: [],
    previewUrls: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalImages = formData.images.length + newFiles.length

    if (totalImages > 4) {
      setError(`Maximum 4 images allowed. You selected ${totalImages}`)
      return
    }

    const previews = newFiles.map(file => URL.createObjectURL(file))
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles],
      previewUrls: [...prev.previewUrls, ...previews]
    }))
    setError('')
  }

  function removeImage(index: number) {
    setFormData(prev => {
      URL.revokeObjectURL(prev.previewUrls[index])
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index)
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    if (formData.images.length === 0) {
      setError('Please upload at least 1 image')
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      formData.images.forEach((file) => {
        formDataToSend.append('images', file)
      })

      const metadata = formData.images.map((_, idx) => ({
        title: idx === 0 ? formData.title : `${formData.title} - ${idx + 1}`,
        description: idx === 0 ? formData.description : '',
        category: formData.section,
        section: formData.section,
        caption: `Image ${idx + 1} of ${formData.images.length}`
      }))

      formDataToSend.append('metadata', JSON.stringify(metadata))

      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: 'POST',
        headers: { 'x-admin-password': password },
        body: formDataToSend
      })

      if (!res.ok) {
        const text = await res.text()
        setError('Upload failed: ' + text)
        setLoading(false)
        return
      }

      setSuccess(`Successfully uploaded ${formData.images.length} image(s)!`)
      
      // Reset form
      formData.previewUrls.forEach(url => URL.revokeObjectURL(url))
      setFormData({
        title: '',
        description: '',
        section: 'moments',
        images: [],
        previewUrls: []
      })

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }

      setLoading(false)
    } catch (err) {
      setError('Upload failed: ' + String(err))
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Create Moment Group</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload 1-4 images for a new moment group. The first image's title and description will be used for the group.
      </p>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Moment Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Laura & James"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this moment..."
            className="w-full border px-3 py-2 rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Section</label>
          <input
            type="text"
            value={formData.section}
            onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
            placeholder="e.g., moments, wedding, engagement"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Upload Images (1-4) *</label>
          <p className="text-xs text-gray-600 mb-2">
            {formData.images.length}/4 images uploaded
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={formData.images.length >= 4}
            className="w-full border px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Image Previews */}
        {formData.previewUrls.length > 0 && (
          <div>
            <label className="block text-sm font-semibold mb-2">Preview ({formData.images.length}/4)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.previewUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="w-full aspect-square object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="text-white text-sm">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-sage text-white rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Create Moment Group'}
        </button>
      </form>
    </div>
  )
}
