"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function Madhuramveppu(){
  const [images, setImages] = useState<string[]>(albums.madhuramveppu || [])

  useEffect(() => {
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok) return
        const data = await res.json()
        const sectionImages = (data || [])
          .filter((m:any) => (m.section || '').toLowerCase() === 'madhuramveppu' || (m.section || '').toLowerCase() === 'sweet-going')
          .map((m:any) => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setImages([...sectionImages, ...(albums.madhuramveppu || [])])
      }catch(err){ }
    }
    load()
  }, [])

  const [settings, setSettings] = useState<Record<string,string>>({})
  useEffect(()=>{
    async function s(){
      try{ const sres = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'}/api/settings`); if(sres.ok){ const sd = await sres.json(); setSettings(sd) } }catch(e){}
    }
    s()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Top small thumbnails */}
      <div className="relative mb-8">
        <div className={`bg-cover bg-center h-36 md:h-48 rounded overflow-hidden`} style={{ backgroundImage: `url(${ settings['album:cover:madhuramveppu'] ? (settings['album:cover:madhuramveppu'].startsWith('/') ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000') + settings['album:cover:madhuramveppu'] : settings['album:cover:madhuramveppu']) : '/images/landing/DSC03522.JPG' })` }}></div>
        <div className="mt-3 flex gap-3">
          {images.slice(0,4).map((src,i)=> (
            <div key={i} className="w-24 h-24 overflow-hidden rounded">
              <Image src={src} alt={`thumb-${i}`} width={120} height={120} className="object-cover w-full h-full" unoptimized />
            </div>
          ))}
        </div>
      </div>

      {/* Large grid - magic moments */}
      <section className="mb-8">
        <h2 className="text-center text-sm uppercase tracking-widest text-gray-500 mb-6">Magic Moments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="w-full h-64 rounded overflow-hidden">
              <Image src={images[0] || '/images/landing/DSC03522.JPG'} alt="large" width={1400} height={900} className="object-cover w-full h-full" unoptimized />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-32 overflow-hidden rounded">
              <Image src={images[1] || images[0] || '/images/landing/DSC03522.JPG'} alt="side1" width={600} height={400} className="object-cover w-full h-full" unoptimized />
            </div>
            <div className="w-full h-28 overflow-hidden rounded">
              <Image src={images[2] || images[0]} alt="side2" width={600} height={400} className="object-cover w-full h-full" unoptimized />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {images.slice(3,9).map((src,i)=> (
            <div key={i} className="w-full h-36 overflow-hidden rounded">
              <Image src={src} alt={`grid-${i}`} width={800} height={600} className="object-cover w-full h-full" unoptimized />
            </div>
          ))}
        </div>
      </section>

      {/* Description / story */}
      <section className="mb-12 text-center max-w-3xl mx-auto">
        <h3 className="text-xl font-serif mb-3">Madhuramveppu</h3>
        <p className="text-sm text-gray-600 mb-6">Introducing Madhuramveppu — a collection of soft, cinematic moments. Captured in quiet light and shy smiles, this gallery explores the subtler side of celebration.</p>
        <p className="text-sm text-gray-500">Weaving together intimate portraits and candid details, these images create a gentle narrative that lingers.</p>
      </section>

      {/* CTA hero */}
      <section className="relative rounded overflow-hidden">
        <div className="w-full h-64 bg-gray-800/60 flex items-center justify-center text-white text-2xl">Ready to capture the magic?</div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"></div>
      </section>
    </div>
  )
}
