"use client"

import Image from 'next/image'
import ImageGrid from '../../components/ImageGrid'
import { highlightMoments } from '../../data/albums'
import { useEffect, useState } from 'react'

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

export default function Moments(){
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
  const [c1, setC1] = useState({ title: 'Laura & James', description: 'An intimate city ceremony full of warmth and laughter — portraits captured against classic architecture and golden light.', featured: '' })
  const [c2, setC2] = useState({ title: 'Maria & Josh', description: 'Romantic portraits and candid details — a delicate editorial style to remember the day.', featured: '' })
  const [uploadedMoments, setUploadedMoments] = useState<Moment[]>([])

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`${API_BASE}/api/settings`)
        if(!res.ok) return
        const s = await res.json()
        if(s['moments:couple1:title']) setC1(c => ({...c, title: s['moments:couple1:title']}))
        if(s['moments:couple1:description']) setC1(c => ({...c, description: s['moments:couple1:description']}))
        if(s['moments:couple1:featured']) setC1(c => ({...c, featured: s['moments:couple1:featured'].startsWith('/') ? `${API_BASE}${s['moments:couple1:featured']}` : s['moments:couple1:featured']}))
        if(s['moments:couple2:title']) setC2(c => ({...c, title: s['moments:couple2:title']}))
        if(s['moments:couple2:description']) setC2(c => ({...c, description: s['moments:couple2:description']}))
        if(s['moments:couple2:featured']) setC2(c => ({...c, featured: s['moments:couple2:featured'].startsWith('/') ? `${API_BASE}${s['moments:couple2:featured']}` : s['moments:couple2:featured']}))
      }catch(e){ }
    }
    load()
  }, [])

  useEffect(()=>{
    async function fetchMoments(){
      try{
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok) return
        const data: Moment[] = await res.json()
        setUploadedMoments(data.reverse())
      }catch(e){ }
    }
    fetchMoments()
  }, [])

  return (
    <main className="container mx-auto py-12">
      {/* Hero collage */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="relative h-64 md:h-[420px] overflow-hidden rounded">
          <Image src={highlightMoments[0]} alt="hero-1" fill className="object-cover" unoptimized />
        </div>
        <div className="relative h-64 md:h-[420px] overflow-hidden rounded">
          <Image src={highlightMoments[1]} alt="hero-2" fill className="object-cover" unoptimized />
        </div>
        <div className="relative h-64 md:h-[420px] overflow-hidden rounded">
          <Image src={highlightMoments[2]} alt="hero-3" fill className="object-cover" unoptimized />
        </div>
      </section>

      {/* Title and intro */}
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-quadrian mb-4">Capturing Timeless Wedding Memories</h1>
        <p className="text-gray-600 mb-6">A carefully curated collection of moments — candid smiles, quiet vows, and joyful celebrations. Browse by section or view the full gallery.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/gallery" className="px-6 py-2 bg-sage text-white rounded">View Gallery</a>
        </div>
      </section>

      {/* Couple sections (two example sections) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-3">{c1.title}</h2>
          <p className="text-gray-600 mb-4">{c1.description}</p>
          <a href="/albums" className="inline-block px-4 py-2 bg-blush text-white rounded">View Gallery</a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative h-40 overflow-hidden rounded">
            {uploadedMoments[0] ? <img src={(uploadedMoments[0].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[0].image} alt="m-0" className="w-full h-full object-cover" /> : <Image src={highlightMoments[0]} alt="l-j-1" fill className="object-cover" unoptimized />}
          </div>
          <div className="relative h-40 overflow-hidden rounded">
            {uploadedMoments[1] ? <img src={(uploadedMoments[1].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[1].image} alt="m-1" className="w-full h-full object-cover" /> : <Image src={highlightMoments[1]} alt="l-j-2" fill className="object-cover" unoptimized />}
          </div>
          <div className="relative h-40 overflow-hidden rounded">
            {uploadedMoments[2] ? <img src={(uploadedMoments[2].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[2].image} alt="m-2" className="w-full h-full object-cover" /> : <Image src={highlightMoments[2]} alt="l-j-3" fill className="object-cover" unoptimized />}
          </div>
          <div className="relative h-40 overflow-hidden rounded">
            {uploadedMoments[3] ? <img src={(uploadedMoments[3].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[3].image} alt="m-3" className="w-full h-full object-cover" /> : <Image src={highlightMoments[0]} alt="l-j-4" fill className="object-cover" unoptimized />}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-40 overflow-hidden rounded">
              {uploadedMoments[4] ? <img src={(uploadedMoments[4].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[4].image} alt="m-4" className="w-full h-full object-cover" /> : <Image src={highlightMoments[1]} alt="m-1" fill className="object-cover" unoptimized />}
            </div>
            <div className="relative h-40 overflow-hidden rounded">
              {uploadedMoments[5] ? <img src={(uploadedMoments[5].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[5].image} alt="m-5" className="w-full h-full object-cover" /> : <Image src={highlightMoments[2]} alt="m-2" fill className="object-cover" unoptimized />}
            </div>
            <div className="relative h-40 overflow-hidden rounded">
              {uploadedMoments[6] ? <img src={(uploadedMoments[6].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[6].image} alt="m-6" className="w-full h-full object-cover" /> : <Image src={highlightMoments[0]} alt="m-3" fill className="object-cover" unoptimized />}
            </div>
            <div className="relative h-40 overflow-hidden rounded">
              {uploadedMoments[7] ? <img src={(uploadedMoments[7].image?.startsWith('/') ? API_BASE : '') + uploadedMoments[7].image} alt="m-7" className="w-full h-full object-cover" /> : <Image src={highlightMoments[1]} alt="m-4" fill className="object-cover" unoptimized />}
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-2xl font-semibold mb-3">{c2.title}</h2>
          <p className="text-gray-600 mb-4">{c2.description}</p>
          <a href="/albums" className="inline-block px-4 py-2 bg-sage text-white rounded">View Gallery</a>
        </div>
      </section>

      {/* Highlight grid */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Highlights</h3>
        {uploadedMoments.length > 0 ? (
          <ImageGrid images={uploadedMoments.map(m => (m.image?.startsWith('/') ? API_BASE : '') + m.image)} />
        ) : (
          <ImageGrid images={highlightMoments} />
        )}
      </section>
    </main>
  )
}
