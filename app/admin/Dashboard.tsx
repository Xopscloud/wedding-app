"use client"

import { useState, useEffect } from 'react'

interface Stats {
  totalMoments: number
  totalAlbums: number
  totalSettings: number
  recentUploads: number
}

export default function Dashboard({ API_BASE, password, onNavigate }: { API_BASE: string, password: string, onNavigate: (view: string, subView?: string) => void }) {
  const [stats, setStats] = useState<Stats>({ totalMoments: 0, totalAlbums: 6, totalSettings: 0, recentUploads: 0 })
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online')

  useEffect(() => {
    loadStats()
    checkSystemStatus()
  }, [])

  async function loadStats() {
    try {
      const pass = localStorage.getItem('adminPass') || password
      
      // Get moments count
      const momentsRes = await fetch(`${API_BASE}/api/admin/moments`, { 
        headers: { 'x-admin-password': pass } 
      })
      const moments = momentsRes.ok ? await momentsRes.json() : []
      
      // Get settings count
      const settingsRes = await fetch(`${API_BASE}/api/settings`)
      const settings = settingsRes.ok ? await settingsRes.json() : {}
      
      // Count recent uploads (last 24 hours)
      const recent = moments.filter((m: any) => {
        const created = new Date(m.createdAt)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return created > dayAgo
      }).length

      setStats({
        totalMoments: moments.length,
        totalAlbums: 6,
        totalSettings: Object.keys(settings).length,
        recentUploads: recent
      })
    } catch (err) {
      console.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  async function checkSystemStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/settings`)
      setSystemStatus(res.ok ? 'online' : 'offline')
    } catch {
      setSystemStatus('offline')
    }
  }

  async function clearCache() {
    if (!confirm('Clear all cached data? This will refresh the application.')) return
    localStorage.clear()
    window.location.reload()
  }

  async function exportData() {
    try {
      const pass = localStorage.getItem('adminPass') || password
      const [momentsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/moments`, { headers: { 'x-admin-password': pass } }),
        fetch(`${API_BASE}/api/settings`)
      ])
      
      const data = {
        moments: momentsRes.ok ? await momentsRes.json() : [],
        settings: settingsRes.ok ? await settingsRes.json() : {},
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wedding-app-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed')
    }
  }

  const quickActions = [
    { label: 'Upload Media', icon: '📁', action: () => onNavigate('upload') },
    { label: 'Manage Albums', icon: '🖼️', action: () => onNavigate('albums') },
    { label: 'Edit Moments', icon: '✨', action: () => onNavigate('moments', 'manage') },
    { label: 'Home Settings', icon: '🏠', action: () => onNavigate('home') },
    { label: 'Export Data', icon: '💾', action: exportData },
    { label: 'Clear Cache', icon: '🗑️', action: clearCache }
  ]

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">System Status</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            systemStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {systemStatus === 'online' ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.totalMoments}</div>
          <div className="text-sm text-gray-600">Total Moments</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalAlbums}</div>
          <div className="text-sm text-gray-600">Albums</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{loading ? '...' : stats.totalSettings}</div>
          <div className="text-sm text-gray-600">Settings</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.recentUploads}</div>
          <div className="text-sm text-gray-600">Recent Uploads</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">System Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>API Base:</span>
            <span className="font-mono text-gray-600">{API_BASE}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span className="text-gray-600">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-gray-600">Database + File System</span>
          </div>
        </div>
      </div>
    </div>
  )
}