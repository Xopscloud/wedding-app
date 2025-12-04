"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { albums } from '../../data/albums'

interface Moment {
  id: number
  image: string
  title?: string
  section?: string
  [key: string]: any
}

export default function Engagement(){
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [images, setImages] = useState<string[]>(albums.engagement)
  const [allMoments, setAllMoments] = useState<Moment[]>([])
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok) {
          setLoading(false)
          return
        }
        const data: Moment[] = await res.json()
        const sectionImages = (data || [])
          .filter((m) => (m.section || '').toLowerCase() === 'engagement')
          .map((m) => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setAllMoments(data)
        setImages([...sectionImages, ...albums.engagement])
        setLoading(false)
        try{ const sres = await fetch(`${API_BASE}/api/settings`); if(sres.ok){ const sd = await sres.json(); setSettings(sd) } }catch(e){}
      }catch(err){ 
        setLoading(false)
      }
    }
    load()
  }, [])

  const coverSetting = settings['album:cover:engagement'] || ''
  const heroImage = coverSetting ? (coverSetting.startsWith('/') ? `${API_BASE}${coverSetting}` : coverSetting) : (images[0] || albums.engagement[0])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative w-full h-80 md:h-96 lg:h-[500px] overflow-hidden group">
        <img
          src={heroImage}
          alt="Engagement Hero"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-sm tracking-widest uppercase text-white/70 mb-3">
              In Love
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-quadrian text-white mb-4">
              Engagement Sessions
            </h1>
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-white/50"></span>
              <span className="text-xs tracking-widest uppercase text-white/70">{images.length} Moments</span>
              <span className="w-12 h-px bg-white/50"></span>
            </div>
          </div>
        </div>
      </section>

      {/* All Images Grid */}
      <section className="w-full bg-gray-50 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-quadrian text-gray-900 mb-4">
              All Engagement Moments
            </h2>
            <p className="text-gray-600">Beautiful captures of our love story</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading images...</div>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid group relative overflow-hidden rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Engagement moment ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-quadrian mb-4">
            Our Engagement Story
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            The beginning of forever captured in every frame, every smile, every moment of joy.
          </p>
          <a href="/gallery" className="inline-block px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300 font-medium">
            View Full Gallery
          </a>
        </div>
      </section>
    </main>
  )
}
