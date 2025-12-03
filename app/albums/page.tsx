"use client"

import { useEffect, useState } from 'react'
import HeroSection from '../../components/HeroSection'
import AlbumSectionCard from '../../components/AlbumSectionCard'
import ImageGrid from '../../components/ImageGrid'
import { albums, highlightMoments } from '../../data/albums'

export default function Albums(){
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [settings, setSettings] = useState<Record<string,string>>({})

  useEffect(()=>{ fetchSettings() }, [])

  async function fetchSettings(){
    try{
      const res = await fetch(`${API_BASE}/api/settings`)
      if(res.ok){ const sd = await res.json(); setSettings(sd) }
    }catch(e){ }
  }

  // Ordered per request: pre-wedding, save the date, madhuramveppu, engagement, wedding
  const albumsList = [
    { key: 'preWedding', title: 'Pre-Wedding', description: 'Getting ready', href: '/pre-wedding' },
    { key: 'saveTheDate', title: 'Save the Date', description: 'Our first promise', href: '/save-the-date' },
    { key: 'madhuramveppu', title: 'Madhuramveppu', description: 'Afterparty moments', href: '/madhuramveppu' },
    { key: 'engagement', title: 'Engagement', description: 'Rings and smiles', href: '/engagement' },
    { key: 'wedding', title: 'Wedding', description: 'The big day', href: '/wedding' },
    { key: 'promiseOfAThousandTomorrows', title: 'Promise of a Thousand Tomorrows', description: 'A long promise', href: '/promise-of-a-thousand-tomorrows' }
  ]

  function coverFor(key:string){
    const settingKey = `album:cover:${key}`
    const v = settings[settingKey]
    if(v && v !== '') return v.startsWith('/') ? (API_BASE + v) : v
    const albumArr = (albums as any)[key]
    if(albumArr && albumArr.length > 0) return albumArr[0]
    return '/images/placeholder.jpg'
  }

  return (
    <div className="space-y-8">
      <HeroSection />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albumsList.map(a => (
            <AlbumSectionCard key={a.key} title={a.title} description={a.description} href={a.href} image={coverFor(a.key)} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Best Moments</h3>
        <p className="text-sm text-gray-600 mb-4">Hand-picked highlights from across all albums.</p>
        <ImageGrid images={highlightMoments} />
      </section>

      <section className="mt-8">
        <div className="flex gap-3">
          <a href="/moments" className="px-4 py-2 bg-sage text-white rounded shadow">Moments</a>
          <a href="/gallery" className="px-4 py-2 bg-gold text-white rounded shadow">Gallery</a>
          <a href="/about" className="px-4 py-2 bg-blush text-white rounded shadow">About Us</a>
        </div>
      </section>
    </div>
  )
}
