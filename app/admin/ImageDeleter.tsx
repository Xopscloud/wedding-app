"use client"

import { useState, useEffect } from 'react'

interface Moment {
  id: number
  title: string
  description: string
  image: string
  section?: string
}

export default function ImageDeleter({ API_BASE, password }: { API_BASE: string, password: string }) {
  const [moments, setMoments] = useState<Moment[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const pass = localStorage.getItem('adminPass') || password
      
      const [momentsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': pass } }),
        fetch(`${API_BASE}/api/settings`)
      ])
      
      if (momentsRes.ok) setMoments(await momentsRes.json())
      if (settingsRes.ok) setSettings(await settingsRes.json())
    } catch (err) {
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function deleteMoment(id: number) {
    if (!confirm('Delete this image permanently?')) return
    
    setDeleting(`moment-${id}`)
    try {
      const pass = localStorage.getItem('adminPass') || password
      const res = await fetch(`${API_BASE}/api/admin/moments/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pass }
      })
      
      if (res.ok) {
        setMessage('Image deleted')
        loadData()
      } else {
        setMessage('Delete failed')
      }
    } catch (err) {
      setMessage('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  async function deleteSetting(key: string) {
    if (!confirm('Remove this image from settings?')) return
    
    setDeleting(`setting-${key}`)
    try {
      const pass = localStorage.getItem('adminPass') || password
      await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
        body: JSON.stringify({ key, value: '' })
      })
      
      setMessage('Setting cleared')
      loadData()
    } catch (err) {
      setMessage('Clear failed')
    } finally {
      setDeleting(null)
    }
  }

  const settingsImages = Object.entries(settings).filter(([key, value]) => 
    value && (value.includes('.jpg') || value.includes('.png') || value.includes('.jpeg') || value.includes('.webp'))
  )

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded ${message.includes('failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading images...</div>
      ) : (
        <>
          {/* Moments by Section */}
          {['moments', 'wedding', 'engagement', 'pre-wedding', 'save-the-date', 'madhuramveppu', 'gallery', 'albums'].map(section => {
            const sectionMoments = moments.filter(m => (m.section || 'moments') === section)
            if (sectionMoments.length === 0) return null
            
            return (
              <div key={section} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 capitalize">{section.replace('-', ' ')} ({sectionMoments.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sectionMoments.map(moment => (
                    <div key={moment.id} className="relative group">
                      <img
                        src={moment.image.startsWith('/') ? `${API_BASE}${moment.image}` : moment.image}
                        alt={moment.title}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => deleteMoment(moment.id)}
                        disabled={deleting === `moment-${moment.id}`}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === `moment-${moment.id}` ? '...' : '×'}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {moment.title || `ID: ${moment.id}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Album Images */}
          {['preWedding', 'saveTheDate', 'madhuramveppu', 'engagement', 'wedding', 'promiseOfAThousandTomorrows'].map(albumKey => {
            const albumImages = settingsImages.filter(([key]) => key.startsWith(`album:${albumKey}:`))
            if (albumImages.length === 0) return null
            
            const albumTitle = albumKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            
            return (
              <div key={albumKey} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">{albumTitle} Album ({albumImages.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {albumImages.map(([key, value]) => (
                    <div key={key} className="relative group">
                      <img
                        src={value.startsWith('/') ? `${API_BASE}${value}` : value}
                        alt={key}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => deleteSetting(key)}
                        disabled={deleting === `setting-${key}`}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === `setting-${key}` ? '...' : '×'}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {key.split(':')[2] || 'Cover'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Other Settings */}
          {(() => {
            const otherSettings = settingsImages.filter(([key]) => 
              !key.startsWith('album:') && 
              !key.startsWith('moments:') &&
              !key.startsWith('home:')
            )
            if (otherSettings.length === 0) return null
            
            return (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Other Settings ({otherSettings.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {otherSettings.map(([key, value]) => (
                    <div key={key} className="relative group">
                      <img
                        src={value.startsWith('/') ? `${API_BASE}${value}` : value}
                        alt={key}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => deleteSetting(key)}
                        disabled={deleting === `setting-${key}`}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === `setting-${key}` ? '...' : '×'}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {key}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}