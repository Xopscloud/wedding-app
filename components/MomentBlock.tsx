"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface MomentBlockProps {
  id: number
  title: string
  description: string
  images: string[]
  index: number
  API_BASE: string
  onViewGallery?: () => void
}

export default function MomentBlock({
  id,
  title,
  description,
  images,
  index,
  API_BASE,
  onViewGallery
}: MomentBlockProps) {
  const [isVisible, setIsVisible] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const isAlternate = index % 2 === 1

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )

    if (blockRef.current) {
      observer.observe(blockRef.current)
    }

    return () => {
      if (blockRef.current) {
        observer.unobserve(blockRef.current)
      }
    }
  }, [])

  const textContent = (
    <div className={`flex flex-col justify-center ${isAlternate ? 'lg:pl-6' : 'lg:pr-6'}`}>
      <div className={isVisible ? 'animate-slide-left' : 'opacity-0'}>
        <h2 className="text-2xl lg:text-4xl font-serif font-light italic mb-3 text-gray-700 leading-tight">
          {title}
        </h2>
        <p className="text-sm lg:text-base text-gray-700 leading-relaxed mb-4 font-light tracking-wide">
          {description}
        </p>
        <div>
          <button
            onClick={onViewGallery}
            className="inline-block px-6 py-2 bg-[#d8cdbd] text-gray-800 rounded-full font-semibold hover:shadow-md transition-all duration-300"
          >
            View Gallery
          </button>
        </div>
      </div>
    </div>
  )

  const imageGrid = (
    <div className={`grid grid-cols-2 gap-2 lg:gap-4 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      {[0, 1, 2, 3].map((idx) => {
        const img = images[idx]
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-md shadow-sm bg-gray-100 group aspect-square ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            } transition-all duration-500`}
            style={{ transitionDelay: `${idx * 120}ms` }}
          >
            <div className="w-full h-full relative">
              {img ? (
                <img
                  src={(img?.startsWith('/') ? API_BASE : '') + img}
                  alt={`${title} - moment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-xs">Image {idx + 1}</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <section
      ref={blockRef}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 items-center py-6 lg:py-16 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-700`}
      style={{ paddingLeft: '0', paddingRight: '0' }}
    >
      {isAlternate ? (
        <>
          <div className="order-2 lg:order-1">
            {imageGrid}
          </div>
          <div className="order-1 lg:order-2">
            {textContent}
          </div>
        </>
      ) : (
        <>
          <div>
            {textContent}
          </div>
          <div>
            {imageGrid}
          </div>
        </>
      )}
    </section>
  )
}
