"use client"

import MomentBlock from '../../components/MomentBlock'
import { highlightMoments } from '../../data/albums'
import { useEffect, useState } from 'react'

interface Moment {
  id: number
  title: string
  description: string
  image: string
}

export default function Moments(){
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [moments, setMoments] = useState<Moment[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [placeholders, setPlaceholders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData(){
      try {
        setLoading(true)
        // Fetch moments
        const res = await fetch(`${API_BASE}/api/moments`)
        if (res.ok) {
          const data = await res.json()
          const momentList: Moment[] = data.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            image: m.image
          }))
          setMoments(momentList)
        }
        
        // Fetch hero images and placeholders from settings
        const settingsRes = await fetch(`${API_BASE}/api/settings`)
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          const heroes: string[] = []
          for(let i=1;i<=3;i++){
            const img = settings[`moments:hero:${i}`]
            if(img) heroes.push(img)
          }
          setHeroImages(heroes.length > 0 ? heroes : [])

          const placeholdersArr: string[] = []
          for(let i=1;i<=8;i++){
            const p = settings[`moments:placeholder:${i}`]
            placeholdersArr.push(p || '')
          }
          setPlaceholders(placeholdersArr)
        }
        
        setLoading(false)
      } catch (e) { 
        console.error(e)
        setLoading(false)
      }
    }
    fetchData()
  }, [API_BASE])

  return (
    <main className="min-h-screen bg-floral">
      {/* Hero Images Section */}
      <section className="py-4 lg:py-6">
        <div className="container mx-auto px-5 max-w-[1000px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[1000px] mx-auto">
            {heroImages.length > 0
              ? heroImages.map((img, idx) => (
                  <div key={idx} className="relative h-56 md:h-64 rounded-md overflow-hidden shadow-sm group">
                    <img
                      src={(img?.startsWith('/') ? API_BASE : '') + img}
                      alt={`hero-${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))
              : [0, 1, 2].map((idx) => (
                  <div key={idx} className="relative h-56 md:h-64 rounded-md overflow-hidden shadow-sm group">
                    <img
                      src={highlightMoments[idx % highlightMoments.length]}
                      alt={`hero-${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* Header + Subtitle Section */}
      <section className="py-4 lg:py-6 border-b border-gray-200">
        <div className="container mx-auto px-5 max-w-[1000px]">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-serif mb-5 text-gray-800">
              Capturing Timeless Wedding Memories
            </h1>
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-6 font-light">
              A carefully curated collection of moments — candid smiles, quiet vows, and joyful celebrations.
            </p>
            <a href="/gallery" className="px-8 py-3 bg-gradient-to-r from-amber-200 to-amber-300 text-gray-700 rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block">
              View Full Gallery
            </a>
          </div>
        </div>
      </section>

      {/* Moments Blocks */}
      <section className="py-4 lg:py-6">
        <div className="container mx-auto px-5 max-w-[1000px]">
          {loading ? (
            <div className="text-center py-6">
              <p className="text-gray-600">Loading moments...</p>
            </div>
          ) : moments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">No moments yet. Check back soon!</p>
            </div>
          ) : (
            moments.map((moment, index) => {
              // Group every 4 moments into a block
              if (index % 4 !== 0) return null
              
              const blockMoments = moments.slice(index, index + 4)
              const blockIndex = Math.floor(index / 4)
              
              const imagesForBlock = [0,1,2,3].map(i => {
                const img = blockMoments[i]?.image
                if (img) return img
                const placeholderIndex = blockIndex * 4 + i
                return placeholders[placeholderIndex] || ''
              })

              return (
                <div key={blockIndex} className={blockIndex > 0 ? 'border-t border-gray-200 pt-4 lg:pt-6' : ''}>
                  <MomentBlock
                    id={blockIndex}
                    title={blockMoments[0]?.title || ''}
                    description={blockMoments[0]?.description || ''}
                    images={imagesForBlock}
                    index={blockIndex}
                    API_BASE={API_BASE}
                    onViewGallery={() => {
                      window.location.href = '/gallery'
                    }}
                  />
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-amber-100 to-amber-50 border-t border-gray-200">
        <div className="container mx-auto px-5 max-w-[1000px] text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-4 text-gray-800">
            Ready to Capture Your Special Day?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto font-light">
            Let us tell the story of your love through our lens.
          </p>
          <a href="/contact" className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block">
            Get in Touch
          </a>
        </div>
      </section>
    </main>
  )
}
