"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import HeroSection from '../../components/HeroSection'

import ImageGrid from '../../components/ImageGrid'
import { albums, highlightMoments, albumCovers, momentsButtonImage, galleryButtonImage, getCoverImageUrl, getButtonImageUrl } from '../../data/albums'

interface Moment {
  id: number
  title: string
  description: string
  image: string
  category?: string
  section?: string
}

interface BestMomentGroup {
  mainMoment: Moment
  relatedMoments: Moment[]
}

export default function Albums(){
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [bestMomentGroups, setBestMomentGroups] = useState<BestMomentGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ 
    fetchSettings()
    fetchBestMoments()
  }, [])

  async function fetchSettings(){
    try{
      const res = await fetch(`${API_BASE}/api/settings`)
      if(res.ok){ const sd = await res.json(); setSettings(sd) }
    }catch(e){ }
  }

  async function fetchBestMoments(){
    try{
      setLoading(true)
      const [settingsRes, momentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/settings`),
        fetch(`${API_BASE}/api/moments`)
      ])
      
      if(settingsRes.ok && momentsRes.ok){
        const currentSettings = await settingsRes.json()
        const allMoments: Moment[] = await momentsRes.json()
        
        const bestIds = [1,2,3,4].map(n => currentSettings[`home:best:${n}`]).filter(Boolean)
        if(bestIds.length && allMoments.length){
          const groups: BestMomentGroup[] = []
          
          bestIds.forEach((id:any) => {
            const mid = typeof id === 'string' && /^[0-9]+$/.test(id) ? parseInt(id,10) : id
            const mainMoment = allMoments.find((x: Moment)=> x.id === mid || String(x.id) === String(id))
            if(!mainMoment) return
            
            // Find all moments with the same title (they belong to the same group)
            const relatedMoments = allMoments.filter((m: Moment) => 
              m.title === mainMoment.title && m.id !== mainMoment.id
            ).slice(0, 3) // Get up to 3 additional images for the collage
            
            const withBase = (img?: string) => {
              if (!img) return '/images/placeholder.jpg'
              return img.startsWith('/') ? `${API_BASE}${img}` : img
            }
            
            groups.push({
              mainMoment: {
                id: mainMoment.id,
                title: mainMoment.title || '',
                description: mainMoment.description || '',
                image: withBase(mainMoment.image),
                category: mainMoment.category || 'Featured Love Story',
                section: mainMoment.section
              },
              relatedMoments: relatedMoments.map((m: Moment) => ({
                id: m.id,
                title: m.title || '',
                description: m.description || '',
                image: withBase(m.image),
                category: m.category || '',
                section: m.section
              }))
            })
          })
          
          setBestMomentGroups(groups)
        }
      }
    }catch(e){
      console.error('Failed to load best moments', e)
    }finally{
      setLoading(false)
    }
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
    return getCoverImageUrl(key, API_BASE)
  }



  return (
    <div className="pt-20 space-y-8">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-sm py-4">
        <div className="flex justify-between items-center px-6">
          <div className="font-quadrian text-2xl text-gray-800">Aleena & Jobin</div>
          <nav className="flex space-x-8">
            <a href="/albums" className="text-gray-600 hover:text-gray-800 transition-colors">Home</a>
            <a href="/moments" className="text-gray-600 hover:text-gray-800 transition-colors">Moments</a>
            <a href="/gallery" className="text-gray-600 hover:text-gray-800 transition-colors">Gallery</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-800 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      <HeroSection />

      <section>
        <h2 className="text-3xl font-serif text-center text-gray-800 mb-8">Our Love Story</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {albumsList.map(a => (
            <div key={a.key} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="aspect-[4/5] relative">
                <img src={coverFor(a.key)} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-serif mb-2 group-hover:text-rose-200 transition-colors duration-300">{a.title}</h3>
                <p className="text-sm opacity-90 mb-4">{a.description}</p>
                <a href={a.href} className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-light hover:bg-white/30 transition-all duration-300">
                  Explore
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 py-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">Best Moments</h2>
          <p className="text-gray-600 text-sm">Hand-picked highlights from our special moments</p>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading best moments...</div>
        ) : bestMomentGroups.length > 0 ? (
          <div className="space-y-10">
            {bestMomentGroups.map((group, idx) => (
              <BestMomentShowcase
                key={group.mainMoment.id}
                moment={group.mainMoment}
                relatedImages={group.relatedMoments.map(m => m.image)}
                reversed={idx % 2 === 1}
              />
            ))}
            <div className="text-center pt-4">
              <Link 
                href="/moments" 
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#b39176] text-[#b39176] uppercase text-xs tracking-[0.3em] hover:bg-[#b39176] hover:text-white transition-all duration-300"
              >
                More Moments
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No best moments selected yet.</p>
            <p className="text-sm">Admin can select best moments in the admin panel → Home → Best Moments.</p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a href="/moments" className="group relative block h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <img src={getButtonImageUrl('moments', API_BASE)} alt="Moments" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-all duration-300">
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-4xl md:text-5xl font-quadrian mb-2 group-hover:text-rose-200 transition-colors duration-300">Moments</h2>
                <p className="text-base opacity-90 mb-4">Beautiful portfolio moments</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-light hover:bg-white/30 transition-all duration-300">
                  View Collection
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
          <a href="/gallery" className="group relative block h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <img src={getButtonImageUrl('gallery', API_BASE)} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-all duration-300">
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-4xl md:text-5xl font-quadrian mb-2 group-hover:text-rose-200 transition-colors duration-300">Gallery</h2>
                <p className="text-base opacity-90 mb-4">Complete photo collection</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-light hover:bg-white/30 transition-all duration-300">
                  View All Photos
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8">
        <div className="text-center">
          <div className="font-quadrian text-3xl text-gray-800 mb-4">Aleena & Jobin</div>
          <p className="text-gray-600 mb-6">Forever begins with our love story</p>
          <div className="flex justify-center space-x-6 text-gray-500">
            <span className="text-sm">© 2024 Our Wedding</span>
            <span className="text-sm">•</span>
            <span className="text-sm">Made with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BestMomentShowcase({
  moment,
  relatedImages,
  reversed
}: {
  moment: Moment
  relatedImages: string[]
  reversed?: boolean
}) {
  // Build collage: main image + up to 3 related images, fallback to highlightMoments if needed
  const collageImages = React.useMemo(() => {
    const images = [moment.image, ...relatedImages].slice(0, 4)
    while (images.length < 4) {
      if (highlightMoments.length === 0) {
        images.push('/images/placeholder.jpg')
      } else {
        images.push(highlightMoments[images.length % highlightMoments.length])
      }
    }
    return images
  }, [moment.image, relatedImages])

  return (
    <article className="grid md:grid-cols-2 gap-4 lg:gap-6 items-center max-w-5xl mx-auto px-4">
      <div className={`bg-white shadow-[0_5px_20px_rgba(149,128,104,0.12)] p-5 lg:p-6 ${reversed ? 'order-2 md:order-1' : ''}`}>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
          {moment.category || 'Featured Love Story'}
        </p>
        <h2 className="text-xl lg:text-2xl font-serif text-gray-800 mb-3">
          {moment.title || 'Special Moment'}
        </h2>
        <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-3">
          {moment.description || 'A beautiful moment captured in time.'}
        </p>
        <Link
          href="/moments"
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-[#b39176] text-[#b39176] uppercase text-[10px] tracking-[0.2em] hover:bg-[#b39176] hover:text-white transition-all duration-300"
        >
          View More
        </Link>
      </div>
      <div className={`grid grid-cols-2 gap-2 ${reversed ? 'order-1 md:order-2' : ''}`}>
        {collageImages.map((img, idx) => (
          <div 
            key={idx} 
            className={`overflow-hidden rounded-sm ${idx === 0 ? 'row-span-2 h-40 md:h-52' : 'h-20 md:h-24'} group`}
          >
            <img 
              src={img} 
              alt={`${moment.title} - ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </article>
  )
}
