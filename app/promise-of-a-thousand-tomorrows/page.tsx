"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function PromiseOfAThousandTomorrows(){
  const [images, setImages] = useState<string[]>((albums as any).promiseOfAThousandTomorrows || [])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok){ setLoading(false); return }
        const data = await res.json()
        const sectionImages = (data || [])
          .filter((m:any) => (m.section || '').toLowerCase() === 'promise')
          .map((m:any) => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setImages([...sectionImages, ...((albums as any).promiseOfAThousandTomorrows || [])])
      }catch(e){}
      setLoading(false)
    }
    load()
  }, [])

  const heroImage = images[0] || ((albums as any).promiseOfAThousandTomorrows || [])[0] || '/images/landing/DSC03522.JPG'

  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full h-80 md:h-96 lg:h-[500px] overflow-hidden group">
        <img src={heroImage} alt="Promise Hero" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-sm tracking-widest uppercase text-white/70 mb-3">Promise</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-quadrian text-white mb-4">Promise of a Thousand Tomorrows</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-white/50"></span>
              <span className="text-xs tracking-widest uppercase text-white/70">{images.length} Moments</span>
              <span className="w-12 h-px bg-white/50"></span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-50 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-quadrian text-gray-900 mb-4">Promise of a Thousand Tomorrows</h2>
            <p className="text-gray-600">A special collection of moments that celebrate long promises and quiet vows.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96"><div className="text-gray-500">Loading images...</div></div>
          ) : (
            <div>
              <ImageGrid images={images} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
