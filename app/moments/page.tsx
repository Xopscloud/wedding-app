"use client"

import { highlightMoments } from '../../data/albums'
import { useEffect, useMemo, useState } from 'react'

interface Moment {
  id: number
  title: string
  description: string
  image: string
  category?: string
}

export default function Moments() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [moments, setMoments] = useState<Moment[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const withBase = (img?: string) => {
    if (!img) return ''
    return img.startsWith('/') ? `${API_BASE}${img}` : img
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [momentsRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/moments`),
          fetch(`${API_BASE}/api/settings`)
        ])

        if (momentsRes.ok) {
          const data = await momentsRes.json()
          setMoments(
            data.map((m: any) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              image: m.image,
              category: m.category || 'Real Weddings'
            }))
          )
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          const heroes: string[] = []
          for (let i = 1; i <= 3; i++) {
            const img = settings[`moments:hero:${i}`]
            if (img) heroes.push(img)
          }
          setHeroImages(heroes)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [API_BASE])

  const heroGrid = useMemo(() => {
    if (heroImages.length > 0) return heroImages.map(withBase)
    return highlightMoments.slice(0, 3)
  }, [heroImages])

  const groupedMoments = useMemo(() => {
    const groups: Moment[][] = []
    for (let i = 0; i < moments.length; i += 4) {
      groups.push(moments.slice(i, i + 4))
    }
    return groups
  }, [moments])

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-gray-900">
      {/* Hero grid */}
      <section className="bg-[#d9d0c4]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <nav className="flex flex-wrap items-center justify-center text-sm uppercase tracking-[0.3em] text-gray-700 mb-6">
            <span className="font-serif text-xl tracking-[0.2em]">Our Moments</span>
          </nav>
          <div className="grid md:grid-cols-3 gap-4">
            {heroGrid.map((img, idx) => (
              <div key={idx} className="h-64 md:h-80 overflow-hidden">
                <img
                  src={img}
                  alt={`hero-${idx}`}
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto text-center px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Capturing Timeless Wedding Memories
          </h1>
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            Authentic love stories photographed with an editorial touch. From dawn vows to candlelit receptions, we preserve every detail so you can relive it forever.
          </p>
        </div>
      </section>

      {/* Moment sections */}
      <section className="space-y-16 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading moments...</div>
          ) : groupedMoments.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No stories yet. Check back soon.</div>
          ) : (
            groupedMoments.map((group, idx) => (
              <MomentShowcase
                key={group[0]?.id || idx}
                moment={group[0]}
                images={buildCollageImages(group, highlightMoments, idx, withBase)}
                reversed={idx % 2 === 1}
              />
            ))
          )}
        </div>
      </section>

      <footer className="bg-[#bfb19e] py-6 text-center text-xs tracking-[0.4em] uppercase text-white">
        {/* footer intentionally minimal, no external advertising */}
      </footer>
    </main>
  )
}

function buildCollageImages(
  group: Moment[],
  fallbacks: string[],
  groupIndex: number,
  withBase: (img?: string) => string
) {
  return Array.from({ length: 4 }).map((_, idx) => {
    const img = group[idx]?.image
    if (img) return withBase(img)
    return fallbacks[(groupIndex * 4 + idx) % fallbacks.length]
  })
}

function MomentShowcase({
  moment,
  images,
  reversed
}: {
  moment?: Moment
  images: string[]
  reversed?: boolean
}) {
  return (
    <article className="grid md:grid-cols-2 gap-8 items-center">
      <div className={`bg-white shadow-[0_10px_30px_rgba(149,128,104,0.15)] p-8 ${reversed ? 'order-2 md:order-1' : ''}`}>
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">
          {moment?.category || 'Featured Love Story'}
        </p>
        <h2 className="text-3xl font-serif text-gray-800 mb-4">
          {moment?.title || 'Laura & James'}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {moment?.description ||
            'Croissant oat cake sugar plum truffle chocolate cake. Fruitcake apple pie caramels bourbon chocolate sweet roll tart. Timeless romance captured at golden hour.'}
        </p>
        <a
          href="/gallery"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#b39176] text-[#b39176] uppercase text-xs tracking-[0.3em]"
        >
          View Gallery
        </a>
      </div>
      <div className={`grid grid-cols-2 gap-3 ${reversed ? 'order-1 md:order-2' : ''}`}>
        {images.map((img, idx) => (
          <div key={idx} className={`overflow-hidden rounded-sm ${idx === 0 ? 'row-span-2 h-64 md:h-80' : 'h-40 md:h-48'}`}>
            <img src={img} alt={`moment-${idx}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </article>
  )
}
