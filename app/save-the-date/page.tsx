"use client"

import { useEffect, useMemo, useState } from 'react'
import { albums } from '../../data/albums'

interface SaveTheDateDetails {
  heading: string
  names: string
  inviteLine: string
  date: string
  time: string
  location: string
  rsvp?: string
}

export default function SaveTheDate() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [collageImages, setCollageImages] = useState<string[]>(albums.saveTheDate.slice(0, 4))
  const [details, setDetails] = useState<SaveTheDateDetails>({
    heading: 'Save The Date',
    names: 'Mandy & Martin',
    inviteLine: 'Invite you to their wedding celebration',
    date: 'Saturday, 22.03.2028',
    time: 'At 4:00 pm',
    location: '123 Anywhere St, Any City',
    rsvp: 'Formal invitation to follow'
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
            .filter((m: any) => (m.section || '').toLowerCase() === 'save-the-date')
            .map((m: any) =>
              m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image
            )
          const combined = [...sectionImages, ...albums.saveTheDate]
          if (combined.length > 0) {
            setCollageImages(combined.slice(0, 4))
          }
        }

        if (settingsRes.ok) {
          const sd = await settingsRes.json()
          setDetails(prev => ({
            heading: sd['save_the_date:heading'] || prev.heading,
            names: sd['save_the_date:names'] || prev.names,
            inviteLine: sd['save_the_date:invite'] || prev.inviteLine,
            date: sd['save_the_date:date'] || prev.date,
            time: sd['save_the_date:time'] || prev.time,
            location: sd['save_the_date:location'] || prev.location,
            rsvp: sd['save_the_date:rsvp'] || prev.rsvp
          }))
        }
      } catch (err) {
        console.error('Failed to load save-the-date content', err)
      }
    }

    loadData()
  }, [API_BASE])

  const gridImages = useMemo(() => {
    const base = [...collageImages]
    while (base.length < 8) {
      base.push(albums.saveTheDate[base.length % albums.saveTheDate.length])
    }
    return base.slice(0, 8)
  }, [collageImages])

  return (
    <main className="min-h-screen bg-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header (no external advertising) */}
        <header className="text-center mb-4">
          <h1 className="font-quadrian text-4xl sm:text-5xl text-gray-800 mb-1">
            {details.heading}
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500">
            {details.names}
          </p>
        </header>

        {/* Masonry-like collage grid */}
        <section className="mt-10 mb-12 grid grid-cols-3 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 flex items-center justify-center text-center text-[11px] leading-relaxed text-gray-600 h-60">
              <div>
                <p className="uppercase tracking-[0.25em] text-xs mb-3">{details.heading}</p>
                <p className="font-serif text-lg mb-2">{details.names}</p>
                <p className="text-[11px]">{details.inviteLine}</p>
              </div>
            </div>
            <img src={gridImages[0]} className="w-full h-52 object-cover" alt="save-1" />
            <img src={gridImages[1]} className="w-full h-64 object-cover" alt="save-2" />
          </div>

          {/* Middle column */}
          <div className="space-y-4">
            <img src={gridImages[2]} className="w-full h-40 object-cover" alt="save-3" />
            <img src={gridImages[3]} className="w-full h-64 object-cover" alt="save-4" />
            <img src={gridImages[4]} className="w-full h-40 object-cover" alt="save-5" />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <img src={gridImages[5]} className="w-full h-56 object-cover" alt="save-6" />
            <img src={gridImages[6]} className="w-full h-48 object-cover" alt="save-7" />
            <div className="bg-gray-100 p-4 flex items-center justify-center text-center text-[11px] leading-relaxed text-gray-600 h-60">
              <div>
                <p className="uppercase tracking-[0.25em] text-xs mb-2">Wedding</p>
                <p className="font-serif text-sm mb-2">
                  {details.date} &bull; {details.time}
                </p>
                <p className="text-[11px] mb-2">{details.location}</p>
                {details.rsvp && <p className="text-[11px] italic">{details.rsvp}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Footer strip */}
        <footer className="flex justify-between text-[11px] text-gray-500 mt-8 border-t border-gray-200 pt-6">
          <div className="w-1/3 pr-4">
            <p className="uppercase tracking-[0.25em] text-xs mb-2">About</p>
            <p>Lorem ipsum dolor sit amet, capturing precious memories in timeless monochrome.</p>
          </div>
          <div className="w-1/3 px-4">
            <p className="uppercase tracking-[0.25em] text-xs mb-2">Contact</p>
            <p>{details.names}</p>
            <p>+01 234 567 890</p>
          </div>
          <div className="w-1/3 pl-4 text-right">
            <p className="uppercase tracking-[0.25em] text-xs mb-2">Wedding</p>
            <p>{details.date}</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
