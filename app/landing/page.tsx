'use client'

"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Landing() {
  const router = useRouter()
  const [imgUrl, setImgUrl] = useState<string>('/images/landing/DSC03522.JPG')

  const openAlbums = () => {
    router.push('/albums')
  }

  useEffect(() => {
    async function load() {
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
      try {
        const res = await fetch(`${API_BASE}/api/settings/landing-image`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.image) {
          // ensure full URL if backend returns a relative path (e.g. /uploads/..)
          const img = data.image.startsWith('/') ? `${API_BASE}${data.image}` : data.image
          setImgUrl(img)
        }
      } catch (e) {
        // ignore and keep default
      }
    }
    load()
  }, [])

  return (
    <div className="fixed inset-0 bg-black overflow-hidden m-0 p-0">
      <Image
        src={imgUrl}
        alt="Landing"
        fill
        priority
        className="object-cover"
        unoptimized
        sizes="100vw"
      />

      {/* Names overlay as a centered single-line title + CTA button below */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform flex flex-col items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="whitespace-nowrap font-quadrian text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] mb-6">Aleena&nbsp;&amp;&nbsp;Jobin</div>
          <button onClick={openAlbums} aria-label="Explore moments" className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-base font-light tracking-wider hover:bg-white/30 transition-all duration-300 shadow-lg">Explore moments</button>
        </div>
      </div>

    </div>
  )
}

