"use client"

import { useEffect, useMemo, useState } from 'react'
import { albums } from '../../data/albums'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

interface WeddingDetails {
  heading: string
  quote: string
  date: string
}

export default function Wedding() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [collageImages, setCollageImages] = useState<string[]>(albums.wedding.slice(0, 4))
  const [details, setDetails] = useState<WeddingDetails>({
    heading: 'Happy Wedding',
    quote: 'In the end, love is all that matters.',
    date: 'February 2, 2025'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [momentsRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/moments`),
          fetch(`${API_BASE}/api/settings`)
        ])

        if (momentsRes.ok) {
          const data = await momentsRes.json()
          const sectionImages = (data || [])
            .filter((m: any) => (m.section || '').toLowerCase() === 'wedding')
            .map((m: any) =>
              m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image
            )
          const combined = [...sectionImages, ...albums.wedding]
          if (combined.length > 0) {
            setCollageImages(combined.slice(0, 4))
          }
        }

        if (settingsRes.ok) {
          const sd = await settingsRes.json()
          setDetails(prev => ({
            heading: sd['wedding:heading'] || prev.heading,
            quote: sd['wedding:quote'] || prev.quote,
            date: sd['wedding:date'] || prev.date
          }))
        }
      } catch (err) {
        console.error('Failed to load wedding page content', err)
      }
    }

    loadData()
  }, [API_BASE])

  const collage = useMemo(() => {
    if (collageImages.length < 4) {
      const fallback = [...collageImages]
      while (fallback.length < 4) {
        fallback.push(albums.wedding[fallback.length % albums.wedding.length])
      }
      return fallback
    }
    return collageImages.slice(0, 4)
  }, [collageImages])

  return (
    <main className="min-h-screen bg-[#dde3df] py-10 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full relative">
        {/* Top decorative heading */}
        <div className="text-center mb-8">
          <h1 className="font-quadrian text-4xl sm:text-5xl text-[#4a5644] tracking-wide">
            {details.heading}
          </h1>
        </div>

        {/* Four‑image collage laid out like the template */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {/* Left column: large portrait + small bouquet */}
          <div className="flex flex-col gap-4">
            <img
              src={collage[0]}
              alt="wedding 1"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <img
              src={collage[2]}
              alt="wedding 3"
              className="w-full h-40 object-cover"
            />
          </div>

          {/* Right column: large couple + full‑height portrait */}
          <div className="flex flex-col gap-4">
            <img
              src={collage[1]}
              alt="wedding 2"
              className="w-full h-60 sm:h-64 object-cover"
            />
            <img
              src={collage[3]}
              alt="wedding 4"
              className="w-full h-52 sm:h-60 object-cover"
            />
          </div>
        </div>

        {/* Quote + date */}
        <div className="text-center space-y-3 text-[#4b5248]">
          <p className="italic text-lg max-w-xl mx-auto">
            &quot;{details.quote}&quot;
          </p>
          <p className="text-base">{details.date}</p>
        </div>
      </div>
    </main>
  )
}
