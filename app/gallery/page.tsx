"use client"

import { useEffect, useState } from 'react'
import ImageGrid from '../../components/ImageGrid'
import { allImages } from '../../data/albums'

interface Moment {
  id: number
  image: string
  title?: string
  [key: string]: any
}

export default function Gallery(){
  const [images, setImages] = useState<string[]>(allImages)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function load(){
      try{
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
        const res = await fetch(`${API_BASE}/api/moments`)
        if(!res.ok) {
          setLoading(false)
          return
        }
        const data: Moment[] = await res.json()
        const uploaded = (data || []).map((m) => (m.image && m.image.startsWith('/') ? `${API_BASE}${m.image}` : m.image))
        setImages([...uploaded, ...allImages])
        setLoading(false)
      }catch(err){ 
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-gray-100 to-gray-50 py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl">
          <div className="mb-4 text-sm tracking-widest uppercase text-gray-500">
            Wedding Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-quadrian mb-4 text-gray-900">
            Every Moment
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            A complete collection of candid moments, romantic details, and joyful celebrations capturing the essence of our special day.
          </p>
          <div className="flex items-center gap-2 text-gray-400 justify-center">
            <span className="w-8 h-px bg-gray-300"></span>
            <span className="text-xs tracking-widest uppercase">{images.length} Images</span>
            <span className="w-8 h-px bg-gray-300"></span>
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="w-full bg-white px-4 py-12 md:py-16">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading gallery...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">No images found.</div>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid group relative overflow-hidden rounded-sm shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`Gallery image ${idx + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer Section */}
      <section className="bg-black text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-quadrian mb-3 tracking-tight">
            Let's Create Your Story
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Every photograph tells a story. Let us capture the moments that matter most to us.
          </p>
          <a href="/albums" className="inline-block px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300">
            View More
          </a>
        </div>
      </section>
    </main>
  )
}
