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

      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/moments" className="group relative block h-56 md:h-72 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <img src={settings['moments:hero:1'] ? (settings['moments:hero:1'].startsWith('/') ? `${API_BASE}${settings['moments:hero:1']}` : settings['moments:hero:1']) : highlightMoments[0]} alt="Moments" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="text-center text-white">
                <h2 className="text-3xl md:text-4xl font-quadrian mb-2">Moments</h2>
                <p className="text-sm opacity-90">Beautiful portfolio moments</p>
              </div>
            </div>
          </a>
          <a href="/gallery" className="group relative block h-56 md:h-72 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <img src={highlightMoments[1] || highlightMoments[0]} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
              <div className="text-center text-white">
                <h2 className="text-3xl md:text-4xl font-quadrian mb-2">Gallery</h2>
                <p className="text-sm opacity-90">Complete photo collection</p>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  )
}
