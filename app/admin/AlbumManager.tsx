"use client"

import { useState, useEffect } from 'react'

interface AlbumImage {
  id: string
  url: string
  order: number
}

interface Album {
  key: string
  title: string
  images: AlbumImage[]
}

export default function AlbumManager({ API_BASE, password }: { API_BASE: string, password: string }) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [uploadingAlbum, setUploadingAlbum] = useState<string | null>(null)

  const ALBUM_KEYS = [
    { key: 'preWedding', title: 'Pre-Wedding' },
    { key: 'saveTheDate', title: 'Save the Date' },
    { key: 'madhuramveppu', title: 'Madhuramveppu' },
    { key: 'engagement', title: 'Engagement' },
    { key: 'wedding', title: 'Wedding' },
    { key: 'promiseOfAThousandTomorrows', title: 'Promise of a Thousand Tomorrows' }
  ]

  useEffect(() => {
    loadAlbums()
  }, [])

  async function loadAlbums() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/settings`)
      if (!res.ok) return
      const settings = await res.json()
      
      const albumData: Album[] = ALBUM_KEYS.map(({ key, title }) => {
        const images: AlbumImage[] = []
        let i = 0
        while (settings[`album:${key}:${i}`]) {
          images.push({
            id: `${key}-${i}`,
            url: settings[`album:${key}:${i}`],
            order: i
          })
          i++
        }
        return { key, title, images }
      })
      
      setAlbums(albumData)
    } catch (err) {
      setMessage('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(albumKey: string, file: File) {
    setUploadingAlbum(albumKey)
    try {
      const pass = localStorage.getItem('adminPass') || password
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch(`${API_BASE}/api/moments`, {
        method: 'POST',
        headers: { 'x-admin-password': pass },
        body: formData
      })
      
      if (!res.ok) {
        setMessage('Upload failed')
        return
      }
      
      const result = await res.json()
      const album = albums.find(a => a.key === albumKey)
      if (!album) return
      
      const nextIndex = album.images.length
      await saveSetting(`album:${albumKey}:${nextIndex}`, result.image)
      
      setMessage('Image uploaded successfully')
      loadAlbums()
    } catch (err) {
      setMessage('Upload failed')
    } finally {
      setUploadingAlbum(null)
    }
  }

  async function uploadMultiple(albumKey: string, files: File[]) {
    if (files.length === 0) return
    
    setUploadingAlbum(albumKey)
    try {
      const pass = localStorage.getItem('adminPass') || password
      const album = albums.find(a => a.key === albumKey)
      if (!album) return
      
      let successCount = 0
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('image', files[i])
        
        const res = await fetch(`${API_BASE}/api/moments`, {
          method: 'POST',
          headers: { 'x-admin-password': pass },
          body: formData
        })
        
        if (res.ok) {
          const result = await res.json()
          const nextIndex = album.images.length + successCount
          await saveSetting(`album:${albumKey}:${nextIndex}`, result.image)
          successCount++
        }
      }
      
      setMessage(`Uploaded ${successCount} of ${files.length} images`)
      loadAlbums()
    } catch (err) {
      setMessage('Multiple upload failed')
    } finally {
      setUploadingAlbum(null)
    }
  }

  async function removeImage(albumKey: string, imageIndex: number) {
    if (!confirm('Remove this image?')) return
    
    try {
      const album = albums.find(a => a.key === albumKey)
      if (!album) return
      
      // Remove the image at the specified index
      await saveSetting(`album:${albumKey}:${imageIndex}`, '')
      
      // Shift remaining images down
      for (let i = imageIndex + 1; i < album.images.length; i++) {
        const nextImage = album.images[i]
        await saveSetting(`album:${albumKey}:${i - 1}`, nextImage.url)
      }
      
      // Clear the last slot
      await saveSetting(`album:${albumKey}:${album.images.length - 1}`, '')
      
      setMessage('Image removed')
      loadAlbums()
    } catch (err) {
      setMessage('Remove failed')
    }
  }

  async function changeImage(albumKey: string, imageIndex: number, file: File) {
    setUploadingAlbum(`${albumKey}-${imageIndex}`)
    try {
      const pass = localStorage.getItem('adminPass') || password
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch(`${API_BASE}/api/moments`, {
        method: 'POST',
        headers: { 'x-admin-password': pass },
        body: formData
      })
      
      if (!res.ok) {
        setMessage('Upload failed')
        return
      }
      
      const result = await res.json()
      await saveSetting(`album:${albumKey}:${imageIndex}`, result.image)
      
      setMessage('Image updated')
      loadAlbums()
    } catch (err) {
      setMessage('Update failed')
    } finally {
      setUploadingAlbum(null)
    }
  }

  async function moveImage(albumKey: string, fromIndex: number, toIndex: number) {
    const album = albums.find(a => a.key === albumKey)
    if (!album || fromIndex === toIndex) return
    
    try {
      const fromImage = album.images[fromIndex]
      const toImage = album.images[toIndex]
      
      await saveSetting(`album:${albumKey}:${fromIndex}`, toImage.url)
      await saveSetting(`album:${albumKey}:${toIndex}`, fromImage.url)
      
      setMessage('Images reordered')
      loadAlbums()
    } catch (err) {
      setMessage('Reorder failed')
    }
  }

  async function saveSetting(key: string, value: string) {
    const pass = localStorage.getItem('adminPass') || password
    await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
      body: JSON.stringify({ key, value })
    })
  }

  return (
    <div className="space-y-6">
      {message && <div className="p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}
      
      {loading ? (
        <div className="text-center py-6">Loading albums...</div>
      ) : (
        <div className="space-y-8">
          {albums.map(album => (
            <div key={album.key} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{album.title}</h3>
                  <p className="text-sm text-gray-600">{album.images.length} images</p>
                </div>
                <div className="flex gap-2">
                  <label className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-colors flex items-center gap-2">
                    <span>➕</span>
                    {uploadingAlbum === album.key ? 'Uploading...' : 'Add Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingAlbum === album.key}
                      onChange={(e) => e.target.files?.[0] && uploadImage(album.key, e.target.files[0])}
                    />
                  </label>
                  
                  <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>📁</span>
                    Add Multiple
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingAlbum === album.key}
                      onChange={(e) => e.target.files && uploadMultiple(album.key, Array.from(e.target.files))}
                    />
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {album.images.map((image, idx) => (
                    <div key={image.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={image.url.startsWith('/') ? `${API_BASE}${image.url}` : image.url}
                            alt={`${album.title} ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="text-sm font-medium text-gray-700">
                            Image {idx + 1}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <label className="px-3 py-1 bg-blue-500 text-white text-xs rounded cursor-pointer hover:bg-blue-600 transition-colors">
                              {uploadingAlbum === `${album.key}-${idx}` ? 'Uploading...' : '🔄 Change'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingAlbum === `${album.key}-${idx}`}
                                onChange={(e) => e.target.files?.[0] && changeImage(album.key, idx, e.target.files[0])}
                              />
                            </label>
                            
                            <button
                              onClick={() => removeImage(album.key, idx)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            >
                              🗑️ Remove
                            </button>
                            
                            {idx > 0 && (
                              <button
                                onClick={() => moveImage(album.key, idx, idx - 1)}
                                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                              >
                                ⬆️ Move Up
                              </button>
                            )}
                            
                            {idx < album.images.length - 1 && (
                              <button
                                onClick={() => moveImage(album.key, idx, idx + 1)}
                                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                              >
                                ⬇️ Move Down
                              </button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Position: {idx + 1} of {album.images.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {album.images.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <p>No images in this album yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}