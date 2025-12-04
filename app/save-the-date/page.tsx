"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export default function SaveTheDate(){
  const [images, setImages] = useState<string[]>(albums.saveTheDate)
  const [settings, setSettings] = useState<Record<string,string>>({})

  useEffect(() => {
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok) return
        const data = await res.json()
        const sectionImages = (data || [])
          .filter((m:any) => (m.section || '').toLowerCase() === 'save-the-date')
          .map((m:any) => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setImages([...sectionImages, ...albums.saveTheDate])
      }catch(err){ }
    }
    load()
  }, [])

  useEffect(()=>{
    async function loadSettings(){
      try{
        const sres = await fetch(`${API_BASE}/api/settings`)
        if(sres.ok){ const sd = await sres.json(); setSettings(sd) }
      }catch(e){}
    }
    loadSettings()
  }, [])

  const [title, setTitle] = useState<string>('Save The Date')
  const [subtitle, setSubtitle] = useState<string>('Annie & Rob | Taradale, Victoria')
  const [photoCount, setPhotoCount] = useState<number>(109)

  useEffect(()=>{
    async function loadSettings(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/settings`)
        if(!res.ok) return
        const data = await res.json()
        if(data['save_the_date:title']) setTitle(data['save_the_date:title'])
        if(data['save_the_date:subtitle']) setSubtitle(data['save_the_date:subtitle'])
        if(data['save_the_date:count']) {
          const n = parseInt(data['save_the_date:count'], 10)
          if(!isNaN(n)) setPhotoCount(n)
        }
      }catch(e){}
    }
    loadSettings()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-12">
        <div className="relative w-full h-[56vh] md:h-[64vh] rounded overflow-hidden shadow-lg">
          <Image src={ (settings['album:cover:saveTheDate'] ? (settings['album:cover:saveTheDate'].startsWith('/') ? `${API_BASE}${settings['album:cover:saveTheDate']}` : settings['album:cover:saveTheDate']) : (images[0] || '/images/landing/DSC03522.JPG')) } alt="Save the Date" fill className="object-cover" unoptimized />
        </div>
        <div className="mt-6 flex items-start gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-serif">{title}</h1>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className="w-36 text-right text-sm text-gray-500">
            <div className="text-2xl font-medium">{photoCount}</div>
            <div className="uppercase tracking-wide">Photos</div>
            <button className="mt-3 px-3 py-1 border rounded text-sm">View Gallery</button>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Portfolio Highlight</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div className="lg:col-span-2">
            <div className="w-full h-64 rounded overflow-hidden shadow-sm">
              <Image src={images[1] || images[0] || '/images/landing/DSC03522.JPG'} alt="highlight" width={1200} height={800} className="object-cover w-full h-full" unoptimized />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full h-28 rounded overflow-hidden shadow-sm">
              <Image src={images[2] || images[0]} alt="thumb" width={600} height={400} className="object-cover w-full h-full" unoptimized />
            </div>
            <div className="w-full h-28 rounded overflow-hidden shadow-sm">
              <Image src={images[3] || images[0]} alt="thumb2" width={600} height={400} className="object-cover w-full h-full" unoptimized />
            </div>
          </div>
          <div className="hidden lg:block w-full h-36 rounded overflow-hidden shadow-sm">
            <Image src={images[4] || images[0]} alt="side" width={400} height={600} className="object-cover w-full h-full" unoptimized />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-center uppercase text-gray-400 tracking-widest mb-8">Featured Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded overflow-hidden shadow">
            <Image src={images[5] || images[0]} alt="feat1" width={1400} height={900} className="object-cover w-full h-80" unoptimized />
          </div>
          <div className="rounded overflow-hidden shadow">
            <Image src={images[6] || images[0]} alt="feat2" width={1400} height={900} className="object-cover w-full h-80" unoptimized />
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-medium mb-4">More Photos</h4>
        <ImageGrid images={images} />
      </section>
    </div>
  )
}
