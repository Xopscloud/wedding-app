"use client"

import { useState, useRef, DragEvent } from 'react'

interface FileWithPreview {
  id: string
  file: File
  preview: string
  title: string
  description: string
  category: string
  caption: string
}

export default function ImageUploader({ API_BASE, password, selectedSection }: { 
  API_BASE: string, 
  password: string, 
  selectedSection: string 
}) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const filesWithPreview = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      title: '',
      description: '',
      category: '',
      caption: ''
    }))
    setFiles(prev => [...prev, ...filesWithPreview])
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  const updateFile = (id: string, field: keyof FileWithPreview, value: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ))
  }

  const uploadAll = async () => {
    if (files.length === 0) {
      setMessage('Please select images to upload')
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const pass = localStorage.getItem('adminPass') || password
      const formData = new FormData()
      
      files.forEach(f => formData.append('images', f.file))
      
      const metadata = files.map(f => ({
        title: f.title,
        description: f.description,
        category: f.category,
        caption: f.caption,
        section: selectedSection
      }))
      
      formData.append('metadata', JSON.stringify(metadata))

      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: 'POST',
        headers: { 'x-admin-password': pass },
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      setMessage(`Successfully uploaded ${files.length} images!`)
      
      // Clean up
      files.forEach(f => URL.revokeObjectURL(f.preview))
      setFiles([])
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
      
    } catch (err) {
      setMessage('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl">📸</div>
          <div>
            <h3 className="text-lg font-semibold">Drop images here</h3>
            <p className="text-gray-600">or click to browse</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Choose Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded ${
          message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{files.length} Images Selected</h3>
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map(file => (
              <div key={file.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={file.preview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>

                  {/* File Info & Inputs */}
                  <div className="flex-1 space-y-2">
                    <div className="text-sm text-gray-600 truncate">
                      {file.file.name}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Title"
                      value={file.title}
                      onChange={(e) => updateFile(file.id, 'title', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    
                    <input
                      type="text"
                      placeholder="Description"
                      value={file.description}
                      onChange={(e) => updateFile(file.id, 'description', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Category"
                        value={file.category}
                        onChange={(e) => updateFile(file.id, 'category', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      />
                      
                      {selectedSection === 'moments' && (
                        <input
                          type="text"
                          placeholder="Caption"
                          value={file.caption}
                          onChange={(e) => updateFile(file.id, 'caption', e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}